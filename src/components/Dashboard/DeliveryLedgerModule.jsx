import React, { useState } from 'react';
import { getDeliveryLedger, calculateCourierCashBalances, reconcileCourierShift } from '../../services/cashControlService.js';

/**
 * SYSPIM MARKET - CONTROL DE DELIVERY & LIBRO MAYOR BANCARIO (TX-XXXX)
 */
export function DeliveryLedgerModule({ pedidos = [], onToast }) {
  const [selectedCourier, setSelectedCourier] = useState('carlos');
  const [dineroEntregadoInput, setDineroEntregadoInput] = useState('');
  const [reconciliationResult, setReconciliationResult] = useState(null);

  const balances = calculateCourierCashBalances({ pedidos });
  const currentCourier = balances.find(c => c.id === selectedCourier) || balances[0];
  const ledger = getDeliveryLedger({ repartidorId: selectedCourier, pedidos });

  const handleReconcile = (e) => {
    e.preventDefault();
    const val = Number(dineroEntregadoInput);
    const result = reconcileCourierShift({
      repartidorId: selectedCourier,
      dineroRecibido: val,
      dineroEsperado: currentCourier.dineroEsperado
    });

    setReconciliationResult(result);
    if (onToast) onToast(`🚚 Cierre Procesado: Estado ${result.status}`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* HEADER CONTROL DELIVERY */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FEFCE8] border border-[#FEF08A] text-[#854D0E] flex items-center justify-center text-2xl font-bold">
            🚚
          </div>
          <div>
            <h2 className="font-extrabold text-xl sm:text-2xl text-[#0F172A] font-jakarta">Control Financiero & Delivery Ledger</h2>
            <p className="text-xs text-[#64748B] pt-0.5 font-medium">Libro mayor bancario de cobro de efectivo por repartidor y conciliación de turnos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#64748B]">Repartidor:</span>
          <select
            value={selectedCourier}
            onChange={(e) => {
              setSelectedCourier(e.target.value);
              setReconciliationResult(null);
            }}
            className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs font-extrabold text-[#0F172A] focus:outline-none"
          >
            {balances.map(b => (
              <option key={b.id} value={b.id}>{b.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TARJETAS DE SALDOS POR REPARTIDOR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {balances.map(b => (
          <div
            key={b.id}
            onClick={() => {
              setSelectedCourier(b.id);
              setReconciliationResult(null);
            }}
            className={`p-5 rounded-[22px] border cursor-pointer transition-all ${
              selectedCourier === b.id
                ? 'bg-[#E0F2FE] border-[#0284C7] shadow-md ring-2 ring-[#0284C7]/20'
                : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-[#0F172A] font-jakarta">{b.nombre}</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                b.estado === 'CUADRADO' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEFCE8] text-[#854D0E]'
              }`}>
                {b.estado === 'CUADRADO' ? '✔ Cuadrado' : '❌ Pendiente'}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[10.5px] font-bold text-[#64748B] block uppercase tracking-wider">Dinero Esperado</span>
              <span className="text-2xl font-black text-[#0284C7] font-mono-tabular">RD$ {b.dineroEsperado.toLocaleString('es-DO')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DELIVERY LEDGER BANCARIO (TX-XXXX) Y ARQUEO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TABLA DEL LIBRO MAYOR (TX-XXXX) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <h3 className="font-extrabold text-base text-[#0F172A] font-jakarta">
              📒 Delivery Ledger — {currentCourier.nombre}
            </h3>
            <span className="text-xs font-mono font-bold bg-[#F1F5F9] text-[#475569] px-2.5 py-0.5 rounded-md">
              Transacciones inmutables
            </span>
          </div>

          <div className="overflow-y-auto max-h-80 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase font-mono text-[10.5px]">
                  <th className="py-2.5 px-3 font-extrabold">TX ID</th>
                  <th className="py-2.5 px-3 font-extrabold">HORA</th>
                  <th className="py-2.5 px-3 font-extrabold">DESCRIPCIÓN</th>
                  <th className="py-2.5 px-3 font-extrabold text-right">MONTO</th>
                  <th className="py-2.5 px-3 font-extrabold text-right">SALDO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {ledger.map(tx => (
                  <tr key={tx.txId} className="text-xs font-medium hover:bg-[#F8FAFC]">
                    <td className="py-3 px-3 font-mono text-[11px] font-bold text-[#0284C7]">{tx.txId}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#64748B]">{tx.time}</td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-[#0F172A] font-jakarta block">{tx.description}</span>
                      <span className="text-[10px] text-[#64748B] font-mono">{tx.reference}</span>
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-extrabold ${tx.amount > 0 ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-[#0F172A]">RD$ {tx.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL DE CIERRE Y CONCILIACIÓN DE TURNO */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#0F172A] font-jakarta">💵 Cierre y Arqueo de Turno</h3>
          
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl space-y-1">
            <span className="text-xs font-bold text-[#64748B] block">Efectivo Esperado a Entregar:</span>
            <span className="text-2xl font-black text-[#0F172A] font-mono">RD$ {currentCourier.dineroEsperado.toLocaleString('es-DO')}</span>
          </div>

          <form onSubmit={handleReconcile} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#64748B] mb-1">Efectivo Entregado a Caja RD$</label>
              <input
                type="number"
                value={dineroEntregadoInput}
                onChange={(e) => setDineroEntregadoInput(e.target.value)}
                placeholder="Ingrese monto exacto contado..."
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-sm font-extrabold font-mono text-[#0F172A]"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-[#0284C7]/20"
            >
              Procesar Arqueo de Repartidor
            </button>
          </form>

          {/* RESULTADO CON 4 ESTADOS DE CONCILIACIÓN */}
          {reconciliationResult && (
            <div className={`p-4 rounded-2xl border text-center space-y-1 animate-fade-in-up ${
              reconciliationResult.status === 'CUADRADO' ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]' :
              reconciliationResult.status === 'FALTANTE' ? 'bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]' :
              reconciliationResult.status === 'SOBRANTE' ? 'bg-[#FEFCE8] border-[#FEF08A] text-[#854D0E]' :
              'bg-[#F1F5F9] border-[#CBD5E1] text-[#475569]'
            }`}>
              <span className="text-2xl font-extrabold block">{reconciliationResult.icon}</span>
              <span className="font-black text-sm uppercase block font-jakarta">Estado: {reconciliationResult.status}</span>
              <p className="text-xs font-medium">{reconciliationResult.message}</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
