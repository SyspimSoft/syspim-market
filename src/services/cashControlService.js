/**
 * SYSPIM MARKET - CASH CONTROL SERVICE & DELIVERY BANK LEDGER
 * Gestor del Libro Mayor Bancario (TX-XXXX), saldos en tiempo real de repartidores y arqueos de 4 estados.
 */

const RECONCILIATIONS_STORAGE_KEY = 'syspim_courier_reconciliations';

export function getStoredCourierReconciliations() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    const saved = localStorage.getItem(RECONCILIATIONS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Error reading courier reconciliations from localStorage:', e);
    return {};
  }
}

export function saveStoredCourierReconciliation(repartidorId, reconciliationResult) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    const current = getStoredCourierReconciliations();
    const updated = {
      ...current,
      [repartidorId]: reconciliationResult
    };
    localStorage.setItem(RECONCILIATIONS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving courier reconciliation to localStorage:', e);
    return {};
  }
}

function getOrderKey(item) {
  if (!item) return '';
  if (item.uuid && String(item.uuid).includes('-') && String(item.uuid).length > 20) {
    return String(item.uuid).toLowerCase();
  }
  const rawId = String(item.id || '').trim().toLowerCase();
  if (rawId.startsWith('d-')) {
    return 'ped-' + rawId.slice(2);
  }
  return rawId;
}

/**
 * Helper para obtener todos los pedidos entregados (parámetro o localStorage)
 * Solo incluye pedidos con estado entregado/rendido/completado para el cuadre
 */
function getAllPedidos(pedidosParam = []) {
  let list = Array.isArray(pedidosParam) && pedidosParam.length > 0 ? pedidosParam : [];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Leer de ambas keys y fusionar
      const posStr = localStorage.getItem('syspim_pos_pedidos');
      const delStr = localStorage.getItem('syspim_delivery_trips');
      const combined = [];
      if (posStr) { const p = JSON.parse(posStr); if (Array.isArray(p)) combined.push(...p); }
      if (delStr) { const p = JSON.parse(delStr); if (Array.isArray(p)) combined.push(...p); }

      if (combined.length > 0) {
        const map = new Map();
        // merged list: localStorage takes precedence for status (more up to date)
        [...list, ...combined].forEach(item => {
          const key = getOrderKey(item);
          if (key) {
            if (map.has(key)) {
              const existing = map.get(key);
              const statusRank = { pendiente: 0, aceptado: 1, preparando: 2, en_camino: 3, despachado: 3, entregado: 4, completado: 4, rendido: 5, cancelado: 99 };
              const existingRank = statusRank[existing.estado || existing.status || 'pendiente'] || 0;
              const incomingRank = statusRank[item.estado || item.status || 'pendiente'] || 0;
              // Keep most advanced status
              const winner = incomingRank >= existingRank ? item : existing;
              const normId = (item.id && String(item.id).startsWith('PED-')) ? item.id : (existing.id || item.id);
              map.set(key, {
                ...existing,
                ...winner,
                id: normId,
                monto_pagado_con: winner.monto_pagado_con !== undefined && winner.monto_pagado_con !== null ? winner.monto_pagado_con : existing.monto_pagado_con,
                devuelta_cliente: winner.devuelta_cliente !== undefined && winner.devuelta_cliente !== null ? winner.devuelta_cliente : existing.devuelta_cliente
              });
            } else {
              map.set(key, item);
            }
          }
        });
        list = Array.from(map.values());
      }
    }
  } catch (e) {}
  return list;
}

/**
 * Genera el Libro Mayor (Delivery Ledger TX-XXXX) para un repartidor
 * @param {Object} params { repartidorId, pedidos }
 * @returns {Array} Registros de transacciones inmutables TX-XXXX
 */
export function getDeliveryLedger({ repartidorId = 'carlos', pedidos = [] }, ctx = {}) {
  const allPedidos = getAllPedidos(pedidos);

  // Transacciones base mock iniciales
  const baseLedger = [
    {
      txId: 'TX-001245',
      time: '09:15',
      type: 'COBRO_PEDIDO',
      reference: 'PED-550',
      description: 'Cobro pedido a domicilio',
      amount: 1000,
      courierId: 'carlos'
    },
    {
      txId: 'TX-001246',
      time: '09:18',
      type: 'CAMBIO_CLIENTE',
      reference: 'PED-550',
      description: 'Devuelta entregada al cliente',
      amount: -500,
      courierId: 'carlos'
    },
    {
      txId: 'TX-001247',
      time: '10:10',
      type: 'COBRO_PEDIDO',
      reference: 'PED-558',
      description: 'Cobro pedido a domicilio',
      amount: 1500,
      courierId: 'carlos'
    }
  ];

  const targetCourierId = (repartidorId || 'carlos').toLowerCase();

  let transactions = baseLedger.filter(tx => {
    if (targetCourierId === 'carlos' || targetCourierId === 'rep-1') return true;
    return (tx.courierId || '').toLowerCase() === targetCourierId;
  });

  let txCounter = 1248;
  // Solo procesar pedidos ENTREGADOS (entregado, rendido, completado)
  const DELIVERED_STATUSES = new Set(['entregado', 'rendido', 'completado']);
  allPedidos
    .filter(p => DELIVERED_STATUSES.has(p.estado || p.status || ''))
    .forEach(p => {
    const isEfectivo = (p.metodo_pago || '').toLowerCase().includes('efectivo') || !p.metodo_pago;
    if (!isEfectivo) return;

    const montoTotal = Number(p.monto_total || p.total || 0);
    if (montoTotal <= 0) return;

    const montoPagaCon = p.monto_pagado_con !== undefined && p.monto_pagado_con !== null
      ? Number(p.monto_pagado_con)
      : montoTotal;

    const devuelta = p.devuelta_cliente !== undefined && p.devuelta_cliente !== null
      ? Number(p.devuelta_cliente)
      : Math.max(0, montoPagaCon - montoTotal);

    let timeStr = '10:30';
    if (p.created_at) {
      try {
        timeStr = new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch(e){}
    }

    const orderRef = p.id || p.uuid || 'PED-XXX';
    const clientName = p.cliente_nombre || p.nombre || 'Cliente';

    // Transacción 1: Cobro Pedido
    transactions.push({
      txId: `TX-00${txCounter++}`,
      time: timeStr,
      type: 'COBRO_PEDIDO',
      reference: orderRef,
      description: `Cobro pedido a domicilio (${clientName})`,
      amount: montoPagaCon,
      courierId: p.repartidorId || 'carlos'
    });

    // Transacción 2: Devuelta (si hubo devuelta)
    if (devuelta > 0) {
      transactions.push({
        txId: `TX-00${txCounter++}`,
        time: timeStr,
        type: 'CAMBIO_CLIENTE',
        reference: orderRef,
        description: `Devuelta entregada al cliente (${clientName})`,
        amount: -devuelta,
        courierId: p.repartidorId || 'carlos'
      });
    }
  });

  let runningBalance = 0;
  return transactions.map(tx => {
    runningBalance += tx.amount;
    return {
      ...tx,
      balance: runningBalance
    };
  });
}

/**
 * Calcula los Saldos en Tiempo Real por Repartidor
 * @param {Object} params { pedidos }
 * @returns {Array} Lista de saldos por repartidor
 */
export function calculateCourierCashBalances({ pedidos = [] }, ctx = {}) {
  const stored = getStoredCourierReconciliations();
  const allPedidos = getAllPedidos(pedidos);
  const DELIVERED = new Set(['entregado', 'rendido', 'completado']);

  // Descubrir repartidores dinámicamente desde pedidos entregados
  const courierMap = new Map();

  allPedidos
    .filter(p => DELIVERED.has(p.estado || p.status || ''))
    .forEach(p => {
      const isEfectivo = (p.metodo_pago || '').toLowerCase().includes('efectivo') || !p.metodo_pago;
      if (!isEfectivo) return;
      const montoTotal = Number(p.monto_total || p.total || 0);
      if (montoTotal <= 0) return;

      const montoPagaCon = p.monto_pagado_con !== undefined && p.monto_pagado_con !== null
        ? Number(p.monto_pagado_con) : montoTotal;
      const devuelta = p.devuelta_cliente !== undefined && p.devuelta_cliente !== null
        ? Number(p.devuelta_cliente) : Math.max(0, montoPagaCon - montoTotal);
      const neto = montoPagaCon - devuelta;

      // Identificar repartidor
      const courierId = (p.repartidorId || p.delivery_id || 'general').toLowerCase();
      const courierNombre = p.repartidorNombre || p.delivery_nombre || courierId;

      if (!courierMap.has(courierId)) {
        courierMap.set(courierId, {
          id: courierId,
          nombre: courierNombre,
          dineroEsperado: 0,
          pedidosCount: 0,
          estado: 'PENDIENTE'
        });
      }
      const entry = courierMap.get(courierId);
      entry.dineroEsperado += neto;
      entry.pedidosCount += 1;
    });

  // Si no hay pedidos reales entregados, usar mocks para no mostrar vacío
  if (courierMap.size === 0) {
    courierMap.set('carlos', { id: 'carlos', nombre: 'Carlos Méndez', dineroEsperado: 0, pedidosCount: 0, estado: 'PENDIENTE' });
    courierMap.set('pedro',  { id: 'pedro',  nombre: 'Pedro Ramos',  dineroEsperado: 0, pedidosCount: 0, estado: 'PENDIENTE' });
  }

  const couriers = Array.from(courierMap.values());

  return couriers.map(c => {
    const rec = stored[c.id];
    let finalEstado = c.estado;
    if (rec) {
      if (rec.status === 'CUADRADO' && rec.dineroEsperado !== undefined && Number(rec.dineroEsperado) !== Number(c.dineroEsperado)) {
        finalEstado = 'PENDIENTE';
      } else {
        finalEstado = rec.status;
      }
    }
    return {
      ...c,
      ventasTotal: c.dineroEsperado,
      pedidosActivos: c.pedidosCount,
      estado: finalEstado,
      reconciliationResult: rec || null
    };
  });
}

/**
 * Concilia y Arquea el Cierre de Turno de un Repartidor (4 Estados)
 * @param {Object} params { repartidorId, dineroRecibido, dineroEsperado }
 * @returns {Object} { status, diff, message }
 * Statuses: 'CUADRADO' | 'FALTANTE' | 'SOBRANTE' | 'PENDIENTE'
 */
export function reconcileCourierShift({ repartidorId, dineroRecibido = 0, dineroEsperado = 0 }, ctx = {}) {
  const numRecibido = Number(dineroRecibido);
  const numEsperado = Number(dineroEsperado);
  const diff = numRecibido - numEsperado;

  if (diff === 0) {
    return {
      status: 'CUADRADO',
      icon: '✔',
      diff: 0,
      dineroRecibido: numRecibido,
      dineroEsperado: numEsperado,
      message: 'Cierre perfectamente cuadrado sin diferencias.'
    };
  }

  if (diff < 0) {
    return {
      status: 'FALTANTE',
      icon: '⚠️',
      diff: Math.abs(diff),
      dineroRecibido: numRecibido,
      dineroEsperado: numEsperado,
      message: `Descuadre: Existe un FALTANTE de RD$ ${Math.abs(diff).toFixed(2)}.`
    };
  }

  return {
    status: 'SOBRANTE',
    icon: '➕',
    diff: Math.abs(diff),
    dineroRecibido: numRecibido,
    dineroEsperado: numEsperado,
    message: `Descuadre: Existe un SOBRANTE de RD$ ${Math.abs(diff).toFixed(2)}.`
  };
}
