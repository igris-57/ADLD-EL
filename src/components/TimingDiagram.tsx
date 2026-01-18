import React, { useMemo, useRef, useEffect } from 'react';
import type { Signals } from '../hooks/useDMASimulation';

interface TimingDiagramProps {
    history: { cycle: number; signals: Signals }[];
}

const SIGNAL_NAMES: (keyof Signals)[] = ['dmaRequest', 'busGrant', 'transferActive', 'interrupt', 'cpuBusy'];
const LABELS = ['DMA_REQ', 'BUS_GRANT', 'DMA_ACTIVE', 'INTERRUPT', 'CPU_BUSY'];
const COLORS = ['#fde047', '#22c55e', '#f97316', '#a855f7', '#06b6d4'];

const TimingDiagram: React.FC<TimingDiagramProps> = ({ history }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const width = Math.max(800, history.length * 30); // Dynamic width
    const height = 260; // Increased height for axis
    const rowHeight = 40;
    const stepWidth = 30; // Bigger steps

    // Auto-scroll to end
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollLeft = containerRef.current.scrollWidth;
        }
    }, [history.length]);

    // Create paths
    const paths = useMemo(() => {
        if (history.length === 0) return SIGNAL_NAMES.map(() => `M 0 0`);

        return SIGNAL_NAMES.map((signalKey, index) => {
            const yBase = (index * rowHeight) + 30;
            const yHigh = yBase - 15;
            const yLow = yBase + 15;

            let d = ``;

            history.forEach((entry, i) => {
                const x = i * stepWidth;
                const val = entry.signals[signalKey];
                const y = val ? yHigh : yLow;

                if (i === 0) {
                    d = `M ${x} ${y}`;
                } else {
                    const prevVal = history[i - 1].signals[signalKey];
                    const prevY = prevVal ? yHigh : yLow;
                    // Square wave transition
                    d += ` L ${x} ${prevY} L ${x} ${y}`;
                }
            });

            // Extend to end of current cycle visually
            const lastI = history.length - 1;
            const lastX = lastI * stepWidth;
            const lastVal = history[lastI].signals[signalKey];
            const lastY = lastVal ? yHigh : yLow;
            d += ` L ${lastX + stepWidth} ${lastY}`;

            return d;
        });
    }, [history]);

    return (
        <div className="w-full bg-gray-900 rounded-lg border border-gray-800 p-4 relative flex flex-col h-full">
            <h3 className="text-gray-400 text-xs font-bold uppercase mb-2 flex justify-between">
                <span>Timing Analysis (Real-time)</span>
                <span className="text-xs text-gray-600 ml-auto">Cycle: {history.length > 0 ? history[history.length - 1].cycle : 0}</span>
            </h3>

            {/* Container for Fixed Labels + Scrollable Graph */}
            <div className="flex w-full h-full overflow-hidden border border-gray-800 rounded">

                {/* Fixed Labels Column */}
                <div className="w-[100px] flex-shrink-0 bg-gray-950 z-10 border-r border-gray-800 relative shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
                    {LABELS.map((label, i) => (
                        <div key={i} className="absolute right-2 text-[10px] font-bold font-mono py-1 px-1 rounded flex items-center justify-end"
                            style={{ top: (i * rowHeight) + 30, color: COLORS[i], height: '20px', transform: 'translateY(-50%)' }}>
                            {label}
                        </div>
                    ))}
                </div>

                {/* Scrollable Graph Area */}
                <div className="flex-1 relative overflow-x-auto custom-scrollbar bg-gray-900" ref={containerRef}>
                    <svg width={width} height={height} className="block">
                        <defs>
                            <pattern id="grid" width={stepWidth} height={height} patternUnits="userSpaceOnUse">
                                <path d={`M ${stepWidth} 0 L ${stepWidth} ${height}`} stroke="#1f2937" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width={width} height={height} fill="url(#grid)" />

                        {/* Horizontal Guide lines */}
                        {Array.from({ length: 5 }).map((_, i) => (
                            <line key={i} x1="0" y1={(i * rowHeight) + 30} x2={width} y2={(i * rowHeight) + 30} stroke="#374151" strokeWidth="1" strokeDasharray="2" opacity="0.3" />
                        ))}

                        {/* Signal Paths */}
                        {paths.map((d, i) => (
                            <g key={i}>
                                {/* Glow effect by duplicating path with blur */}
                                <path d={d} stroke={COLORS[i]} strokeWidth="4" fill="none" opacity="0.3" filter="blur(4px)" />
                                <path d={d} stroke={COLORS[i]} strokeWidth="2" fill="none" />
                            </g>
                        ))}

                        {/* Time Axis at Bottom */}
                        {history.map((entry, i) => (
                            <text key={i} x={(i * stepWidth)} y={height - 10} fill="#6b7280" fontSize="10" fontFamily="monospace" textAnchor="middle">
                                {entry.cycle % 5 === 0 ? entry.cycle : ''}
                            </text>
                        ))}
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default TimingDiagram;
