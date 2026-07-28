// SYSPIM MARKET - SUITE DE PRUEBAS UNITARIAS DE INVENTARIO (ESM / Node.js)
import assert from 'node:assert/strict';
import { 
  validateInventoryMovement, 
  applyInventoryDiscount, 
  applyInventoryIncrease, 
  applyInventoryAdjustment,
  createInventoryMovementRecord, 
  processSale 
} from '../src/services/inventoryService.js';

console.log('🧪 Iniciando pruebas unitarias de InventoryService...\n');

// 1. Datos Demo de Productos
const initialProducts = [
  { id: 'p-1', barcode: '7501031311309', nombre: 'Coca Cola 600ml', precio: 60, stock: 20 },
  { id: 'p-2', barcode: '74601001', nombre: 'Parmalat Leche Entera 1L', precio: 80, stock: 5 },
  { id: 'p-3', barcode: '74602002', nombre: 'Pan de Agua', precio: 10, stock: 0 }
];

// Test 1: validateInventoryMovement con stock suficiente
{
  const cart = [{ id: 'p-1', qty: 2 }];
  const res = validateInventoryMovement(initialProducts, cart);
  assert.equal(res.valid, true, 'Debería ser válido cuando hay stock suficiente');
  assert.equal(res.errors.length, 0);
  console.log('✅ Test 1: validateInventoryMovement (Stock Suficiente) - PASADO');
}

// Test 2: validateInventoryMovement con stock insuficiente
{
  const cart = [{ id: 'p-3', qty: 1 }];
  const res = validateInventoryMovement(initialProducts, cart);
  assert.equal(res.valid, false, 'Debería rechazar venta sin existencia');
  assert.ok(res.errors[0].includes('Stock insuficiente'), 'Debería incluir mensaje de stock insuficiente');
  console.log('✅ Test 2: validateInventoryMovement (Sin Existencia) - PASADO');
}

// Test 3: applyInventoryDiscount (Inmutabilidad y descuento atómico)
{
  const cart = [{ id: 'p-1', barcode: '7501031311309', qty: 3 }];
  const updated = applyInventoryDiscount(initialProducts, cart);
  
  // Verificar inmutabilidad
  assert.notEqual(updated, initialProducts);
  assert.equal(initialProducts[0].stock, 20, 'El array original NO debe ser modificado');
  
  // Verificar stock descontado
  const p1 = updated.find(p => p.id === 'p-1');
  assert.equal(p1.stock, 17, 'El stock de p-1 debe ser 20 - 3 = 17');
  console.log('✅ Test 3: applyInventoryDiscount (Descuento Inmutable) - PASADO');
}

// Test 4: createInventoryMovementRecord (Formato de Kardex)
{
  const record = createInventoryMovementRecord({
    productId: 'p-1',
    type: 'VENTA_POS',
    qty: -3,
    previousStock: 20,
    newStock: 17,
    reference: 'POS-TEST-100'
  });

  assert.ok(record.id.startsWith('mov-'));
  assert.equal(record.productId, 'p-1');
  assert.equal(record.tipo, 'VENTA_POS');
  assert.equal(record.cantidad, -3);
  assert.equal(record.stockAnterior, 20);
  assert.equal(record.stockNuevo, 17);
  assert.equal(record.referencia, 'POS-TEST-100');
  console.log('✅ Test 4: createInventoryMovementRecord (Estructura Kardex) - PASADO');
}

// Test 5: processSale (Orquestación completa de venta)
{
  const cart = [
    { id: 'p-1', qty: 5 },
    { id: 'p-2', qty: 2 }
  ];
  const saleResult = processSale(initialProducts, cart, 'VENTA_POS');

  assert.equal(saleResult.success, true);
  assert.equal(saleResult.movementRecords.length, 2, 'Debe generar 2 registros Kardex');
  
  const p1Updated = saleResult.updatedProductos.find(p => p.id === 'p-1');
  const p2Updated = saleResult.updatedProductos.find(p => p.id === 'p-2');
  
  assert.equal(p1Updated.stock, 15);
  assert.equal(p2Updated.stock, 3);
  console.log('✅ Test 5: processSale (Orquestación Atómica de Venta) - PASADO');
}

// Test 6: applyInventoryIncrease & applyInventoryAdjustment
{
  const increased = applyInventoryIncrease(initialProducts, 'p-2', 10);
  const p2Inc = increased.find(p => p.id === 'p-2');
  assert.equal(p2Inc.stock, 15, 'Reabastecimiento de 5 + 10 debe ser 15');

  const adjusted = applyInventoryAdjustment(initialProducts, 'p-3', 50);
  const p3Adj = adjusted.find(p => p.id === 'p-3');
  assert.equal(p3Adj.stock, 50, 'Ajuste manual debe fijar el stock exactamente en 50');
  console.log('✅ Test 6: Adjustments & Replenishment (Kardex Actions) - PASADO');
}

console.log('\n🎉 ¡TODAS LAS PRUEBAS UNITARIAS DE INVENTORYSERVICE PASARON EXITOSAMENTE!');
