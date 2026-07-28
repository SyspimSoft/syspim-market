// SYSPIM MARKET - SUITE DE PRUEBAS UNITARIAS DE SERVICIOS ERP (ESM / Node.js)
import assert from 'node:assert/strict';
import { calculateGrossProfit, calculateDailyTargetProgress, calculateSalesComparison, calculateCashFlow } from '../src/services/financialService.js';
import { calculateInventoryDepletionForecast, getPrioritizedAlerts, calculateAverageTicket } from '../src/services/analyticsService.js';
import { getDeliveryLedger, calculateCourierCashBalances, reconcileCourierShift } from '../src/services/cashControlService.js';
import { executeTransaction } from '../src/services/transactionService.js';

console.log('🧪 Iniciando pruebas unitarias de los Servicios ERP de Syspim Market...\n');

const ctx = { tenantId: 't-001', userId: 'user-admin', branchId: 'sucursal-principal' };

const demoProducts = [
  { id: 'p-1', barcode: '7501031311309', nombre: 'Coca Cola 600ml', precio: 60, costo: 40, stock: 15 },
  { id: 'p-2', barcode: '74601001', nombre: 'Parmalat Leche Entera 1L', precio: 80, costo: 55, stock: 2 }
];

const demoOrders = [
  { id: 'PED-1', total: 500, metodo_pago: 'EFECTIVO', items: [{ id: 'p-1', qty: 2, precio: 60 }] },
  { id: 'PED-2', total: 1200, metodo_pago: 'TARJETA', items: [{ id: 'p-2', qty: 1, precio: 80 }] }
];

// Test 1: financialService - Ganancia Bruta y Metas
{
  const profit = calculateGrossProfit({ tenantId: ctx.tenantId, pedidos: demoOrders, productos: demoProducts }, ctx);
  assert.equal(profit.totalVentas, 1700);
  assert.ok(profit.gananciaBruta > 0, 'La ganancia bruta debe ser mayor a 0');

  const targetProgress = calculateDailyTargetProgress({ pedidos: demoOrders, target: 10000 }, ctx);
  assert.equal(targetProgress.totalVentas, 1700);
  assert.equal(targetProgress.porcentaje, 17);
  console.log('✅ Test 1: financialService (Ganancia Bruta & Progreso Objetivo) - PASADO');
}

// Test 2: analyticsService - Pronóstico de Stock & Alertas Priorizadas
{
  const forecast = calculateInventoryDepletionForecast({ productos: demoProducts, pedidos: demoOrders }, ctx);
  assert.ok(forecast.length > 0);

  const alerts = getPrioritizedAlerts({ productos: demoProducts, pedidos: demoOrders, courierBalances: [] }, ctx);
  assert.ok(alerts.some(a => a.severity === 'WARNING'));
  console.log('✅ Test 2: analyticsService (Pronóstico Stock & Alertas Priorizadas) - PASADO');
}

// Test 3: cashControlService - Delivery Ledger TX-XXXX & Arqueo de 4 Estados
{
  const ledger = getDeliveryLedger({ repartidorId: 'rep-1', pedidos: demoOrders }, ctx);
  assert.ok(ledger[0].txId.startsWith('TX-'));

  const recSquare = reconcileCourierShift({ repartidorId: 'rep-1', dineroRecibido: 2000, dineroEsperado: 2000 }, ctx);
  assert.equal(recSquare.status, 'CUADRADO');

  const recShort = reconcileCourierShift({ repartidorId: 'rep-1', dineroRecibido: 1800, dineroEsperado: 2000 }, ctx);
  assert.equal(recShort.status, 'FALTANTE');
  assert.equal(recShort.diff, 200);

  const recExtra = reconcileCourierShift({ repartidorId: 'rep-1', dineroRecibido: 2100, dineroEsperado: 2000 }, ctx);
  assert.equal(recExtra.status, 'SOBRANTE');
  console.log('✅ Test 3: cashControlService (Delivery Ledger & Arqueo 4 Estados) - PASADO');
}

// Test 4: transactionService - Orquestador Transaccional
{
  const txResult = executeTransaction({
    productosList: demoProducts,
    cart: [{ id: 'p-1', qty: 2, precio: 60 }],
    paymentMethod: 'EFECTIVO',
    customer: 'Juan Pérez'
  }, ctx);

  assert.equal(txResult.success, true);
  assert.equal(txResult.receipt.total, 120);
  assert.equal(txResult.receipt.cliente, 'Juan Pérez');
  assert.equal(txResult.receipt.tenantId, ctx.tenantId);
  console.log('✅ Test 4: transactionService (Orquestador Transaccional End-to-End) - PASADO');
}

console.log('\n🎉 ¡TODAS LAS PRUEBAS UNITARIAS DEL NÚCLEO ERP PASARON EXITOSAMENTE!');
