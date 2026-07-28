import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import '../styles.css';

const INITIAL_DELIVERIES = [
  {
    id: 'PED-4748',
    cliente_nombre: 'Carlos Mendoza',
    cliente_telefono: '8095550199',
    direccion_entrega: 'Calle Pepillo Salcedo #14, Ensanche La Fe',
    monto_total: 250.00,
    monto_pagado_con: 500.00,
    devuelta_cliente: 250.00,
    metodo_pago: 'Efectivo',
    estado: 'en_camino',
    status: 'en_camino',
    delivery_token: 'DEL-96B17L',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    detalles: [
      { cantidad: 1, nombre: 'Refresco Coca-Cola 2 Litros', precio_unitario: 95 },
      { cantidad: 1, nombre: 'Huevos Frescos Cartón 30 Unid', precio_unitario: 155 }
    ]
  },
  {
    id: 'PED-4749',
    cliente_nombre: 'María Rodríguez',
    cliente_telefono: '8095131416',
    direccion_entrega: 'Av. 27 de Febrero #45, Apt. 3B',
    monto_total: 850.00,
    monto_pagado_con: 2000.00,
    devuelta_cliente: 1150.00,
    metodo_pago: 'Efectivo',
    estado: 'en_camino',
    status: 'en_camino',
    delivery_token: 'DEL-4749',
    created_at: new Date(Date.now() - 18 * 60000).toISOString(),
    detalles: [
      { cantidad: 2, nombre: 'Bravo Leche Uht Entera 1Lt', precio_unitario: 59 },
      { cantidad: 1, nombre: 'Bravo Dulce De Leche 400 Gr', precio_unitario: 732 }
    ]
  }
];

function StandaloneDeliveryApp() {
  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' | 'dinero' | 'ledger' | 'turno'
  const [selectedFilter, setSelectedFilter] = useState('todos'); // 'todos' | 'en_camino' | 'entregado' | 'rendido'
  const [toastMsg, setToastMsg] = useState(null);

  // Modales
  const [confirmModalOrder, setConfirmModalOrder] = useState(null);
  const [confirmPhoto, setConfirmPhoto] = useState(null);
  const [confirmNotes, setConfirmNotes] = useState('');
  const [confirmReceived, setConfirmReceived] = useState('si');

  const [issueModalOrder, setIssueModalOrder] = useState(null);
  const [cashSettlementModal, setCashSettlementModal] = useState(false);
  const [cashCountedInput, setCashCountedInput] = useState('');
  const [settlementResult, setSettlementResult] = useState(null);

  // Fondo de cambio disponible del repartidor
  const [cambioDisponible, setCambioDisponible] = useState(900);

  // Delivery Ledger (Historial bancario de movimientos)
  const [ledger, setLedger] = useState([
    { txId: 'TX-001245', time: '09:15 AM', type: 'COBRO_PEDIDO', reference: 'PED-4745', description: 'Cobro pedido cliente', amount: 500, balance: 500 },
    { txId: 'TX-001246', time: '09:18 AM', type: 'CAMBIO_CLIENTE', reference: 'PED-4745', description: 'Devuelta entregada a cliente', amount: -250, balance: 250 }
  ]);

  // Lista de viajes/pedidos
  const [trips, setTrips] = useState(() => {
    try {
      const saved = localStorage.getItem('syspim_pos_pedidos');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_DELIVERIES;
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sincronizar viajes con localStorage y BroadcastChannel
  useEffect(() => {
    try {
      localStorage.setItem('syspim_pos_pedidos', JSON.stringify(trips));
      localStorage.setItem('syspim_delivery_trips', JSON.stringify(trips));
    } catch(e) {}
  }, [trips]);

  // Estadísticas del Turno & Efectivo
  const stats = useMemo(() => {
    const entregados = trips.filter(t => (t.estado || t.status) === 'entregado' || (t.estado || t.status) === 'rendido');
    const rendidos = trips.filter(t => (t.estado || t.status) === 'rendido');
    const enCamino = trips.filter(t => (t.estado || t.status) === 'en_camino' || (t.estado || t.status) === 'preparandose' || (t.estado || t.status) === 'aceptado');

    const cobradoEfectivo = entregados
      .filter(t => (t.metodo_pago || '').toLowerCase().includes('efectivo'))
      .reduce((sum, t) => sum + (t.monto_pagado_con || t.monto_total || 0), 0);

    const cambioEntregado = entregados
      .filter(t => (t.metodo_pago || '').toLowerCase().includes('efectivo'))
      .reduce((sum, t) => sum + (t.devuelta_cliente || 0), 0);

    const dineroEnMano = cobradoEfectivo - cambioEntregado;

    return {
      dineroEnMano,
      cobradoEfectivo,
      cambioEntregado,
      countActivos: enCamino.length,
      countEntregados: entregados.length,
      countRendidos: rendidos.length,
      tiempoPromedioMin: 14,
      totalAdministrado: cobradoEfectivo
    };
  }, [trips]);

  // Marcar entrega con evidencia (Foto + Firma)
  const confirmDeliveryOrder = (order) => {
    setTrips(prev => prev.map(t => {
      if (t.id === order.id || (t.uuid && t.uuid === order.uuid)) {
        return {
          ...t,
          estado: 'entregado',
          status: 'entregado',
          evidence: {
            clientReceived: confirmReceived === 'si',
            notes: confirmNotes,
            photo: confirmPhoto || 'evidencia_simulada.jpg',
            timestamp: new Date().toISOString()
          }
        };
      }
      return t;
    }));

    // Registrar en Ledger
    const isEfectivo = (order.metodo_pago || '').toLowerCase().includes('efectivo');
    const montoCobrado = order.monto_pagado_con || order.monto_total || 0;
    const cambio = order.devuelta_cliente || 0;

    const newTx1 = {
      txId: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'COBRO_PEDIDO',
      reference: order.id,
      description: `Cobro Pedido ${order.id}`,
      amount: isEfectivo ? (montoCobrado - cambio) : 0,
      balance: stats.dineroEnMano + (isEfectivo ? (montoCobrado - cambio) : 0)
    };

    setLedger(prev => [newTx1, ...prev]);
    setConfirmModalOrder(null);
    setConfirmNotes('');
    setConfirmPhoto(null);
    showToast(`✨ ¡Entrega #${order.id} registrada con evidencia!`);
  };

  // Rendición e Integración directa con Caja
  const handleCashSettlement = (e) => {
    e.preventDefault();
    const contado = Number(cashCountedInput);
    const esperado = stats.dineroEnMano;
    const diff = contado - esperado;

    // Actualizar estado de pedidos entregados a 'rendido'
    setTrips(prev => prev.map(t => {
      if ((t.estado || t.status) === 'entregado') {
        return { ...t, estado: 'rendido', status: 'rendido' };
      }
      return t;
    }));

    // Registrar movimiento en el Ledger de entrega a Caja
    const newTx = {
      txId: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'ENTREGA_CAJA',
      reference: 'CAJA-PRINCIPAL',
      description: 'Rendición de efectivo a Caja Registradora',
      amount: -contado,
      balance: Math.max(0, esperado - contado)
    };

    setLedger(prev => [newTx, ...prev]);

    if (diff === 0) {
      setSettlementResult({ status: 'CUADRADO', icon: '✔', msg: 'Rendición entregada a caja perfectamente cuadrada. Estado: Rendido.' });
    } else if (diff < 0) {
      setSettlementResult({ status: 'FALTANTE', icon: '⚠️', msg: `Rendición procesada. Faltante detectado de RD$ ${Math.abs(diff).toFixed(2)}.` });
    } else {
      setSettlementResult({ status: 'SOBRANTE', icon: '➕', msg: `Rendición procesada. Sobrante detectado de RD$ ${Math.abs(diff).toFixed(2)}.` });
    }
  };

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const st = t.estado || t.status || 'en_camino';
      if (selectedFilter === 'en_camino') return st === 'en_camino' || st === 'preparandose' || st === 'aceptado';
      if (selectedFilter === 'entregado') return st === 'entregado';
      if (selectedFilter === 'rendido') return st === 'rendido';
      return true;
    });
  }, [trips, selectedFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      
      {/* TOAST FLOATER */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#0F172A] text-white text-xs font-bold px-4.5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in-up">
          <span>⚡</span> {toastMsg}
        </div>
      )}

      {/* HEADER DEL WORKSPACE MÓVIL DEL REPARTIDOR */}
      <header className="bg-white border-b border-[#E2E8F0] px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#15803D] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#15803D]/20">
              🚴
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-[#0F172A] tracking-tight">WORKSPACE REPARTIDOR</h1>
              <span className="text-[10px] text-[#15803D] font-bold block">Carlos Méndez • Turno Mañana</span>
            </div>
          </div>

          <div className="bg-[#FEFCE8] border border-[#FEF08A] px-3 py-1 rounded-full text-center">
            <span className="text-[9px] font-extrabold text-[#854D0E] uppercase block">💰 Saldo Actual</span>
            <span className="text-xs font-black text-[#854D0E] font-mono">RD$ {stats.dineroEnMano.toLocaleString('es-DO')}</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto w-full px-4 py-4 flex-1 space-y-4 pb-28">
        
        {/* PESTAÑA 1: PEDIDOS OPERATIVOS Y NAVEGACIÓN */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            
            {/* FILTROS Y ESTADOS DE PEDIDO (Nuevo -> Aceptado -> En camino -> Entregado -> Rendido) */}
            <div className="flex items-center bg-white border border-[#E2E8F0] p-1 rounded-full overflow-x-auto scrollbar-none">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'en_camino', label: '🛵 En Camino' },
                { id: 'entregado', label: '✅ Entregados' },
                { id: 'rendido', label: '🏦 Rendidos' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`flex-1 py-1.5 px-3 text-[11px] font-extrabold rounded-full transition-all text-center whitespace-nowrap ${
                    selectedFilter === f.id ? 'bg-[#15803D] text-white shadow-xs' : 'text-[#64748B]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* LISTA DE TARJETAS DE PEDIDO */}
            {filteredTrips.map(trip => {
              const st = trip.estado || trip.status || 'en_camino';
              const isCompleted = st === 'entregado' || st === 'rendido';
              const isRendido = st === 'rendido';
              const cleanPhone = (trip.cliente_telefono || '').replace(/[^0-9+]/g, '');
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.direccion_entrega)}`;
              
              // Alerta de cambio insuficiente en mano
              const reqChange = trip.devuelta_cliente || 0;
              const hasInsufficientChange = reqChange > cambioDisponible;

              return (
                <div
                  key={trip.id}
                  className={`bg-white border p-4.5 rounded-[24px] shadow-sm space-y-3.5 transition-all ${
                    isRendido ? 'border-[#9333EA] bg-[#FAF5FF]/50' :
                    isCompleted ? 'border-[#86EFAC] bg-[#F0FDF4]/40' : 'border-[#CBD5E1]'
                  }`}
                >
                  {/* CABECERA CON ESTADO Y BADGE */}
                  <div className="flex justify-between items-start pb-2 border-b border-[#F1F5F9]">
                    <div>
                      <span className="font-extrabold text-sm text-[#0F172A] font-jakarta">{trip.id}</span>
                      <span className="text-xs font-extrabold text-[#0F172A] block mt-0.5">👤 {trip.cliente_nombre}</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      isRendido ? 'bg-[#F3E8FF] text-[#9333EA] border-[#E9D5FF]' :
                      isCompleted ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]' : 'bg-[#FEFCE8] text-[#854D0E] border-[#FEF08A]'
                    }`}>
                      {isRendido ? '🏦 Rendido' : isCompleted ? '✅ Entregado' : '🛵 En Camino'}
                    </span>
                  </div>

                  {/* ALERTA DE CAMBIO INSUFICIENTE */}
                  {hasInsufficientChange && !isCompleted && (
                    <div className="bg-[#FEF2F2] border border-[#FECACA] p-2.5 rounded-xl flex items-center justify-between text-xs text-[#991B1B]">
                      <span className="font-extrabold">⚠️ ¡Alerta! Cambio insuficiente en mano</span>
                      <span className="font-mono font-bold">Faltan RD$ {(reqChange - cambioDisponible).toFixed(2)}</span>
                    </div>
                  )}

                  {/* DIRECCIÓN */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
                    <span className="text-[9.5px] font-bold text-[#64748B] uppercase block">Dirección de Entrega:</span>
                    <p className="font-bold text-xs text-[#0F172A] leading-snug">📍 {trip.direccion_entrega}</p>
                  </div>

                  {/* DETALLE FINANCIERO */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#64748B] font-medium">Monto Compra:</span>
                      <span className="font-bold text-[#0F172A] font-mono">RD$ {(trip.monto_total || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] font-medium">Cliente Paga Con:</span>
                      <span className="font-bold text-[#0284C7] font-mono">RD$ {(trip.monto_pagado_con || trip.monto_total || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E2E8F0] pt-1 text-[#DC2626] font-extrabold">
                      <span>Cambio Requerido:</span>
                      <span className="font-mono">RD$ {reqChange.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* BOTONES DE NAVEGACIÓN Y ACCIONES RÁPIDAS */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="py-2.5 bg-[#E0F2FE] text-[#0369A1] font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      📞 Llamar
                    </a>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm"
                    >
                      🧭 Navegar
                    </a>
                  </div>

                  {/* ACCIONES Y BOTÓN SOS AYUDA */}
                  {!isCompleted ? (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setIssueModalOrder(trip)}
                        className="px-3 py-3 bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] font-extrabold text-xs rounded-xl flex-shrink-0"
                      >
                        🆘 Ayuda
                      </button>
                      <button
                        onClick={() => setConfirmModalOrder(trip)}
                        className="flex-1 py-3 bg-[#15803D] hover:bg-[#166534] text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider"
                      >
                        ✔ Confirmar Entrega
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-[#DCFCE7] text-[#15803D] rounded-xl text-center text-xs font-extrabold">
                      {isRendido ? '🏦 Dinero Rendido a Caja Principal' : '✔ Pedido Entregado al Cliente'}
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

        {/* PESTAÑA 2: ESTADO FINANCIERO Y RENDICIÓN DE EFECTIVO */}
        {activeTab === 'dinero' && (
          <div className="space-y-4">
            
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-[24px] shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-[#0F172A] font-jakarta">💵 Resumen del Efectivo del Turno</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FEFCE8] border border-[#FEF08A] p-3.5 rounded-2xl">
                  <span className="text-[10px] font-extrabold text-[#854D0E] uppercase block">Cobrado en Mano</span>
                  <span className="text-xl font-black text-[#854D0E] font-mono">RD$ {stats.dineroEnMano.toLocaleString('es-DO')}</span>
                </div>
                <div className="bg-[#E0F2FE] border border-[#BAE6FD] p-3.5 rounded-2xl">
                  <span className="text-[10px] font-extrabold text-[#0369A1] uppercase block">Fondo de Cambio</span>
                  <span className="text-xl font-black text-[#0369A1] font-mono">RD$ {cambioDisponible}</span>
                </div>
              </div>

              <button
                onClick={() => setCashSettlementModal(true)}
                className="w-full py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#0284C7]/20 uppercase tracking-wider"
              >
                💰 Entregar Efectivo a Caja Principal
              </button>
            </div>

          </div>
        )}

        {/* PESTAÑA 3: EXTRACTO BANCARIO LEDGER (09:32 +RD$ 500 Pedido PED-125 Saldo RD$ 2,300) */}
        {activeTab === 'ledger' && (
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-[24px] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="font-extrabold text-sm text-[#0F172A] font-jakarta">📒 Extracto de Movimientos</h3>
              <span className="text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1] px-2.5 py-0.5 rounded-full">Trazabilidad</span>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {ledger.map(tx => (
                <div key={tx.txId} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#64748B] font-mono block">{tx.time}</span>
                    <span className="font-extrabold text-[#0F172A] font-jakarta block">{tx.description}</span>
                    <span className="text-[10px] text-[#0284C7] font-mono font-bold">{tx.reference}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-extrabold text-sm block ${tx.amount > 0 ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                      {tx.amount > 0 ? `+RD$ ${tx.amount}` : `RD$ ${tx.amount}`}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">Saldo: RD$ {tx.balance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 4: ESTADÍSTICAS PERSONALES DE MI TURNO */}
        {activeTab === 'turno' && (
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-[24px] shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#0F172A] font-jakarta">👤 Estadísticas de Mi Turno</h3>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">Total Pedidos</span>
                <span className="text-xl font-black text-[#0F172A] font-mono">{trips.length}</span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">Tiempo Promedio</span>
                <span className="text-xl font-black text-[#9333EA] font-mono">{stats.tiempoPromedioMin} min</span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">Dinero Administrado</span>
                <span className="text-xl font-black text-[#0284C7] font-mono">RD$ {stats.totalAdministrado}</span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">Rendido a Caja</span>
                <span className="text-xl font-black text-[#15803D] font-mono">{stats.countRendidos} pedidos</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER NAVBAR DE 4 PESTAÑAS INFERIORES */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] py-2 px-4 shadow-lg z-40">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          {[
            { id: 'pedidos', icon: '🚚', label: 'Pedidos' },
            { id: 'dinero', icon: '💵', label: 'Dinero' },
            { id: 'ledger', icon: '📒', label: 'Extracto' },
            { id: 'turno', icon: '👤', label: 'Mi Turno' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-extrabold transition-all ${
                activeTab === tab.id ? 'text-[#0284C7]' : 'text-[#64748B]'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </footer>

      {/* MODAL: CONFIRMACIÓN DE ENTREGA CON EVIDENCIA (FOTO + NOTAS + RECIBIDO) */}
      {confirmModalOrder && (
        <div className="fixed inset-0 z-50 bg-[#060B14]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-[24px] shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-[#0F172A] text-center">✔ Confirmar Entrega #{confirmModalOrder.id}</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#64748B] mb-1">¿Cliente recibió la entrega?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input type="radio" name="rec" value="si" checked={confirmReceived === 'si'} onChange={() => setConfirmReceived('si')} />
                    <span>Sí, entregado</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input type="radio" name="rec" value="no" checked={confirmReceived === 'no'} onChange={() => setConfirmReceived('no')} />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Foto Evidencia (Opcional):</label>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmPhoto('evidencia_camara_capturada.jpg');
                    showToast('📸 Foto evidencia adjuntada');
                  }}
                  className="w-full py-2.5 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-xl text-center text-xs font-bold text-[#0284C7]"
                >
                  {confirmPhoto ? '✅ Evidencia Capturada' : '📷 Capturar Foto Evidencia'}
                </button>
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Observación / Nota:</label>
                <input
                  type="text"
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  placeholder="Ej: Entregado en recepción, portero guardó..."
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmModalOrder(null)}
                className="flex-1 py-3 bg-[#F1F5F9] text-[#64748B] font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDeliveryOrder(confirmModalOrder)}
                className="flex-2 py-3 bg-[#15803D] text-white font-bold text-xs rounded-xl shadow-md"
              >
                ✔ Guardar & Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SOS AYUDA E INCIDENCIAS */}
      {issueModalOrder && (
        <div className="fixed inset-0 z-50 bg-[#060B14]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-[24px] shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-[#0F172A] text-center">🆘 Reportar Incidencia #{issueModalOrder.id}</h3>
            <div className="space-y-2">
              {['Cliente no responde', 'No encuentro dirección', 'Accidente / Caída', 'Vehículo averiado', 'Problema con el cobro', 'Pedido rechazado'].map(reason => (
                <button
                  key={reason}
                  onClick={() => {
                    showToast(`⚠️ Incidencia SOS enviada a central: ${reason}`);
                    setIssueModalOrder(null);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-[#E2E8F0] hover:bg-[#FEF2F2] hover:border-[#FECACA] text-xs font-bold text-[#0F172A] transition-all"
                >
                  • {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIssueModalOrder(null)}
              className="w-full py-2.5 bg-[#F1F5F9] text-[#64748B] font-bold text-xs rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: RENDICIÓN A CAJA */}
      {cashSettlementModal && (
        <div className="fixed inset-0 z-50 bg-[#060B14]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-[24px] shadow-2xl space-y-4 text-center">
            <h3 className="font-extrabold text-base text-[#0F172A]">💰 Rendición a Caja Principal</h3>
            
            <div className="bg-[#FEFCE8] border border-[#FEF08A] p-3 rounded-xl text-xs">
              <span className="text-[#854D0E] font-bold block">Dinero Esperado por Caja:</span>
              <span className="text-xl font-black text-[#854D0E] font-mono">RD$ {stats.dineroEnMano.toLocaleString('es-DO')}</span>
            </div>

            <form onSubmit={handleCashSettlement} className="space-y-3">
              <input
                type="number"
                value={cashCountedInput}
                onChange={(e) => setCashCountedInput(e.target.value)}
                placeholder="Monto contado físicamente..."
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-sm font-bold text-center font-mono"
              />
              <button
                type="submit"
                className="w-full py-3 bg-[#0284C7] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Procesar Rendición
              </button>
            </form>

            {settlementResult && (
              <div className={`p-3 rounded-xl border text-xs font-bold ${
                settlementResult.status === 'CUADRADO' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#DC2626]'
              }`}>
                {settlementResult.icon} {settlementResult.msg}
              </div>
            )}

            <button
              onClick={() => {
                setCashSettlementModal(false);
                setSettlementResult(null);
              }}
              className="w-full py-2.5 bg-[#F1F5F9] text-[#64748B] font-bold text-xs rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

ReactDOM.createRoot(document.getElementById('delivery-app-root')).render(<StandaloneDeliveryApp />);