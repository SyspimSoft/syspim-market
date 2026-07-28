import React from 'react';

/**
 * SYSPIM MARKET - SEARCHBAR POS ALTA VELOCIDAD (ESCÁNER USB + SEMÁFORO 3-TIER)
 */
export function SearchBar({
  searchInputRef,
  searchQuery,
  setSearchQuery,
  filteredProducts,
  tenantProducts,
  addToCart,
  showToast
}) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* INPUT ESCÁNER BÚSQUEDA */}
        <div className="relative flex-1 w-full">
          <div className="bg-[#F8FAFC] border-2 border-[#CBD5E1] p-3.5 sm:p-4 rounded-2xl shadow-sm flex items-center gap-3 focus-within:border-[#0284C7] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0284C7]/15 transition-all">
            <span className="text-2xl text-[#0284C7] ml-1 flex-shrink-0">🔍</span>
            <input 
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const term = searchQuery.trim();
                  if (!term) return;

                  // Prioridad 1: Coincidencia exacta por ID o Barcode
                  const exactMatch = tenantProducts.find(p => 
                    String(p.id).toLowerCase() === term.toLowerCase() || 
                    (p.barcode && String(p.barcode) === term)
                  );
                  const targetProduct = exactMatch || filteredProducts[0];

                  if (targetProduct) {
                    addToCart(targetProduct);
                    
                    // Beep sutil de confirmación de escáner USB (880Hz)
                    try {
                      const ctx = new (window.AudioContext || window.webkitAudioContext)();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.type = 'sine';
                      osc.frequency.setValueAtTime(880, ctx.currentTime);
                      gain.gain.setValueAtTime(0.08, ctx.currentTime);
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.start();
                      osc.stop(ctx.currentTime + 0.08);
                    } catch(err) {}

                    setSearchQuery('');
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                  }
                }
              }}
              placeholder="Buscar producto o escanear código... [F2]"
              className="bg-transparent w-full text-[#0F172A] font-black placeholder-[#94A3B8] focus:outline-none text-lg sm:text-xl px-2 py-1 font-jakarta leading-normal tracking-wide"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-sm font-bold text-[#94A3B8] hover:text-[#EF4444] px-2 py-1 transition-colors">
                ✕
              </button>
            )}
          </div>

          {/* RESULTADOS DE AUTOCOMPLETADO RÁPIDO DE ALTA LEGIBILIDAD */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-[#0284C7] rounded-2xl shadow-[0_16px_40px_rgba(2,132,199,0.15)] z-50 max-h-96 overflow-y-auto divide-y divide-[#F1F5F9] custom-scrollbar">
              {filteredProducts.length === 0 ? (
                <div className="p-6 text-center text-sm font-bold text-[#64748B] bg-[#F8FAFC]">
                  ⚠️ No se encontraron productos coincidentes con "{searchQuery}"
                </div>
              ) : (
                filteredProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      addToCart(p);
                      setSearchQuery('');
                    }}
                    className="p-4 sm:p-4.5 hover:bg-[#E0F2FE]/60 active:bg-[#BAE6FD]/60 cursor-pointer flex items-center justify-between gap-4 transition-colors group"
                  >
                    {/* INFORMACIÓN DEL PRODUCTO */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-[#0F172A] font-jakarta group-hover:text-[#0284C7] transition-colors truncate">
                          {p.nombre}
                        </span>
                        {idx === 0 && (
                          <span className="bg-[#0284C7] text-white text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md flex-shrink-0">
                            Enter (1ro)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] font-bold px-2.5 py-0.5 rounded-lg">
                          {p.categoria || 'General'}
                        </span>

                        {/* SEMÁFORO DE STOCK DE 3 NIVELES */}
                        {p.stock <= 0 ? (
                          <span className="font-mono font-extrabold px-2.5 py-0.5 rounded-lg border bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]">
                            🔴 SIN EXISTENCIA
                          </span>
                        ) : p.stock <= 3 ? (
                          <span className="font-mono font-extrabold px-2.5 py-0.5 rounded-lg border bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]">
                            🔴 Stock crítico: {p.stock} unid.
                          </span>
                        ) : p.stock <= 10 ? (
                          <span className="font-mono font-extrabold px-2.5 py-0.5 rounded-lg border bg-[#FEFCE8] text-[#854D0E] border-[#FEF08A]">
                            🟡 Stock bajo: {p.stock} unid.
                          </span>
                        ) : (
                          <span className="font-mono font-extrabold px-2.5 py-0.5 rounded-lg border bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]">
                            🟢 Stock: {p.stock} unid.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PRECIO + BOTÓN AGREGAR */}
                    <div className="flex items-center gap-3.5 flex-shrink-0">
                      <div className="text-right">
                        <span className="font-extrabold text-base sm:text-lg text-[#0284C7] font-mono-tabular block">
                          RD$ {p.precio.toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="bg-[#0284C7] group-hover:bg-[#0369A1] text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-md shadow-[#0284C7]/20 flex items-center gap-1 transition-all group-hover:scale-105"
                      >
                        <span>+ Agregar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* BOTONES DE ATAJOS RÁPIDOS */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => showToast('⏸️ Venta pausada')}
            className="px-3 py-2.5 rounded-xl border border-[#FEF08A] bg-[#FEFCE8] text-[#854D0E] font-bold text-xs flex items-center gap-1.5 hover:bg-[#FEF9C3] transition-colors"
          >
            <span>⏸️</span>
            <span className="hidden sm:inline">F8 Pausar</span>
          </button>
          <button
            onClick={() => showToast('▶️ Recuperando venta')}
            className="px-3 py-2.5 rounded-xl border border-[#BAE6FD] bg-[#E0F2FE] text-[#0369A1] font-bold text-xs flex items-center gap-1.5 hover:bg-[#BAE6FD] transition-colors"
          >
            <span>▶️</span>
            <span className="hidden sm:inline">F9 Recup.</span>
          </button>
        </div>

      </div>
    </div>
  );
}
