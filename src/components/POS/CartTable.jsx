import React from 'react';

/**
 * SYSPIM MARKET - TABLA DE PRODUCTOS EN CAJA & VENTA RÁPIDA 1-TAP
 */
export function CartTable({
  cart,
  cartCount,
  cartListRef,
  selectedCustomer,
  setSelectedCustomer,
  clientesList,
  CLIENTES,
  updateCartQty,
  setCart,
  tenantProducts,
  addToCart
}) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between flex-1 min-h-[calc(100vh-14rem)]">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📋</span>
            <h3 className="font-extrabold text-base text-[#0F172A] font-jakarta">Detalle de la Venta</h3>
            <span className="bg-[#E0F2FE] text-[#0284C7] font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              {cartCount} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="px-2.5 py-1 rounded-xl border border-[#FECACA] bg-[#FEE2E2] text-[#DC2626] font-bold text-xs hover:bg-[#FCA5A5] transition-colors mr-2"
                title="Limpiar Carrito"
              >
                🗑️ Limpiar
              </button>
            )}

            <span className="text-xs font-extrabold text-[#64748B]">Cliente:</span>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-extrabold text-[#0F172A] focus:outline-none"
            >
              {(clientesList.length > 0 ? clientesList : CLIENTES).map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS EN CAJA / VENTA RÁPIDA 1-TAP */}
        <div ref={cartListRef} className="mt-4 overflow-x-auto max-h-[calc(100vh-22rem)] overflow-y-auto border border-[#E2E8F0] rounded-2xl custom-scrollbar shadow-inner">
          {cart.length === 0 ? (
            <div className="py-8 px-4 bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4 rounded-xl">
              <div className="text-center space-y-1">
                <span className="text-xs font-extrabold text-[#0284C7] bg-[#E0F2FE] border border-[#BAE6FD] px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                  ⚡ Venta Rápida 1-Tap
                </span>
                <p className="font-extrabold text-sm sm:text-base text-[#0F172A] pt-1 font-jakarta">
                  Selecciona un producto frecuente o busca arriba [F2]
                </p>
              </div>

              {/* GRID DE FAVORITOS / MÁS VENDIDOS (MÁXIMO 8 PRODUCTOS) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-2xl">
                {tenantProducts.slice(0, 8).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addToCart(p)}
                    className="bg-white hover:bg-[#E0F2FE] border border-[#E2E8F0] hover:border-[#0284C7] p-3 rounded-xl text-left shadow-sm transition-all group flex flex-col justify-between active:scale-[0.98]"
                  >
                    <span className="font-extrabold text-xs text-[#0F172A] group-hover:text-[#0284C7] line-clamp-2 leading-tight font-jakarta">
                      {p.nombre}
                    </span>
                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-[#F1F5F9] w-full">
                      <span className="font-extrabold text-xs text-[#0284C7] font-mono-tabular">RD$ {p.precio}</span>
                      <span className="text-[10px] font-extrabold bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-md group-hover:bg-[#0284C7] group-hover:text-white transition-colors">
                        + Vender
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase font-mono tracking-wider text-xs">
                  <th className="py-3.5 px-4 font-extrabold">PRODUCTO</th>
                  <th className="py-3.5 px-4 font-extrabold text-center">EA</th>
                  <th className="py-3.5 px-4 font-extrabold text-center">CANT.</th>
                  <th className="py-3.5 px-4 font-extrabold text-right">PRECIO</th>
                  <th className="py-3.5 px-4 font-extrabold text-right">TOTAL</th>
                  <th className="py-3.5 px-4 font-extrabold text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] bg-white">
                {cart.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F0F9FF] transition-colors">
                    
                    {/* NOMBRE Y CATEGORIA DEL PRODUCTO */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-sm sm:text-base text-[#0F172A] font-jakarta block leading-tight">
                        {item.nombre}
                      </span>
                      <span className="text-[11px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md inline-block mt-1">
                        {item.categoria || 'General'}
                      </span>
                    </td>

                    {/* STOCK EXISTENCIA (EA) */}
                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-xs text-[#15803D]">
                      {item.stock || 99}
                    </td>

                    {/* CANTIDAD */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-2 py-1 max-w-[100px] mx-auto shadow-sm">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="w-5 h-5 rounded-lg flex items-center justify-center text-xs font-extrabold bg-white text-[#0F172A] border border-[#CBD5E1] hover:bg-[#EF4444] hover:text-white transition-colors"
                        >
                          -
                        </button>
                        <span className="font-mono text-sm font-extrabold text-[#0F172A] min-w-[20px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="w-5 h-5 rounded-lg flex items-center justify-center text-xs font-extrabold bg-white text-[#0F172A] border border-[#CBD5E1] hover:bg-[#0284C7] hover:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* PRECIO */}
                    <td className="py-3.5 px-4 text-right font-extrabold text-sm sm:text-base text-[#0F172A] font-mono-tabular">
                      RD$ {item.precio.toFixed(2)}
                    </td>

                    {/* TOTAL */}
                    <td className="py-3.5 px-4 text-right font-extrabold text-sm sm:text-base text-[#0284C7] font-mono-tabular">
                      RD$ {(item.precio * item.qty).toFixed(2)}
                    </td>

                    {/* ELIMINAR */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => updateCartQty(item.id, -item.qty)}
                        title="Quitar ítem"
                        className="w-6 h-6 rounded-full text-[#EF4444] hover:bg-[#FEE2E2] font-bold text-xs inline-flex items-center justify-center transition-colors"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
