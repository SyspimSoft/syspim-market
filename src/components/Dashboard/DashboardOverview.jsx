import React from 'react';
import { calculateGrossProfit, calculateDailyTargetProgress, calculateSalesComparison, calculateCashFlow } from '../../services/financialService.js';
import { calculateInventoryDepletionForecast, getPrioritizedAlerts, calculateSalesByHour, calculateAverageTicket } from '../../services/analyticsService.js';
import { calculateCourierCashBalances } from '../../services/cashControlService.js';

/**
 * SYSPIM MARKET - DASHBOARD EJECUTIVO (Nivel 1 Gerencial & Centro de Control Operativo)
 */
export function DashboardOverview({
  productos = [],
  pedidos = [],
  activeTenant,
  onNavigate
}) {
  const ctx = { tenantId: activeTenant?.id || 't-001' };

  // Métricas Financieras y Analítica
  const profit = calculateGrossProfit({ tenantId: ctx.tenantId, pedidos, productos }, ctx);
  const targetProgress = calculateDailyTargetProgress({ pedidos, target: 70000 }, ctx);
  const trends = calculateSalesComparison({ pedidos }, ctx);
  const cashFlow = calculateCashFlow({ apertura: 10000, pedidos }, ctx);
  const forecast = calculateInventoryDepletionForecast({ productos, pedidos }, ctx);
  const courierBalances = calculateCourierCashBalances({ pedidos }, ctx);
  const alerts = getPrioritizedAlerts({ productos, pedidos, courierBalances }, ctx);
  const avgTicket = calculateAverageTicket({ pedidos }, ctx);

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* HEADER DE BIENVENIDA Y ACCIONES RÁPIDAS DE CONTROL */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <h2 className="font-extrabold text-xl sm:text-2xl text-[#0F172A] font-jakarta">
              Centro de Control Gerencial — {activeTenant?.nombre || 'Colmado Don Pedro'}
            </h2>
          </div>
          <p className="text-xs text-[#64748B] pt-1 font-medium">
            Resumen ejecutivo del negocio, métricas en tiempo real y alertas operativas priorizadas.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => onNavigate('pos')}
            className="px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs shadow-md shadow-[#0284C7]/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>🛒 Ir a POS Caja</span>
          </button>
          <button
            onClick={() => onNavigate('cash-drawer')}
            className="px-4 py-2.5 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#15803D] border border-[#86EFAC] font-extrabold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>💰 Arqueo Caja</span>
          </button>
          <button
            onClick={() => onNavigate('delivery-control')}
            className="px-4 py-2.5 rounded-xl bg-[#FEFCE8] hover:bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A] font-extrabold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>🚚 Control Delivery</span>
          </button>
        </div>
      </div>

      {/* 5 TARJETAS DEL RESUMEN EJECUTIVO CON PROGRESO DE OBJETIVO DIARIO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* TARJETA 1: VENTAS HOY CON BARRA DE PROGRESO (OBJETIVO RD$ 70,000) */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-[22px] shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Ventas Hoy</span>
            <span className="text-xs font-extrabold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              ▲ +{trends.vsAyer.pct}% vs ayer
            </span>
          </div>
          <span className="text-2xl font-black text-[#0F172A] block font-jakarta">
            RD$ {targetProgress.totalVentas.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
          </span>

          {/* BARRA DE PROGRESO METAS DIARIAS */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] font-extrabold text-[#64748B]">
              <span>Meta RD$ {targetProgress.target.toLocaleString()}</span>
              <span className="text-[#0284C7] font-black">{targetProgress.porcentaje}%</span>
            </div>
            <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
              <div className="bg-[#0284C7] h-full rounded-full transition-all" style={{ width: `${targetProgress.porcentaje}%` }}></div>
            </div>
          </div>
        </div>

        {/* TARJETA 2: GANANCIA BRUTA ESTIMADA */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-[22px] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Ganancia Bruta</span>
            <span className="text-xs font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md">
              Margen: {profit.margenPorcentaje}%
            </span>
          </div>
          <span className="text-2xl font-black text-[#15803D] block font-jakarta">
            RD$ {profit.gananciaBruta.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[10.5px] text-[#64748B] font-medium">Ventas netas menos costo estimado</p>
        </div>

        {/* TARJETA 3: CAJA DISPONIBLE */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-[22px] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Caja Disponible</span>
            <span className="text-xs font-bold text-[#854D0E] bg-[#FEFCE8] px-2 py-0.5 rounded-md">
              Apertura + Cash
            </span>
          </div>
          <span className="text-2xl font-black text-[#0F172A] block font-jakarta">
            RD$ {cashFlow.disponible.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[10.5px] text-[#64748B] font-medium">Efectivo líquido en caja registradora</p>
        </div>

        {/* TARJETA 4: DELIVERY PENDIENTE */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-[22px] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Delivery Pendiente</span>
            <span className="text-xs font-bold text-[#9333EA] bg-[#F3E8FF] px-2 py-0.5 rounded-md">
              Repartidores
            </span>
          </div>
          <span className="text-2xl font-black text-[#9333EA] block font-jakarta">
            RD$ {courierBalances.filter(c => c.estado !== 'CUADRADO').reduce((acc, c) => acc + c.dineroEsperado, 0).toLocaleString('es-DO')}
          </span>
          <p className="text-[10.5px] text-[#64748B] font-medium">Dinero en la calle pendiente de arqueo</p>
        </div>

        {/* TARJETA 5: ALERTAS Y TICKET PROMEDIO */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-[22px] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Ticket Promedio</span>
            <span className="text-xs font-bold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-md">
              {alerts.length} Alertas
            </span>
          </div>
          <span className="text-2xl font-black text-[#0F172A] block font-jakarta">
            RD$ {avgTicket.toFixed(2)}
          </span>
          <p className="text-[10.5px] text-[#64748B] font-medium">Promedio por cada orden despachada</p>
        </div>

      </div>

      {/* GRID DE DOS COLUMNAS: CENTRO DE ALERTAS PRIORIZADAS & PRONÓSTICO DE AGOTAMIENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA (7 COL): CENTRO DE ALERTAS PRIORIZADAS */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <h3 className="font-extrabold text-base text-[#0F172A] font-jakarta">Centro de Alertas Operativas</h3>
            </div>
            <span className="bg-[#FEE2E2] text-[#DC2626] font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              Prioridad Alta
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map(alt => (
              <div
                key={alt.id}
                className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                  alt.severity === 'CRITICAL' ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]' :
                  alt.severity === 'WARNING' ? 'bg-[#FEFCE8] border-[#FEF08A] text-[#854D0E]' :
                  'bg-[#F0F9FF] border-[#BAE6FD] text-[#0369A1]'
                }`}
              >
                <span className="text-xl flex-shrink-0">{alt.icon}</span>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm font-jakarta">{alt.title}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 font-medium">{alt.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA (5 COL): PRONÓSTICO DE AGOTAMIENTO DE STOCK */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <span className="text-xl">📉</span>
              <h3 className="font-extrabold text-base text-[#0F172A] font-jakarta">Pronóstico de Stock</h3>
            </div>
            <span className="bg-[#FEFCE8] text-[#854D0E] font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              Rotación
            </span>
          </div>

          <div className="space-y-2.5">
            {forecast.length === 0 ? (
              <p className="text-xs text-[#64748B] font-bold text-center py-6">🟢 No hay productos con riesgo inminente de agotamiento.</p>
            ) : (
              forecast.slice(0, 5).map(item => (
                <div key={item.id} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-xs text-[#0F172A] truncate block font-jakarta">{item.nombre}</span>
                    <span className="text-[10.5px] text-[#DC2626] font-bold block mt-0.5">{item.forecast}</span>
                  </div>
                  <span className="bg-white border border-[#CBD5E1] text-[#0F172A] font-mono font-extrabold text-xs px-2.5 py-1 rounded-lg flex-shrink-0">
                    Stock: {item.stock}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
