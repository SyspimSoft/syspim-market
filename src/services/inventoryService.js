/**
 * SYSPIM MARKET - INVENTORY SERVICE (Capa de Dominio de Inventario)
 * Gestor centralizado de reglas de negocio para existencias, movimientos de kardex y auditoría ERP.
 */

/**
 * Valida si hay stock suficiente en el inventario antes de procesar una transacción.
 * @param {Array} productosList Arreglo actual de productos
 * @param {Array} cartItems Arreglo de items a validar ({ id, barcode, qty/cantidad, nombre })
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export function validateInventoryMovement(productosList, cartItems) {
  const errors = [];
  if (!Array.isArray(productosList) || !Array.isArray(cartItems)) {
    return { valid: false, errors: ['Estructura de inventario o carrito no válida.'] };
  }

  for (const item of cartItems) {
    const qty = Number(item.qty || item.cantidad || 0);
    if (!Number.isFinite(qty) || qty <= 0) {
      errors.push(`Cantidad no válida para "${item.nombre || item.id}": ${qty}`);
      continue;
    }

    const prod = productosList.find(p => {
      if (item.id && p.id && String(item.id) === String(p.id)) return true;
      if (item.barcode && p.barcode && String(item.barcode) === String(p.barcode)) return true;
      if ((item.nombre || '').toLowerCase().trim() === (p.nombre || '').toLowerCase().trim()) return true;
      return false;
    });

    if (!prod) {
      errors.push(`Producto "${item.nombre || item.id}" no encontrado en el inventario.`);
      continue;
    }

    const currentStock = Number.isFinite(Number(prod.stock)) ? Number(prod.stock) : 0;
    if (currentStock < qty) {
      errors.push(`Stock insuficiente para "${prod.nombre}". Disponible: ${currentStock}, Solicitado: ${qty}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Aplica el descuento de existencias por venta creando un nuevo arreglo de productos inmutables.
 * Prioridad de búsqueda estricta: 1. ID/UUID, 2. Barcode, 3. Nombre (fallback).
 * 
 * @param {Array} productosList Arreglo actual de productos
 * @param {Array} cartItems Arreglo de items a descontar
 * @returns {Array} Nuevo arreglo inmutable de productos con stock actualizado
 */
export function applyInventoryDiscount(productosList, cartItems) {
  if (!Array.isArray(productosList) || !Array.isArray(cartItems) || cartItems.length === 0) {
    return productosList;
  }

  return productosList.map(prod => {
    const item = cartItems.find(i => {
      if (i.id && prod.id && String(i.id) === String(prod.id)) return true;
      if (i.barcode && prod.barcode && String(i.barcode) === String(prod.barcode)) return true;
      if ((i.nombre || '').toLowerCase().trim() === (prod.nombre || '').toLowerCase().trim()) return true;
      return false;
    });

    if (!item) {
      return { ...prod, tenant_id: prod.tenant_id || 't-001' };
    }

    const discountQty = Number(item.qty || item.cantidad || 0);
    if (!Number.isFinite(discountQty) || discountQty <= 0) {
      return { ...prod, tenant_id: prod.tenant_id || 't-001' };
    }

    const currentStock = Number.isFinite(Number(prod.stock)) ? Number(prod.stock) : 0;
    const newStock = Math.max(0, currentStock - discountQty);

    return {
      ...prod,
      stock: newStock,
      tenant_id: prod.tenant_id || 't-001'
    };
  });
}

/**
 * Aplica un incremento o reabastecimiento de existencias.
 * @param {Array} productosList 
 * @param {string|number} productId 
 * @param {number} qty 
 * @returns {Array} Nuevo arreglo inmutable de productos
 */
export function applyInventoryIncrease(productosList, productId, qty = 1) {
  if (!Array.isArray(productosList)) return productosList;
  const increaseQty = Number(qty);
  if (!Number.isFinite(increaseQty) || increaseQty <= 0) return productosList;

  return productosList.map(prod => {
    if (String(prod.id) === String(productId)) {
      const currentStock = Number.isFinite(Number(prod.stock)) ? Number(prod.stock) : 0;
      return {
        ...prod,
        stock: currentStock + increaseQty,
        tenant_id: prod.tenant_id || 't-001'
      };
    }
    return { ...prod, tenant_id: prod.tenant_id || 't-001' };
  });
}

/**
 * Ajusta el stock a un valor específico (Ajuste de Inventario por Auditoría)
 * @param {Array} productosList 
 * @param {string|number} productId 
 * @param {number} targetStock 
 * @returns {Array} Nuevo arreglo inmutable
 */
export function applyInventoryAdjustment(productosList, productId, targetStock) {
  if (!Array.isArray(productosList)) return productosList;
  const newStockVal = Math.max(0, Number(targetStock) || 0);

  return productosList.map(prod => {
    if (String(prod.id) === String(productId)) {
      return {
        ...prod,
        stock: newStockVal,
        tenant_id: prod.tenant_id || 't-001'
      };
    }
    return { ...prod, tenant_id: prod.tenant_id || 't-001' };
  });
}

/**
 * Registra una estructura de movimiento para auditoría de Kardex
 * @param {Object} movementData 
 * @returns {Object} Objeto de movimiento de kardex estructurado
 */
export function createInventoryMovementRecord({ productId, productName, type, qty, previousStock, newStock, reference = 'POS' }) {
  return {
    id: 'mov-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    productId,
    productName,
    tipo: type, // 'VENTA_POS' | 'VENTA_PWA' | 'AJUSTE' | 'REABASTECIMIENTO'
    cantidad: qty,
    stockAnterior: previousStock,
    stockNuevo: newStock,
    referencia: reference,
    timestamp: new Date().toISOString()
  };
}

/**
 * Orquestador de Venta de Dominio: Valida, descuenta inventario y genera logs de Kardex
 * @param {Array} productosList 
 * @param {Array} cartItems 
 * @param {string} reference 
 * @returns {Object} { updatedProductos, movementRecords, errors: [] }
 */
export function processSale(productosList, cartItems, reference = 'VENTA_POS') {
  const validation = validateInventoryMovement(productosList, cartItems);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors,
      updatedProductos: productosList,
      movementRecords: []
    };
  }

  const movementRecords = [];
  const updatedProductos = productosList.map(prod => {
    const item = cartItems.find(i => {
      if (i.id && prod.id && String(i.id) === String(prod.id)) return true;
      if (i.barcode && prod.barcode && String(i.barcode) === String(prod.barcode)) return true;
      if ((i.nombre || '').toLowerCase().trim() === (prod.nombre || '').toLowerCase().trim()) return true;
      return false;
    });

    if (!item) return { ...prod, tenant_id: prod.tenant_id || 't-001' };

    const qty = Number(item.qty || item.cantidad || 1);
    const previousStock = Number.isFinite(Number(prod.stock)) ? Number(prod.stock) : 0;
    const newStock = Math.max(0, previousStock - qty);

    movementRecords.push(createInventoryMovementRecord({
      productId: prod.id,
      productName: prod.nombre,
      type: reference.includes('PWA') ? 'VENTA_PWA' : 'VENTA_POS',
      qty: -qty,
      previousStock,
      newStock,
      reference
    }));

    return {
      ...prod,
      stock: newStock,
      tenant_id: prod.tenant_id || 't-001'
    };
  });

  return {
    success: true,
    errors: [],
    updatedProductos,
    movementRecords
  };
}

export const InventoryService = {
  validateInventoryMovement,
  applyInventoryDiscount,
  applyInventoryIncrease,
  applyInventoryAdjustment,
  createInventoryMovementRecord,
  processSale
};

if (typeof window !== 'undefined') {
  window.InventoryService = InventoryService;
}
