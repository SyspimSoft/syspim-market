import React, { useState, useEffect } from 'react';

/**
 * SYSPIM MARKET - MODAL INTERACTIVO DE AUDITORÍA DE MOVIMIENTOS KARDEX
 */
export function KardexModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterType, setFilterType] = useState('TODOS');

  useEffect(() => {
    if (isOpen) {
      try {
        const rawLogs = JSON.parse(localStorage.getItem('syspim_kardex_logs') || '[]');
        setLogs(rawLogs);
      } catch (e) {
        setLogs([]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(item => {
    const matchesType = filterType === 'TODOS' || item.tipo === filterType;
    const q = filterQuery.toLowerCase().trim();
    if (!q) return matchesType;

    const matchesName = (item.productName || item.productId || '').toLowerCase().includes(q);
    const matchesRef = (item.referencia || '').toLowerCase().includes(q);
    return matchesType && (matchesName || matchesRef);
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#060B14]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full rounded-[24px] shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-up">
        
        {/* HEADER MODAL */}
        <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEFCE8] border border-[#FEF08A] text-[#854D0E] flex items-center justify-center text-xl font-bold">
              📜
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#0F172A] font-jakarta">Historial de Auditoría Kardex</h3>
              <p className="text-xs text-[#64748B] font-medium">Registro cronológico de movimientos y variaciones de stock</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] font-bold text-sm flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* FILTROS Y BÚSQUEDA */}
        <div className="p-4 bg-white border-b border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filtrar por producto o referencia..."
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs font-bold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {['TODOS', 'VENTA_POS', 'VENTA_PWA', 'AJUSTE', 'REABASTECIMIENTO'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                  filterType === t
                    ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#E2E8F0]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* TABLA DE AUDITORÍA KARDEX */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-sm font-bold text-[#64748B] bg-[#F8FAFC] rounded-2xl">
              🔍 No se encontraron registros de movimiento para los criterios seleccionados.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase font-mono text-[11px] tracking-wider">
                  <th className="py-3 px-3 font-extrabold">FECHA</th>
                  <th className="py-3 px-3 font-extrabold">TIPO</th>
                  <th className="py-3 px-3 font-extrabold">PRODUCTO</th>
                  <th className="py-3 px-3 font-extrabold text-center">CANT.</th>
                  <th className="py-3 px-3 font-extrabold text-center">ANTERIOR</th>
                  <th className="py-3 px-3 font-extrabold text-center">NUEVO</th>
                  <th className="py-3 px-3 font-extrabold text-right">REFERENCIA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredLogs.map((log) => {
                  const isNegative = log.cantidad < 0;
                  const dateStr = log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A';
                  return (
                    <tr key={log.id} className="hover:bg-[#F8FAFC] text-xs font-medium transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-[#64748B]">{dateStr}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${
                          log.tipo === 'VENTA_POS' ? 'bg-[#E0F2FE] text-[#0284C7]' :
                          log.tipo === 'VENTA_PWA' ? 'bg-[#F3E8FF] text-[#9333EA]' :
                          log.tipo === 'REABASTECIMIENTO' ? 'bg-[#DCFCE7] text-[#15803D]' :
                          'bg-[#FEFCE8] text-[#854D0E]'
                        }`}>
                          {log.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-[#0F172A] font-jakarta">{log.productName || log.productId}</td>
                      <td className={`py-3 px-3 text-center font-mono font-extrabold ${isNegative ? 'text-[#DC2626]' : 'text-[#15803D]'}`}>
                        {log.cantidad > 0 ? `+${log.cantidad}` : log.cantidad}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[#64748B]">{log.stockAnterior ?? '-'}</td>
                      <td className="py-3 px-3 text-center font-mono font-extrabold text-[#0F172A]">{log.stockNuevo ?? '-'}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#64748B] text-[11px]">{log.referencia}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* FOOTER MODAL */}
        <div className="p-4 border-t border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B]">
          <span className="font-bold">Total Registros: {filteredLogs.length}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold transition-colors shadow-sm"
          >
            Cerrar AUDITORÍA
          </button>
        </div>

      </div>
    </div>
  );
}
