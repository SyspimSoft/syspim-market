import React from 'react';

/**
 * SYSPIM MARKET - BANDA INFERIOR DE ATAJOS DE TECLADO RÁPIDOS
 */
export function ShortcutBar() {
  return (
    <div className="lg:col-span-12 bg-white border border-[#E2E8F0] px-5 py-3 rounded-2xl shadow-sm flex items-center justify-between text-xs text-[#64748B] flex-wrap gap-3 font-mono">
      <div className="flex items-center gap-4 flex-wrap font-bold">
        <span className="flex items-center gap-1.5">
          <kbd className="bg-[#F1F5F9] border border-[#CBD5E1] px-2 py-0.5 rounded text-[10px] text-[#0F172A] shadow-xs">F2</kbd> Buscar
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="bg-[#F1F5F9] border border-[#CBD5E1] px-2 py-0.5 rounded text-[10px] text-[#0F172A] shadow-xs">Enter</kbd> Agregar 1ro
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="bg-[#FEFCE8] border border-[#FEF08A] px-2 py-0.5 rounded text-[10px] text-[#854D0E] shadow-xs">F8</kbd> Pausar
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="bg-[#E0F2FE] border border-[#BAE6FD] px-2 py-0.5 rounded text-[10px] text-[#0369A1] shadow-xs">F9</kbd> Recuperar
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="bg-[#FEE2E2] border border-[#FECACA] px-2 py-0.5 rounded text-[10px] text-[#DC2626] shadow-xs">ESC</kbd> Limpiar
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-sans font-extrabold text-[#0284C7]">
        <span>⚡ Modo POS Sin Ratón Activo</span>
      </div>
    </div>
  );
}
