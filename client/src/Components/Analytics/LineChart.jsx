import { useState } from "react";

export default function LineChart({ data = [], xKey = "date", yKey = "views", label = "Views", color = "#a855f7" }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
        <p className="text-xs text-zinc-500">No chart data available for this range.</p>
      </div>
    );
  }

  const values = data.map((d) => d[yKey] || 0);
  const maxValue = Math.max(...values, 5); // Ensure scale has room even with low values
  const height = 220;
  const width = 600;
  const padding = { top: 20, right: 20, bottom: 35, left: 40 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const points = data.map((item, idx) => {
    const x = padding.left + (idx / Math.max(1, data.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (item[yKey] / maxValue) * graphHeight;
    return { x, y, data: item };
  });

  const pathD = points.reduce((acc, point, idx) => {
    return `${acc} ${idx === 0 ? "M" : "L"} ${point.x} ${point.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  return (
    <div className="relative w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        <defs>
          <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

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

        {/* Area fill */}
        <path d={areaD} fill="url(#violetGradient)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive points */}
        {points.map((pt, idx) => (
          <g key={idx} className="cursor-pointer">
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.idx === idx ? "6" : "3.5"}
              fill={hoveredPoint?.idx === idx ? "#ffffff" : color}
              stroke={color}
              strokeWidth="2"
              onMouseEnter={() => setHoveredPoint({ idx, ...pt })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}

        {/* X-axis labels (showing ~5 spaced dates) */}
        {points
          .filter((_, idx) => idx % Math.ceil(data.length / 5) === 0 || idx === data.length - 1)
          .map((pt, idx) => (
            <text
              key={idx}
              x={pt.x}
              y={height - 10}
              textAnchor="middle"
              className="text-[10px] fill-zinc-500 font-mono"
            >
              {pt.data[xKey]?.slice(5)}
            </text>
          ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-10 pointer-events-none bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs rounded-lg px-2.5 py-1.5 shadow-xl transition-all duration-75"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100 - 15}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="text-[11px] text-zinc-400 font-medium">{hoveredPoint.data[xKey]}</p>
          <p className="text-xs font-semibold text-violet-400">
            {hoveredPoint.data[yKey]} {label}
          </p>
        </div>
      )}
    </div>
  );
}
