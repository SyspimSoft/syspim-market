import React from 'react';

/**
 * SYSPIM MARKET - HEADER NAV UNIFICADO (1 SOLA FILA)
 */
export function HeaderNav({
  activeTenant,
  activeTab,
  setActiveTab,
  tenantProductsCount,
  pedidosCount,
  clientesCount,
  onCopyCatalogLink,
  onOpenShareModal,
  onOpenDiagnosticsModal,
  onOpenKardexModal
}) {
  return (
    <header className="bg-[#FFFFFF] border-b border-[#E2E8F0] text-[#0F172A] px-4 lg:px-6 py-2.5 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* BRAND LOGO & TENANT */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0284C7] flex items-center justify-center text-white font-bold text-base shadow-sm">
            🛒
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg tracking-tight text-[#0F172A]">
              SYSPIM<span className="text-[#0284C7]">MARKET</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
              🏪 {activeTenant?.nombre || 'Colmado Don Pedro'}
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] px-2 py-0.5 rounded-full text-[10px] font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Online
            </span>
          </div>
        </div>

        {/* NAVEGACIÓN MÓDULOS POS TENANT */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'pos', icon: '🛒', label: 'POS (Caja)' },
            { id: 'inventory', icon: '📦', label: `Inventario (${tenantProductsCount})` },
            { id: 'orders', icon: '📋', label: `Pedidos (${pedidosCount})` },
            { id: 'customers', icon: '👥', label: `Clientes (${clientesCount})` }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === m.id
                  ? 'bg-[#0284C7] text-white shadow-md shadow-[#0284C7]/20'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              <span>{m.icon}</span> <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* ACCIONES SECUNDARIAS & PANTALLA CLIENTE */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenKardexModal}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#FEFCE8] hover:bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A] transition-all flex items-center gap-1 shadow-sm whitespace-nowrap"
            title="Consultar Historial de Movimientos Auditoría Kardex"
          >
            <span>📜 Kardex</span>
          </button>

          <a
            href={`catalog.html?tenant=${activeTenant?.slug || 'colmado-don-pedro'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] border border-[#BAE6FD] transition-all flex items-center gap-1 shadow-sm whitespace-nowrap"
            title="Abrir el catálogo digital independiente en una nueva ventana para el cliente"
          >
            <span>🛍️ Pantalla Cliente</span>
            <span className="text-[10px]">↗</span>
          </a>

          {/* MENÚ SECUNDARIO DESPLEGABLE */}
          <div className="relative group">
            <button className="w-8 h-8 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-[#475569] font-bold text-sm flex items-center justify-center transition-colors">
              ⋮
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 hidden group-hover:block divide-y divide-[#F1F5F9] text-xs">
              <button 
                onClick={onCopyCatalogLink}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#F8FAFC] font-semibold text-[#0F172A] flex items-center gap-2"
              >
                <span>🔗</span> Copiar Link PWA
              </button>
              <button 
                onClick={onOpenShareModal}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#F8FAFC] font-semibold text-[#0F172A] flex items-center gap-2"
              >
                <span>📲</span> Enviar WhatsApp
              </button>
              <button 
                onClick={onOpenDiagnosticsModal}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#F8FAFC] font-semibold text-[#0F172A] flex items-center gap-2"
              >
                <span>🛠️</span> Diagnóstico
              </button>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
