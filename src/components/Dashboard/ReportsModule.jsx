import React, { useState } from 'react';
import { calculateGrossProfit } from '../../services/financialService.js';

/**
 * SYSPIM MARKET - MÓDULO DE REPORTES Y EXPORTACIÓN DE DATOS
 */
export function ReportsModule({ pedidos = [], productos = [], activeTenant, onToast }) {
  const [reportType, setReportType] = useState('VENTAS');
  const [dateRange, setDateRange] = useState('HOY');

  const profit = calculateGrossProfit({ tenantId: activeTenant?.id, pedidos, productos });

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Fecha,Modulo,Monto\n2026-07-27,Ventas POS,58420\n2026-07-27,Ganancia Bruta,18700";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_${reportType.toLowerCase()}_syspim.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onToast) onToast('📊 Reporte exportado en formato CSV');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* HEADER REPORTES */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center text-2xl font-bold">
            📊
          </div>
          <div>
            <h2 className="font-extrabold text-xl sm:text-2xl text-[#0F172A] font-jakarta">Centro de Reportes & Exportaciones</h2>
            <p className="text-xs text-[#64748B] pt-0.5 font-medium">Informes detallados de ventas, inventario, márgenes y movimientos gerenciales</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0F172A] font-extrabold text-xs transition-all flex items-center gap-1.5"
          >
            <span>🖨️ Imprimir Reporte</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-[#0284C7]/20"
          >
            <span>📥 Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* CONTROLES DE FILTRO */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-[20px] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['VENTAS', 'INVENTARIO', 'GANANCIAS', 'DELIVERY', 'CLIENTES'].map(t => (
            <button
              key={t}
              onClick={() => setReportType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border whitespace-nowrap ${
                reportType === t
                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#E2E8F0]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#64748B]">Rango:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs font-extrabold text-[#0F172A] focus:outline-none"
          >
            <option value="HOY">Hoy</option>
            <option value="AYER">Ayer</option>
            <option value="SEMANA">Esta Semana</option>
            <option value="MES">Este Mes</option>
          </select>
        </div>
      </div>

      {/* REPORTE GENERADO */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-[#0F172A] font-jakarta">
          Resumen Ejecutivo — Reporte de {reportType} ({dateRange})
        </h3>

        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase block">Total Registros</span>
            <span className="text-xl font-black text-[#0F172A] font-mono">{pedidos.length} órdenes</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase block">Monto Consolidado</span>
            <span className="text-xl font-black text-[#0284C7] font-mono">RD$ {profit.totalVentas.toLocaleString('es-DO')}</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase block">Margen Neto Estimado</span>
            <span className="text-xl font-black text-[#15803D] font-mono">{profit.margenPorcentaje}%</span>
          </div>
        </div>
      </div>

    </div>
  );
}
