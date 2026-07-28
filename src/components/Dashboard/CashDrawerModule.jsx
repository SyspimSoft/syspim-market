import React, { useState } from 'react';
import { calculateCashFlow } from '../../services/financialService.js';

/**
 * SYSPIM MARKET - MÓDULO INDEPENDIENTE DE CAJA Y ARQUEO DIARIO
 */
export function CashDrawerModule({ pedidos = [], onToast }) {
  const [apertura, setApertura] = useState(10000);
  const [egresosList, setEgresosList] = useState([
    { id: 'eg-1', concepto: 'Pago proveedor hielo', monto: 1200, hora: '10:30 AM' },
    { id: 'eg-2', concepto: 'Retiro caja chica', monto: 2000, hora: '02:15 PM' }
  ]);
  const [conceptoInput, setConceptoInput] = useState('');
  const [montoInput, setMontoInput] = useState('');

  const totalEgresos = egresosList.reduce((acc, e) => acc + e.monto, 0);
  const flow = calculateCashFlow({ apertura, pedidos, egresos: totalEgresos, retiros: 0 });

  const handleAddEgreso = (e) => {
    e.preventDefault();
    const val = Number(montoInput);
    if (!conceptoInput || !val || val <= 0) return;

    const newEgreso = {
      id: 'eg-' + Date.now(),
      concepto: conceptoInput,
      monto: val,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setEgresosList([newEgreso, ...egresosList]);
    setConceptoInput('');
    setMontoInput('');
    if (onToast) onToast('💸 Egreso registrado en caja');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* HEADER DE CAJA */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] flex items-center justify-center text-2xl font-bold">
            💰
          </div>
          <div>
            <h2 className="font-extrabold text-xl sm:text-2xl text-[#0F172A] font-jakarta">Control de Caja Registradora</h2>
            <p className="text-xs text-[#64748B] pt-0.5 font-medium">Gestión de aperturas, ingresos de efectivo, egresos y retiros diarios</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl">
          <span className="text-xs font-extrabold text-[#64748B]">Monto Apertura RD$:</span>
          <input
            type="number"
            value={apertura}
            onChange={(e) => setApertura(Number(e.target.value) || 0)}
            className="w-28 bg-white border border-[#CBD5E1] rounded-xl px-3 py-1 text-sm font-extrabold font-mono text-[#0F172A] text-center"
          />
        </div>
      </div>

      {/* TARJETAS RESUMEN DE FLUJO DE CAJA */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-[22px] shadow-sm">
          <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider block mb-1">1. Fondo de Apertura</span>
          <span className="text-2xl font-black text-[#0F172A] font-mono-tabular">RD$ {apertura.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-5 rounded-[22px] shadow-sm">
          <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider block mb-1">2. Ingresos Efectivo</span>
          <span className="text-2xl font-black text-[#15803D] font-mono-tabular">RD$ {flow.ingresos.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-5 rounded-[22px] shadow-sm">
          <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider block mb-1">3. Egresos & Retiros</span>
          <span className="text-2xl font-black text-[#DC2626] font-mono-tabular">RD$ {flow.egresos.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="bg-[#0284C7] text-white p-5 rounded-[22px] shadow-lg shadow-[#0284C7]/20">
          <span className="text-[11px] font-extrabold uppercase tracking-wider block opacity-90 mb-1">4. Disponible en Caja</span>
          <span className="text-2xl font-black font-mono-tabular">RD$ {flow.disponible.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
        </div>

      </div>

      {/* FORMULARIO Y TABLA DE EGRESOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#0F172A] font-jakarta">💸 Registrar Salida / Egreso de Caja</h3>
          <form onSubmit={handleAddEgreso} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#64748B] mb-1">Concepto / Motivo</label>
              <input
                type="text"
                value={conceptoInput}
                onChange={(e) => setConceptoInput(e.target.value)}
                placeholder="Ej: Pago de hielo, compra de bolsas..."
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs font-bold text-[#0F172A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] mb-1">Monto RD$</label>
              <input
                type="number"
                value={montoInput}
                onChange={(e) => setMontoInput(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs font-bold text-[#0F172A]"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm"
            >
              Regístrar Salida de Efectivo
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#0F172A] font-jakarta">Historial de Salidas Registradas</h3>
          <div className="overflow-y-auto max-h-64 custom-scrollbar divide-y divide-[#F1F5F9]">
            {egresosList.map(e => (
              <div key={e.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-[#0F172A] font-jakarta block">{e.concepto}</span>
                  <span className="text-[10px] text-[#64748B] font-mono">{e.hora}</span>
                </div>
                <span className="font-mono font-extrabold text-sm text-[#DC2626]">- RD$ {e.monto.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
