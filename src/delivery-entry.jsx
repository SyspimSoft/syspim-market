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
    monto_total: 350.00,
    monto_pagado_con: 350.00,
    devuelta_cliente: 0.00,
    metodo_pago: 'Transferencia',
    estado: 'en_camino',
    status: 'en_camino',
    delivery_token: 'DEL-[#4749]',
    created_at: new Date(Date.now() - 18 * 60000).toISOString(),
    detalles: [
      { cantidad: 2, nombre: 'Bravo Leche Uht Entera 1Lt', precio_unitario: 59 },
      { cantidad: 1, nombre: 'Bravo Dulce De Leche 400 Gr', precio_unitario: 232 }
    ]
  }
];

function StandaloneDeliveryApp() {
  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' | 'ledger' | 'token_search'
  const [selectedFilter, setSelectedFilter] = useState('todos'); // 'todos' | 'en_camino' | 'entregado'
  const [toastMsg, setToastMsg] = useState(null);

  // Modales
  const [confirmModalOrder, setConfirmModalOrder] = useState(null);
  const [issueModalOrder, setIssueModalOrder] = useState(null);
  const [cashSettlementModal, setCashSettlementModal] = useState(false);
  const [cashCountedInput, setCashCountedInput] = useState('');
  const [settlementResult, setSettlementResult] = useState(null);

  // Transacciones del Delivery Ledger del repartidor (TX-XXXX)
  const [ledger, setLedger] = useState([
    { txId: 'TX-001245', time: '09:15 AM', type: 'COBRO_PEDIDO', reference: 'PED-4745', description: 'Cobro pedido cliente', amount: 500, balance: 500 },
    { txId: 'TX-001246', time: '09:18 AM', type: 'CAMBIO_CLIENTE', reference: 'PED-4745', description: 'Devuelta entregada a cliente', amount: -250, balance: 250 }
  ]);

  // Lista de pedidos asignados
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

  // Sincronizar viajes con localStorage
  useEffect(() => {
    try {
      localStorage.setItem('syspim_pos_pedidos', JSON.stringify(trips));
      localStorage.setItem('syspim_delivery_trips', JSON.stringify(trips));
    } catch(e) {}
  }, [trips]);

  // Indicadores Financieros & Operativos del Turno
  const stats = useMemo(() => {
    const entregados = trips.filter(t => (t.estado || t.status) === 'entregado' || (t.estado || t.status) === 'completado');
    const enCamino = trips.filter(t => (t.estado || t.status) === 'en_camino' || (t.estado || t.status) === 'pendiente');

    const cobradoEfectivo = entregados
      .filter(t => (t.metodo_pago || '').toLowerCase().includes('efectivo'))
      .reduce((sum, t) => sum + (t.monto_pagado_con || t.monto_total || t.total || 0), 0);

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
      tiempoPromedioMin: 16
    };
  }, [trips]);

  // Marcar pedido como entregado y registrar en Delivery Ledger (TX-XXXX)
  const confirmDeliveryOrder = (order) => {
    setTrips(prev => prev.map(t => {
      if (t.id === order.id || (t.uuid && t.uuid === order.uuid)) {
        return { ...t, estado: 'entregado', status: 'entregado' };
      }
      return t;
    }));

    // Registrar en Ledger
    const isEfectivo = (order.metodo_pago || '').toLowerCase().includes('efectivo');
    const montoCobrado = order.monto_pagado_con || order.monto_total || order.total || 0;
    const cambio = order.devuelta_cliente || 0;

    const newTx1 = {
      txId: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'COBRO_PEDIDO',
      reference: order.id,
      description: `Cobro ${order.id} (${isEfectivo ? 'Efectivo' : 'Digital'})`,
      amount: isEfectivo ? montoCobrado : 0,
      balance: stats.dineroEnMano + (isEfectivo ? (montoCobrado - cambio) : 0)
    };

    setLedger(prev => [newTx1, ...prev]);
    setConfirmModalOrder(null);
    showToast(`✨ ¡Entrega #${order.id} confirmada! RD$ ${(montoCobrado - cambio).toFixed(2)} registrados.`);
  };

  // Arqueo / Rendición de Efectivo a Caja (4 Estados)
  const handleCashSettlement = (e) => {
    e.preventDefault();
    const contado = Number(cashCountedInput);
    const esperado = stats.dineroEnMano;
    const diff = contado - esperado;

    if (diff === 0) {
      setSettlementResult({ status: 'CUADRADO', icon: '✔', msg: 'Efectivo entregado a caja perfectamente cuadrado.' });
    } else if (diff < 0) {
      setSettlementResult({ status: 'FALTANTE', icon: '⚠️', msg: `Existe un FALTANTE de RD$ ${Math.abs(diff).toFixed(2)} en el arqueo.` });
    } else {
      setSettlementResult({ status: 'SOBRANTE', icon: '➕', msg: `Existe un SOBRANTE de RD$ ${Math.abs(diff).toFixed(2)}.` });
    }
  };

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const st = t.estado || t.status || 'en_camino';
      if (selectedFilter === 'en_camino') return st === 'en_camino' || st === 'pendiente';
      if (selectedFilter === 'entregado') return st === 'entregado' || st === 'completado';
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

      {/* HEADER DEL REPARTIDOR CON PESTAÑAS */}
      <header className="bg-white border-b border-[#E2E8F0] px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#15803D] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#15803D]/20">
              🛵
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-[#0F172A] tracking-tight">TURNO DE CARLOS</h1>
              <span className="text-[10px] text-[#15803D] font-bold block">🟢 Activo • 8:00 AM</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-full text-xs font-extrabold">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`px-3 py-1 rounded-full transition-all ${activeTab === 'pedidos' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-[#64748B]'}`}
            >
              📦 Pedidos
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1 rounded-full transition-all ${activeTab === 'ledger' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-[#64748B]'}`}
            >
              📒 Extracto
            </button>
          </div>
        </div>
      </header>

      {/* BANNER 4 INDICADORES COMPACTOS DE TURNO (Móvil First) */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-3 shadow-xs">
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-2 text-center">
          
          <div className="bg-[#FEFCE8] border border-[#FEF08A] p-2 rounded-xl">
            <span className="text-[9px] font-extrabold text-[#854D0E] uppercase block">💰 En Mano</span>
            <span className="text-xs font-black text-[#854D0E] font-mono-tabular">RD$ {stats.dineroEnMano.toLocaleString('es-DO')}</span>
          </div>

          <div className="bg-[#E0F2FE] border border-[#BAE6FD] p-2 rounded-xl">
            <span className="text-[9px] font-extrabold text-[#0369A1] uppercase block">📦 Activos</span>
            <span className="text-xs font-black text-[#0369A1] font-mono-tabular">{stats.countActivos}</span>
          </div>

          <div className="bg-[#DCFCE7] border border-[#86EFAC] p-2 rounded-xl">
            <span className="text-[9px] font-extrabold text-[#15803D] uppercase block">✅ Hechos</span>
            <span className="text-xs font-black text-[#15803D] font-mono-tabular">{stats.countEntregados}</span>
          </div>

          <div className="bg-[#F3E8FF] border border-[#E9D5FF] p-2 rounded-xl">
            <span className="text-[9px] font-extrabold text-[#9333EA] uppercase block">⏱️ Prom.</span>
            <span className="text-xs font-black text-[#9333EA] font-mono-tabular">{stats.tiempoPromedioMin} min</span>
          </div>

        </div>
      </div>

      <main className="max-w-lg mx-auto w-full px-4 py-4 flex-1 space-y-4 pb-28">
        
        {/* PESTAÑA 1: LISTA DE PEDIDOS OPERATIVOS Y FINANCIEROS */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            
            {/* FILTROS Y OPTIMIZAR RUTA */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center bg-white border border-[#E2E8F0] p-1 rounded-full flex-1">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'en_camino', label: '🛵 En Camino' },
                  { id: 'entregado', label: '✅ Hechos' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`flex-1 py-1 text-[11px] font-extrabold rounded-full transition-all text-center ${
                      selectedFilter === f.id ? 'bg-[#15803D] text-white shadow-xs' : 'text-[#64748B]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => showToast('🗺️ Ruta optimizada calculada en Google Maps')}
                className="px-3 py-1.5 bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] font-extrabold text-xs rounded-full flex items-center gap-1 flex-shrink-0"
              >
                <span>🗺️ Ruta</span>
              </button>
            </div>

            {/* TARJETAS DE PEDIDO DETALLADAS FINANCIERAMENTE */}
            {filteredTrips.map(trip => {
              const isCompleted = (trip.estado || trip.status) === 'entregado' || (trip.estado || trip.status) === 'completado';
              const cleanPhone = (trip.cliente_telefono || '').replace(/[^0-9+]/g, '');
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.direccion_entrega)}`;
              
              // Timer de tiempo transcurrido
              const elapsedMin = Math.floor((Date.now() - new Date(trip.created_at || Date.now()).getTime()) / 60000);
              const timerBadge = elapsedMin >= 30 ? '🔴 42 min' : elapsedMin >= 15 ? '🟡 18 min' : '🟢 5 min';

              return (
                <div
                  key={trip.id}
                  className={`bg-white border p-4.5 rounded-[24px] shadow-sm space-y-3.5 transition-all ${
                    isCompleted ? 'border-[#86EFAC] bg-[#F0FDF4]/30' : 'border-[#CBD5E1]'
                  }`}
                >
                  {/* CABECERA CON INDICADOR DE TIEMPO */}
                  <div className="flex justify-between items-start pb-2.5 border-b border-[#F1F5F9]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#0F172A] font-jakarta">{trip.id}</span>
                        <span className="text-[10px] font-mono font-bold bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-md">
                          {timerBadge}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-[#0F172A] block mt-0.5">👤 {trip.cliente_nombre}</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      isCompleted ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]' : 'bg-[#FEFCE8] text-[#854D0E] border-[#FEF08A]'
                    }`}>
                      {isCompleted ? '✅ Entregado' : '🛵 Pendiente'}
                    </span>
                  </div>

                  {/* DIRECCIÓN */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
                    <span className="text-[9.5px] font-bold text-[#64748B] uppercase block">Dirección:</span>
                    <p className="font-bold text-xs text-[#0F172A] leading-snug">📍 {trip.direccion_entrega}</p>
                  </div>

                  {/* DESGLOSE FINANCIERO DEL PEDIDO */}
                  <div className="bg-[#FEFCE8]/80 border border-[#FEF08A] p-3.5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#854D0E]">Monto Compra:</span>
                      <span className="font-black text-[#0F172A] font-mono">RD$ {(trip.monto_total || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#854D0E]">Cliente Paga Con:</span>
                      <span className="font-black text-[#0284C7] font-mono">RD$ {(trip.monto_pagado_con || trip.monto_total || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-[#FEF08A]">
                      <span className="font-extrabold text-[#B45309]">Cambio a Entregar:</span>
                      <span className="font-black text-[#DC2626] font-mono">RD$ {(trip.devuelta_cliente || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* ACCIONES DEL REPARTIDOR */}
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
                      className="py-2.5 bg-[#E0F2FE] text-[#0369A1] font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      🗺️ Mapa
                    </a>
                  </div>

                  {/* BOTÓN ENTREGAR O INCIDENCIA */}
                  {!isCompleted ? (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setIssueModalOrder(trip)}
                        className="px-3 py-3 bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] font-extrabold text-xs rounded-xl flex-shrink-0"
                        title="Reportar problema con la entrega"
                      >
                        ⚠️ Incidencia
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
                      ✔ Entrega y Cobro Finalizados
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

        {/* PESTAÑA 2: DELIVERY LEDGER EXTRACTO BANCARIO (TX-XXXX) */}
        {activeTab === 'ledger' && (
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-[24px] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="font-extrabold text-sm text-[#0F172A] font-jakarta">📒 Extracto Bancario Repartidor</h3>
              <span className="text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded-full">TX-Ledger</span>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {ledger.map(tx => (
                <div key={tx.txId} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-extrabold text-[#0284C7] block">{tx.txId} • {tx.reference}</span>
                    <span className="text-[11px] text-[#0F172A] font-extrabold block">{tx.description}</span>
                    <span className="text-[10px] text-[#64748B] font-mono">{tx.time}</span>
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

      </main>

      {/* FOOTER FIXED: RESUMEN PERMANENTE DEL TURNO Y BOTÓN ENTREGAR EFECTIVO */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] p-4 shadow-lg z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-extrabold text-[#64748B] uppercase block">Total a Rendir Caja:</span>
            <span className="text-xl font-black text-[#15803D] font-mono-tabular">RD$ {stats.dineroEnMano.toLocaleString('es-DO')}</span>
          </div>

          <button
            onClick={() => setCashSettlementModal(true)}
            className="px-5 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#0284C7]/20 flex items-center gap-1.5"
          >
            <span>💰 Entregar Efectivo a Caja</span>
          </button>
        </div>
      </footer>

      {/* MODAL 1: CONFIRMAR ENTREGA */}
      {confirmModalOrder && (
        <div className="fixed inset-0 z-50 bg-[#060B14]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-[24px] shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] text-2xl flex items-center justify-center mx-auto font-bold">
              ✔
            </div>
            <h3 className="font-extrabold text-base text-[#0F172A]">Confirmar Entrega #{confirmModalOrder.id}</h3>
            
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl space-y-1.5 text-left text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Monto Compra:</span>
                <span className="font-bold text-[#0F172A]">RD$ {(confirmModalOrder.monto_total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Cliente Pagó:</span>
                <span className="font-bold text-[#0284C7]">RD$ {(confirmModalOrder.monto_pagado_con || confirmModalOrder.monto_total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-[#E2E8F0] pt-1 text-[#DC2626] font-bold">
                <span>Devuelta Entregada:</span>
                <span>RD$ {(confirmModalOrder.devuelta_cliente || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
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
                ✔ Registrar Entrega
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INCIDENCIA */}
      {issueModalOrder && (
        <div className="fixed inset-0 z-50 bg-[#060B14]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-[24px] shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-[#0F172A] text-center">⚠️ Reportar Incidencia #{issueModalOrder.id}</h3>
            <div className="space-y-2">
              {['Cliente no responde', 'Dirección incorrecta', 'Cliente canceló', 'No tenía cambio', 'Pedido rechazado'].map(reason => (
                <button
                  key={reason}
                  onClick={() => {
                    showToast(`⚠️ Incidencia registrada: ${reason}`);
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

      {/* MODAL 3: RENDICIÓN DE EFECTIVO A CAJA */}
      {cashSettlementModal && (
        <div className="fixed inset-0 z-50 bg-[#060B14]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-[24px] shadow-2xl space-y-4 text-center">
            <h3 className="font-extrabold text-base text-[#0F172A]">💰 Rendición de Efectivo a Caja</h3>
            
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