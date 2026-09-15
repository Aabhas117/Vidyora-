import { useState } from "react";

export default function BarChart({ data = [], xKey = "title", yKey = "views", label = "Views", color = "#8b5cf6" }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
        <p className="text-xs text-zinc-500">No data available for top videos.</p>
      </div>
    );
  }

  const values = data.map((d) => d[yKey] || 0);
  const maxValue = Math.max(...values, 5);
  const height = 220;
  const width = 600;
  const padding = { top: 20, right: 20, bottom: 45, left: 40 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const barWidth = Math.max(12, Math.min(36, graphWidth / data.length - 8));

  return (
    <div className="relative w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding.top + graphHeight * (1 - ratio);
          const val = Math.round(maxValue * ratio);
          return (
            <g key={idx}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#27272a" strokeDasharray="3 3" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-zinc-500 font-mono">
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const x = padding.left + (idx + 0.5) * (graphWidth / data.length) - barWidth / 2;
          const barHeight = Math.max(4, (item[yKey] / maxValue) * graphHeight);
          const y = padding.top + graphHeight - barHeight;
          const isHovered = hoveredBar?.idx === idx;

          return (
            <g
              key={idx}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredBar({ idx, x: x + barWidth / 2, y, item })}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={isHovered ? "#a855f7" : color}
                opacity={isHovered ? 1 : 0.85}
              />
              <text
                x={x + barWidth / 2}
                y={height - 15}
                textAnchor="middle"
                className="text-[10px] fill-zinc-400 font-medium"
              >
                {item[xKey]?.length > 10 ? `${item[xKey].slice(0, 8)}…` : item[xKey]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredBar && (
        <div
          className="absolute z-10 pointer-events-none bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs rounded-lg px-3 py-1.5 shadow-xl transition-all duration-75 max-w-xs"
          style={{
            left: `${(hoveredBar.x / width) * 100}%`,
            top: `${(hoveredBar.y / height) * 100 - 15}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="text-xs font-semibold text-zinc-100 truncate">{hoveredBar.item[xKey]}</p>
          <p className="text-xs text-violet-400 mt-0.5 font-medium">
            {hoveredBar.item[yKey]} {label}
          </p>
        </div>
      )}
    </div>
  );
}
