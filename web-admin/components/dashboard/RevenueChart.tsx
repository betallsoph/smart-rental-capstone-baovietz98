"use client";

import { MoreHorizontal, TrendingUp } from "lucide-react";

interface RevenueChartProps {
  data: { label: string; value: number; collected?: number; debt?: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // Determine if we have any data to show
  const hasData = data.some((d) => d.value > 0);
  const maxValue = hasData ? Math.max(...data.map((d) => d.value)) : 1000000; // Default scale if empty

  const formatShortCurrency = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} tỷ`;
    if (val >= 1000000)
      return `${(val / 1000000).toFixed(1).replace(/\.0$/, "")} tr`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="claude-card p-6 h-full flex flex-col group hover:border-[#D97757]/30 transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl claude-header mb-2 flex items-center gap-2">
            Biến động doanh thu
            {!hasData && (
              <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-sans uppercase tracking-wider">
                No Data
              </span>
            )}
          </h3>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>{" "}
              Thực thu
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Còn
              nợ
            </span>
          </div>
        </div>
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 min-h-[220px]">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <TrendingUp size={32} className="opacity-20 text-gray-400" />
          </div>
          <p className="text-sm font-medium">Chưa có dữ liệu doanh thu</p>
        </div>
      )}

      {/* Main Chart Layout: CSS Grid (Fixed Height to prevent collapse) */}
      {hasData && (
        <div className="grid grid-cols-[50px_1fr] gap-2 h-[240px] w-full pt-4">
          {/* Y-Axis Labels (Right-aligned in their column) */}
          <div className="relative h-full w-full text-right text-gray-400 text-[10px] sm:text-xs font-mono">
            {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
              <span
                key={i}
                className="absolute right-0 translate-y-1/2 block leading-none"
                style={{ bottom: `${tick * 100}%` }}
              >
                {tick === 0 ? "0" : formatShortCurrency(maxValue * tick)}
              </span>
            ))}
          </div>

          {/* Chart Area */}
          <div className="relative h-full w-full border-l border-dashed border-gray-100/50">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
                <div
                  key={i}
                  className="absolute inset-x-0 border-t border-dashed border-gray-100 w-full"
                  style={{ bottom: `${tick * 100}%` }}
                ></div>
              ))}
            </div>

            {/* Bars Container */}
            <div className="absolute inset-0 z-10 flex check items-end justify-between px-2 sm:px-6">
              {data.map((item, idx) => {
                const safeValue = Math.max(item.value, 0);
                const heightPct =
                  maxValue > 0 ? (safeValue / maxValue) * 100 : 0;
                const debt = item.debt || 0;
                const collected = item.collected || item.value - debt;
                const debtHeightPct =
                  safeValue > 0 ? (debt / safeValue) * 100 : 0;
                const collectedHeightPct =
                  safeValue > 0 ? (collected / safeValue) * 100 : 0;
                const isCurrent = idx === data.length - 1;

                return (
                  <div
                    key={idx}
                    className="flex-1 max-w-[40px] h-full flex flex-col justify-end group/bar relative cursor-pointer"
                  >
                    {/* Vertical Guide Line (Persistent) */}
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] border-r border-dashed border-gray-100 -z-10 group-hover/bar:border-orange-200 transition-colors"></div>
                    {/* Hover background for column */}
                    <div className="absolute inset-x-[-4px] -top-2 -bottom-2 bg-transparent group-hover/bar:bg-orange-50/30 rounded-lg transition-colors -z-20"></div>

                    {/* Popover Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs p-3 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10 pointer-events-none min-w-[140px] hidden md:block">
                      <p className="font-bold border-b border-white/10 pb-2 mb-2 flex justify-between gap-6">
                        <span className="text-gray-300">{item.label}</span>
                        <span className="text-white text-base">
                          {formatShortCurrency(item.value)}
                        </span>
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between gap-3 text-orange-200">
                          <span className="flex items-center gap-1.5 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            Thực thu
                          </span>
                          <span className="font-mono font-medium">
                            {formatCurrency(collected)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3 text-gray-300">
                          <span className="flex items-center gap-1.5 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            Còn nợ
                          </span>
                          <span className="font-mono font-medium">
                            {formatCurrency(debt)}
                          </span>
                        </div>
                      </div>
                      {/* Arrow */}
                      <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 border-r border-b border-white/10"></div>
                    </div>

                    {/* Value Badge (Persistent) */}
                    {item.value > 0 && (
                      <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white border border-gray-200 shadow-sm rounded-lg text-[10px] font-bold text-gray-600 opacity-100 group-hover/bar:opacity-0 transition-opacity duration-200 whitespace-nowrap z-20 group-hover/bar:z-0">
                        {formatShortCurrency(item.value)}
                      </div>
                    )}

                    {/* The Bar Itself */}
                    <div
                      className="w-full mx-auto rounded-t-sm transition-all duration-500 flex flex-col justify-end overflow-hidden relative shadow-sm group-hover/bar:shadow-md group-hover/bar:-translate-y-1"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    >
                      {/* Debt (Top) */}
                      {debt > 0 && (
                        <div
                          className="w-full bg-gray-300 relative"
                          style={{ height: `${debtHeightPct}%` }}
                        />
                      )}
                      {/* Collected (Bottom) */}
                      {collected > 0 && (
                        <div
                          className={`w-full relative ${
                            isCurrent ? "bg-orange-500" : "bg-emerald-600"
                          }`}
                          style={{ height: `${collectedHeightPct}%` }}
                        />
                      )}
                    </div>

                    {/* X-Axis Label */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center w-full">
                      <span
                        className={`text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wide px-1.5 py-0.5 rounded ${
                          isCurrent
                            ? "bg-orange-50 text-orange-600"
                            : "text-gray-400 group-hover/bar:text-gray-700 group-hover/bar:bg-gray-100"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
