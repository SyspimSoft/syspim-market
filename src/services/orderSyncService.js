/**
 * SYSPIM MARKET — ORDER SYNC SERVICE
 * ====================================
 * Fuente única de verdad para la reconciliación de pedidos entre:
 *   React State → localStorage → BroadcastChannel → Supabase
 *
 * Toda lectura, escritura y merge de pedidos DEBE pasar por este módulo.
 * Ningún componente debe hacer setPedidos(JSON.parse(localStorage...)) directamente.
 */

// ─── Status Ranking (único, inmutable) ───────────────────────────────
export const STATUS_RANK = Object.freeze({
  pendiente:   0,
  aceptado:    1,
  preparando:  2,
  despachado:  3,
  en_camino:   3,
  entregado:   4,
  completado:  4,
  rendido:     5,
  cancelado:   99
});

export function getStatusRank(status) {
  return STATUS_RANK[status] ?? -1;
}

// ─── Order Identity Matching ─────────────────────────────────────────
/**
 * Determina si dos objetos de pedido representan la misma orden,
 * independientemente del formato del ID (PED-XXXXX, D-XXXXX, UUID, etc.)
 */
export function isSameOrder(a, b) {
  if (!a || !b) return false;

  // 1. ID exacto
  if (a.id && b.id && a.id === b.id) return true;

  // 2. UUID exacto
  if (a.uuid && b.uuid && a.uuid === b.uuid) return true;

  // 3. Normalización alfanumérica
  const cleanA = String(a.id || a.uuid || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
  const cleanB = String(b.id || b.uuid || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();

  if (cleanA && cleanB) {
    if (cleanA === cleanB) return true;

    // 4. Comparación por sufijo numérico (últimos 6 dígitos)
    const numA = cleanA.replace(/[^0-9]/g, '');
    const numB = cleanB.replace(/[^0-9]/g, '');
    if (numA && numB && numA.length >= 4 && numB.length >= 4 && numA.slice(-6) === numB.slice(-6)) {
      return true;
    }
  }

  return false;
}

// ─── Single-Order Merge ──────────────────────────────────────────────
/**
 * Fusiona un pedido entrante con uno existente.
 * Regla: el estado más avanzado SIEMPRE gana.
 *
 * @param {Object} existing - Pedido que ya está en el estado local
 * @param {Object} incoming - Pedido que llega (de localStorage, Broadcast, Supabase, etc.)
 * @returns {Object} El pedido fusionado
 */
export function mergeOrder(existing, incoming) {
  if (!existing) return incoming;
  if (!incoming) return existing;

  const existingStatus = existing.estado || existing.status || 'pendiente';
  const incomingStatus = incoming.estado || incoming.status || 'pendiente';

  const existingRank = getStatusRank(existingStatus);
  const incomingRank = getStatusRank(incomingStatus);

  // El estado más avanzado gana
  const winnerStatus = incomingRank >= existingRank ? incomingStatus : existingStatus;

  return {
    ...existing,
    ...incoming,
    estado: winnerStatus,
    status: winnerStatus
  };
}

// ─── List Merge (reconciliación de listas completas) ─────────────────
/**
 * Fusiona una lista de pedidos entrantes con la lista local.
 * - Pedidos existentes se fusionan con mergeOrder (el status más alto gana).
 * - Pedidos nuevos se agregan al final.
 * - Nunca se eliminan pedidos.
 *
 * @param {Array} localList  - Lista actual (React state)
 * @param {Array} incomingList - Lista entrante (localStorage, Supabase, etc.)
 * @returns {Array} Lista fusionada
 */
export function mergeOrderList(localList, incomingList) {
  if (!Array.isArray(incomingList) || incomingList.length === 0) return localList;
  if (!Array.isArray(localList)) return incomingList;

  const merged = [...localList];

  incomingList.forEach(inc => {
    const idx = merged.findIndex(m => isSameOrder(m, inc));
    if (idx >= 0) {
      merged[idx] = mergeOrder(merged[idx], inc);
    } else {
      merged.push(inc);
    }
  });

  return merged;
}

// ─── localStorage Keys ───────────────────────────────────────────────
const LS_POS_KEY     = 'syspim_pos_pedidos';
const LS_DELIVERY_KEY = 'syspim_delivery_trips';
const LS_LAST_ORDER  = 'syspim_last_order';
const LS_QUEUE_KEY   = 'syspim_pending_orders_queue';
const BC_CHANNEL     = 'syspim_orders_channel';

// ─── Persistence ─────────────────────────────────────────────────────
/**
 * Persiste la lista de pedidos a ambas keys de localStorage.
 * Llamar SIEMPRE después de actualizar React state.
 */
export function persistToLocalStorage(orderList) {
  try {
    const json = JSON.stringify(orderList);
    localStorage.setItem(LS_POS_KEY, json);
    localStorage.setItem(LS_DELIVERY_KEY, json);
  } catch (e) {
    console.error('[OrderSync] Error persisting to localStorage:', e);
  }
}

/**
 * Lee la lista de pedidos desde localStorage, deduplicada.
 */
export function readFromLocalStorage() {
  try {
    const posStr = localStorage.getItem(LS_POS_KEY);
    const delStr = localStorage.getItem(LS_DELIVERY_KEY);
    let combined = [];
    if (posStr) {
      const parsed = JSON.parse(posStr);
      if (Array.isArray(parsed)) combined = [...parsed];
    }
    if (delStr) {
      const parsed = JSON.parse(delStr);
      if (Array.isArray(parsed)) combined = mergeOrderList(combined, parsed);
    }
    return combined;
  } catch (e) {
    return [];
  }
}

// ─── BroadcastChannel ────────────────────────────────────────────────
/**
 * Emite un STATUS_UPDATE por BroadcastChannel.
 */
export function broadcastStatusUpdate(order) {
  try {
    const bc = new BroadcastChannel(BC_CHANNEL);
    bc.postMessage({ type: 'STATUS_UPDATE', order });
    bc.close();
  } catch (e) {}
}

/**
 * Emite un NEW_ORDER por BroadcastChannel.
 */
export function broadcastNewOrder(order) {
  try {
    const bc = new BroadcastChannel(BC_CHANNEL);
    bc.postMessage({ type: 'NEW_ORDER', order });
    bc.close();
  } catch (e) {}
}

// ─── Supabase ────────────────────────────────────────────────────────
/**
 * Actualiza el estado de un pedido en Supabase (fire & forget).
 */
export function updateSupabaseStatus(order, newStatus) {
  const sbClient = (window.ColmadoSupabase && window.ColmadoSupabase.client) || window.supabaseClient;
  if (sbClient) {
    const id = order.uuid || order.id;
    sbClient.from('pedidos').update({ estado: newStatus }).eq('id', id).catch(() => {});
  }
}

// ─── Unified State Update ────────────────────────────────────────────
/**
 * Función maestra: actualiza el estado de un pedido en TODOS los niveles.
 *
 * Flujo:  React State → localStorage → BroadcastChannel → Supabase
 *
 * @param {Function} setOrders - React setState function (setPedidos o setTrips)
 * @param {Object}   order     - El pedido a actualizar
 * @param {string}   newStatus - El nuevo estado ('en_camino', 'entregado', etc.)
 * @param {Object}   [extraFields] - Campos adicionales para fusionar (evidence, etc.)
 * @returns {Array}  La lista actualizada (para uso externo)
 */
export function updateOrderStatus(setOrders, order, newStatus, extraFields = {}) {
  let resultList = [];

  setOrders(prev => {
    const nextList = prev.map(p => {
      if (isSameOrder(p, order)) {
        return { ...p, ...extraFields, estado: newStatus, status: newStatus };
      }
      return p;
    });
    resultList = nextList;
    persistToLocalStorage(nextList);
    return nextList;
  });

  const updatedOrder = { ...order, ...extraFields, estado: newStatus, status: newStatus };
  broadcastStatusUpdate(updatedOrder);
  updateSupabaseStatus(order, newStatus);

  return resultList;
}

// ─── Storage Event Handler Factory ───────────────────────────────────
/**
 * Crea un handler para el evento 'storage' que usa mergeOrder/mergeOrderList.
 * Nunca sobrescribe ciegamente — siempre fusiona con ranking de estados.
 *
 * @param {Function} setOrders      - React setState
 * @param {Function} onNewOrder     - Callback para pedidos individuales nuevos
 * @returns {Function} Event handler listo para window.addEventListener('storage', handler)
 */
export function createStorageHandler(setOrders, onNewOrder) {
  return (e) => {
    if (e.key === LS_LAST_ORDER && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && !Array.isArray(parsed) && onNewOrder) onNewOrder(parsed);
      } catch (err) {}
    } else if (e.key === LS_QUEUE_KEY && e.newValue) {
      try {
        const queue = JSON.parse(e.newValue);
        if (Array.isArray(queue) && onNewOrder) queue.forEach(ord => onNewOrder(ord));
      } catch (err) {}
    } else if ((e.key === LS_POS_KEY || e.key === LS_DELIVERY_KEY) && e.newValue) {
      try {
        const incoming = JSON.parse(e.newValue);
        if (Array.isArray(incoming)) {
          setOrders(prev => mergeOrderList(prev, incoming));
        }
      } catch (err) {}
    }
  };
}

/**
 * Crea un BroadcastChannel con un onmessage que:
 *  - NEW_ORDER    → onNewOrder callback
 *  - STATUS_UPDATE → merge + persist + onStatusUpdate callback opcional
 *
 * @param {Function} setOrders       - React setState
 * @param {Function} onNewOrder      - Callback para pedidos nuevos
 * @param {Function} [onStatusUpdate] - Callback opcional llamado después del merge (recibe el order actualizado)
 * @returns {BroadcastChannel|null}
 */
export function createBroadcastListener(setOrders, onNewOrder, onStatusUpdate) {
  try {
    const bc = new BroadcastChannel(BC_CHANNEL);
    bc.onmessage = (event) => {
      if (!event.data) return;

      if (event.data.type === 'NEW_ORDER' && event.data.order) {
        if (onNewOrder) onNewOrder(event.data.order);
      } else if (event.data.type === 'STATUS_UPDATE' && event.data.order) {
        const updated = event.data.order;
        setOrders(prev => {
          const nextList = prev.map(p =>
            isSameOrder(p, updated) ? mergeOrder(p, updated) : p
          );
          persistToLocalStorage(nextList);
          return nextList;
        });
        if (onStatusUpdate) onStatusUpdate(updated);
      } else if (event.data.type === 'STOCK_UPDATE' && event.data.payload) {
        // Stock updates are handled separately by each component
      }
    };
    return bc;
  } catch (e) {
    return null;
  }
}

// ─── Constants Export ─────────────────────────────────────────────────
export { LS_POS_KEY, LS_DELIVERY_KEY, LS_LAST_ORDER, LS_QUEUE_KEY, BC_CHANNEL };
