import React from 'react';

/**
 * SYSPIM MARKET - PANEL RESUMEN DE COBRO Y BOTÓN COBRAR DINÁMICO
 */
export function PaymentPanel({
  cart,
  cartTotal,
  paymentMethod,
  setPaymentMethod,
  cashReceived,
  setCashReceived,
  ncfRequired,
  setNcfRequired,
  rncNumber,
  setRncNumber,
  handleCheckout
}) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-5">
      <h3 className="font-extrabold text-base text-[#0F172A] font-jakarta text-center tracking-wide uppercase">
        RESUMEN DE COBRO
      </h3>

      {/* BANNER GIGANTE DEL TOTAL A PAGAR */}
      <div className="bg-[#0284C7] text-white p-5 rounded-2xl text-center shadow-xl shadow-[#0284C7]/20 space-y-1">
        <span className="text-[11px] font-extrabold uppercase tracking-widest block opacity-90">
          TOTAL A PAGAR
        </span>
        <span className="text-4xl sm:text-5xl font-black tracking-tight font-jakarta block leading-none py-1">
          RD$ {cartTotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* MÉTODO DE PAGO EN CHIPS SELECCIONABLES */}
      <div className="space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] block">
          Método de Pago
        </span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'efectivo', label: '💵 EFECTIVO' },
            { id: 'tarjeta', label: '💳 TARJETA' },
            { id: 'transferencia', label: '📲 TRANSFER' }
          ].map(m => {
            const active = paymentMethod === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`py-2.5 px-1.5 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1 ${
                  active
                    ? 'bg-[#E0F2FE] text-[#0284C7] border-[#0284C7] shadow-sm font-black ring-2 ring-[#0284C7]/20'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#E2E8F0]'
                }`}
              >
                <span className="text-[10px]">{active ? '●' : '○'}</span>
                <span className="truncate">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CALCULADORA DE EFECTIVO RECIBIDO Y DEVUELTA */}
      {paymentMethod === 'efectivo' && (
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0369A1] mb-1 block">
              Efectivo Recibido RD$ (F2)
            </label>
            <div className="relative">
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#F8FAFC] border-2 border-[#0284C7] rounded-xl px-4 py-3 text-xl font-extrabold text-[#0F172A] focus:outline-none font-mono-tabular text-center shadow-inner"
              />
            </div>
          </div>

          {/* DEVUELTA */}
          <div className="bg-[#FEFCE8] border border-[#FEF08A] p-3.5 rounded-xl text-center shadow-sm">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#854D0E] block">
              DEVUELTA
            </span>
            {(() => {
              const rec = Number(cashReceived) || 0;
              const diff = rec - cartTotal;
              if (!cashReceived || rec === 0) {
                return <span className="font-extrabold text-2xl text-[#0F172A] font-mono-tabular block">RD$ 0.00</span>;
              }
              if (diff >= 0) {
                return <span className="font-extrabold text-2xl text-[#15803D] font-mono-tabular block">RD$ {diff.toFixed(2)}</span>;
              }
              return (
                <span className="font-extrabold text-xs text-[#DC2626] font-mono-tabular block bg-[#FEE2E2] py-1 px-2 rounded-lg mt-1">
                  Falta RD$ {Math.abs(diff).toFixed(2)}
                </span>
              );
            })()}
          </div>
        </div>
      )}

      {/* CHECKBOX COMPROBANTE FISCAL NCF */}
      <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={ncfRequired}
            onChange={(e) => setNcfRequired(e.target.checked)}
            className="w-4 h-4 text-[#0284C7] rounded border-[#CBD5E1] focus:ring-[#0284C7] cursor-pointer"
          />
          <span className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1">
            <span>🧾</span> ¿Requiere Comprobante Fiscal (RNC)?
          </span>
        </label>

        {ncfRequired && (
          <div className="pt-1 animate-fade-in-up">
            <input
              type="text"
              value={rncNumber}
              onChange={(e) => setRncNumber(e.target.value)}
              placeholder="Ingrese RNC o Cédula (Ej: 131-88995-2)..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-extrabold text-[#0F172A] placeholder-[#94A3B8]"
            />
          </div>
        )}
      </div>

      {/* BOTON GIGANTE COBRAR E IMPRIMIR DINÁMICO */}
      <button
        disabled={cart.length === 0}
        onClick={handleCheckout}
        className={`w-full py-4 rounded-2xl font-black text-base sm:text-lg tracking-wider flex items-center justify-center gap-2 transition-all ${
          cart.length === 0
            ? 'bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed'
            : 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xl shadow-[#16A34A]/25 cursor-pointer active:scale-[0.98]'
        }`}
      >
        <span>🧾</span>
        <span>
          {cart.length === 0 
            ? 'COBRAR E IMPRIMIR' 
            : `COBRAR RD$ ${cartTotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </span>
      </button>

    </div>
  );
}
