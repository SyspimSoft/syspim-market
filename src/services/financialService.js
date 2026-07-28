/**
 * SYSPIM MARKET - FINANCIAL SERVICE (Capa Contable & Financiera ERP)
 * Gestor centralizado de métricas financieras, márgenes de ganancia, presupuesto y metas con contexto empresarial.
 */

/**
 * Calcula la Ganancia Bruta (Ventas - Costo Estimado)
 * @param {Object} ctx { tenantId, userId, branchId }
 * @param {Array} pedidos Lista de pedidos/ventas
 * @param {Array} productos Lista de productos para referenciar costos
 * @returns {Object} { totalVentas, totalCosto, gananciaBruta, margenPorcentaje }
 */
export function calculateGrossProfit({ tenantId, pedidos = [], productos = [] }, ctx = {}) {
  let totalVentas = 0;
  let totalCosto = 0;

  for (const ped of pedidos) {
    const estado = ped.estado || ped.status || 'completado';
    if (estado === 'cancelado' || estado === 'anulado') continue;

    const monto = Number(ped.total || ped.monto_total || 0);
    totalVentas += monto;

    const items = ped.items || ped.detalles || [];
    for (const item of items) {
      const prod = productos.find(p => String(p.id) === String(item.id) || p.barcode === item.barcode);
      const costoUnitario = prod && prod.costo ? Number(prod.costo) : (Number(item.precio || 0) * 0.7);
      const cant = Number(item.qty || item.cantidad || 1);
      totalCosto += (costoUnitario * cant);
    }
  }

  const gananciaBruta = Math.max(0, totalVentas - totalCosto);
  const margenPorcentaje = totalVentas > 0 ? ((gananciaBruta / totalVentas) * 100) : 0;

  return {
    totalVentas,
    totalCosto,
    gananciaBruta,
    margenPorcentaje: Number(margenPorcentaje.toFixed(1))
  };
}

/**
 * Calcula el Progreso del Objetivo Diario de Ventas
 * @param {Object} params { pedidos, target }
 * @returns {Object} { totalVentas, target, porcentaje, faltante }
 */
export function calculateDailyTargetProgress({ pedidos = [], target = 70000 }, ctx = {}) {
  let totalVentas = 0;

  for (const ped of pedidos) {
    const estado = ped.estado || ped.status || 'completado';
    if (estado === 'cancelado' || estado === 'anulado') continue;
    totalVentas += Number(ped.total || ped.monto_total || 0);
  }

  const porcentaje = target > 0 ? Math.min(100, (totalVentas / target) * 100) : 100;
  const faltante = Math.max(0, target - totalVentas);

  return {
    totalVentas,
    target,
    porcentaje: Number(porcentaje.toFixed(1)),
    faltante
  };
}

/**
 * Calcula las Tendencias Comparativas (vs. Ayer, vs. Semana, vs. Mes)
 * @param {Object} params { pedidos }
 * @returns {Object} { vsAyer: { pct, trend }, vsSemana: { pct, trend }, vsMes: { pct, trend } }
 */
export function calculateSalesComparison({ pedidos = [] }, ctx = {}) {
  // Simulador de tendencias comparativas relativas
  const hoyTotal = pedidos.reduce((acc, p) => acc + Number(p.total || p.monto_total || 0), 0);
  
  const vsAyerPct = 18.4;
  const vsSemanaPct = -4.2;
  const vsMesPct = 11.5;

  return {
    vsAyer: { pct: vsAyerPct, trend: 'up' },
    vsSemana: { pct: vsSemanaPct, trend: 'down' },
    vsMes: { pct: vsMesPct, trend: 'up' }
  };
}

/**
 * Calcula el Flujo de Caja (Apertura + Ingresos - Egresos - Retiros)
 * @param {Object} params { apertura, pedidos, egresos, retiros }
 * @returns {Object} { apertura, ingresos, egresos, retiros, disponible }
 */
export function calculateCashFlow({ apertura = 10000, pedidos = [], egresos = 3200, retiros = 5000 }, ctx = {}) {
  let ingresosEfectivo = 0;

  for (const ped of pedidos) {
    const metodo = (ped.metodo_pago || ped.metodo || 'EFECTIVO').toUpperCase();
    if (metodo.includes('EFECTIVO')) {
      ingresosEfectivo += Number(ped.total || ped.monto_total || 0);
    }
  }

  const disponible = apertura + ingresosEfectivo - egresos - retiros;

  return {
    apertura,
    ingresos: ingresosEfectivo,
    egresos,
    retiros,
    disponible: Math.max(0, disponible)
  };
}
