// SYSPIM MARKET - MÓDULO DE SINCRONIZACIÓN Y BROADCAST REALTIME

export const orderChannelName = 'syspim_orders_channel';

// Helper para obtener una instancia limpia del BroadcastChannel
export const getOrderChannel = () => {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      return new BroadcastChannel(orderChannelName);
    }
  } catch (e) {
    console.warn('BroadcastChannel no soportado o deshabilitado:', e);
  }
  return null;
};

// Emitir actualización de inventario a todas las pestañas/ventanas
export const notifyStockUpdate = (updatedProducts) => {
  try {
    const channel = getOrderChannel();
    if (channel) {
      channel.postMessage({
        type: 'STOCK_UPDATE',
        payload: updatedProducts,
        timestamp: Date.now()
      });
      channel.close();
    }
  } catch (e) {
    console.error('Error notificando cambio de stock:', e);
  }
};

// Emitir nuevo pedido a la pantalla del POS
export const notifyNewOrder = (orderPayload) => {
  try {
    const channel = getOrderChannel();
    if (channel) {
      channel.postMessage({
        type: 'NEW_ORDER',
        order: orderPayload,
        timestamp: Date.now()
      });
      channel.close();
    }
  } catch (e) {
    console.error('Error notificando nuevo pedido:', e);
  }
};

// Emitir actualización de estado de pedido (Ej: PENDIENTE -> EN CAMINO -> ENTREGADO)
export const notifyOrderStatusUpdate = (updatedOrder) => {
  try {
    const channel = getOrderChannel();
    if (channel) {
      channel.postMessage({
        type: 'STATUS_UPDATE',
        order: updatedOrder,
        timestamp: Date.now()
      });
      channel.close();
    }
  } catch (e) {
    console.error('Error notificando actualización de estado:', e);
  }
};
