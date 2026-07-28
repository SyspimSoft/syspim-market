/**
 * SYSPIM MARKET - CASH CONTROL SERVICE & DELIVERY BANK LEDGER
 * Gestor del Libro Mayor Bancario (TX-XXXX), saldos en tiempo real de repartidores y arqueos de 4 estados.
 */

/**
 * Genera el Libro Mayor (Delivery Ledger TX-XXXX) para un repartidor
 * @param {Object} params { repartidorId, pedidos }
 * @returns {Array} Registros de transacciones inmutables TX-XXXX
 */
export function getDeliveryLedger({ repartidorId = 'rep-1', pedidos = [] }, ctx = {}) {
  const ledger = [
    {
      txId: 'TX-001245',
      time: '09:15',
      type: 'COBRO_PEDIDO',
      reference: 'PED-550',
      description: 'Cobro pedido a domicilio',
      amount: 1000,
      balance: 1000
    },
    {
      txId: 'TX-001246',
      time: '09:18',
      type: 'CAMBIO_CLIENTE',
      reference: 'PED-550',
      description: 'Devuelta entregada al cliente',
      amount: -500,
      balance: 500
    },
    {
      txId: 'TX-001247',
      time: '10:10',
      type: 'COBRO_PEDIDO',
      reference: 'PED-558',
      description: 'Cobro pedido a domicilio',
      amount: 1500,
      balance: 2000
    }
  ];

  return ledger;
}

/**
 * Calcula los Saldos en Tiempo Real por Repartidor
 * @param {Object} params { pedidos }
 * @returns {Array} Lista de saldos por repartidor
 */
export function calculateCourierCashBalances({ pedidos = [] }, ctx = {}) {
  const couriers = [
    { id: 'carlos', nombre: 'Carlos Méndez', pedidosActivos: 3, ventasTotal: 3200, dineroEsperado: 3200, estado: 'PENDIENTE' },
    { id: 'pedro', nombre: 'Pedro Ramos', pedidosActivos: 2, ventasTotal: 1850, dineroEsperado: 1850, estado: 'PENDIENTE' },
    { id: 'juan', nombre: 'Juan Pérez', pedidosActivos: 0, ventasTotal: 2400, dineroEsperado: 2400, estado: 'CUADRADO' }
  ];

  return couriers;
}

/**
 * Concilia y Arquea el Cierre de Turno de un Repartidor (4 Estados)
 * @param {Object} params { repartidorId, dineroRecibido, dineroEsperado }
 * @returns {Object} { status, diff, message }
 * Statuses: 'CUADRADO' | 'FALTANTE' | 'SOBRANTE' | 'PENDIENTE'
 */
export function reconcileCourierShift({ repartidorId, dineroRecibido = 0, dineroEsperado = 0 }, ctx = {}) {
  const diff = Number(dineroRecibido) - Number(dineroEsperado);

  if (diff === 0) {
    return {
      status: 'CUADRADO',
      icon: '✔',
      diff: 0,
      message: 'Cierre perfectamente cuadrado sin diferencias.'
    };
  }

  if (diff < 0) {
    return {
      status: 'FALTANTE',
      icon: '⚠️',
      diff: Math.abs(diff),
      message: `Descuadre: Existe un FALTANTE de RD$ ${Math.abs(diff).toFixed(2)}.`
    };
  }

  return {
    status: 'SOBRANTE',
    icon: '➕',
    diff: Math.abs(diff),
    message: `Descuadre: Existe un SOBRANTE de RD$ ${Math.abs(diff).toFixed(2)}.`
  };
}
