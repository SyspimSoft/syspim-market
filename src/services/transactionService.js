/**
 * SYSPIM MARKET - TRANSACTION SERVICE (Orquestador Transaccional ERP)
 * Coordina transacciones críticas end-to-end: Factura -> Caja -> Inventario -> Kardex -> Delivery -> Realtime.
 */
import { validateInventoryMovement, processSale } from './inventoryService.js';

/**
 * Ejecuta una Transacción Completa de Venta o Pedido
 * @param {Object} transactionData { cart, paymentMethod, reference, customer }
 * @param {Object} ctx { tenantId, userId, branchId }
 * @returns {Object} { success, updatedProductos, receipt, movementRecords, errors }
 */
export function executeTransaction(transactionData = {}, ctx = {}) {
  const { productosList = [], cart = [], paymentMethod = 'EFECTIVO', reference = 'POS-DIRECTO', customer = 'Consumidor Final' } = transactionData;

  // 1. Validar Inventario
  const validation = validateInventoryMovement(productosList, cart);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors,
      updatedProductos: productosList,
      receipt: null
    };
  }

  // 2. Ejecutar venta en el dominio de inventario (descuento inmutable + logs Kardex)
  const saleResult = processSale(productosList, cart, reference);
  if (!saleResult.success) {
    return {
      success: false,
      errors: saleResult.errors,
      updatedProductos: productosList,
      receipt: null
    };
  }

  // 3. Generar Ticket de Recibo
  const total = cart.reduce((acc, i) => acc + (Number(i.precio || 0) * Number(i.qty || 1)), 0);
  const receipt = {
    id: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
    fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    total,
    metodo: paymentMethod.toUpperCase(),
    cliente: customer,
    items: cart,
    tenantId: ctx.tenantId || 'default-tenant',
    branchId: ctx.branchId || 'main-branch',
    userId: ctx.userId || 'cashier-1'
  };

  return {
    success: true,
    updatedProductos: saleResult.updatedProductos,
    movementRecords: saleResult.movementRecords,
    receipt,
    errors: []
  };
}
