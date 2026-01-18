import React from 'react';
import type { ComparisonResults } from '../hooks/useDMASimulation';
import { BarChart3, Clock, Cpu, Zap } from 'lucide-react';

interface ComparisonPanelProps {
    results: ComparisonResults;
    totalBlocks: number;
}

const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ results }) => {
    // In unified simulation, we only show DMA results
    const stats = results.dma;
    const hasData = !!stats;

    if (!hasData) {
        return (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-xl">
                <h3 className="text-white font-bold text-sm uppercase mb-4 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <BarChart3 size={16} />
                        Execution Statistics
                    </span>
                    <span className="text-[10px] text-gray-500 bg-gray-900 px-2 py-1 rounded">
                        WAITING FOR SIMULATION
                    </span>
                </h3>
                <div className="text-center text-gray-500 py-8">
                    <div className="text-sm mb-2">Run the simulation to see performance metrics</div>
                    <div className="text-xs">CPU execution, DMA transfer, and efficiency analysis</div>
                </div>
            </div>
        );
    }

    const { totalCycles, cpuBusyCycles, dmaCycles, cpuIdleCycles, efficiency } = stats;

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-xl">
            <h3 className="text-white font-bold text-sm uppercase mb-4 flex justify-between items-center">
                <span className="flex items-center gap-2">
                    <BarChart3 size={16} />
                    Execution Statistics
                </span>
                <span className="text-[10px] text-neon-green bg-gray-900 px-2 py-1 rounded">
                    SIMULATION COMPLETE
                </span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {/* Left: Metrics Cards */}
                <div className="space-y-2">
                    {/* Total Cycles */}
                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={12} className="text-neon-cyan" />
                            <span className="text-xs text-gray-400">Total Cycles</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-white">{totalCycles}</div>
                    </div>

                    {/* CPU Busy Cycles */}
                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Cpu size={12} className="text-blue-400" />
                            <span className="text-xs text-gray-400">CPU Active</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-blue-400">{cpuBusyCycles}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {((cpuBusyCycles / totalCycles) * 100).toFixed(1)}% of total
                        </div>
                    </div>

                    {/* DMA Cycles */}
                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={12} className="text-neon-green" />
                            <span className="text-xs text-gray-400">DMA Active</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-neon-green">{dmaCycles}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {((dmaCycles / totalCycles) * 100).toFixed(1)}% of total
                        </div>
                    </div>
                </div>

                {/* Right: Timeline Visualization */}
                <div className="flex flex-col justify-center">
                    {/* Timeline Bar */}
                    <div className="mb-4">
                        <div className="text-xs text-gray-400 mb-2">Execution Timeline</div>
                        <div className="h-8 bg-gray-900 rounded overflow-hidden flex border border-gray-700">
                            {/* CPU Phase 1 (0-16) */}
                            <div
                                style={{ width: `${(17 / totalCycles) * 100}%` }}
                                className="bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white"
                                title="CPU Execution (Cycles 0-16)"
                            >
                                CPU
                            </div>
                            {/* DMA Phase (17-24) */}
                            <div
                                style={{ width: `${(dmaCycles / totalCycles) * 100}%` }}
                                className="bg-neon-green flex items-center justify-center text-[9px] font-bold text-black"
                                title={`DMA Transfer (Cycles 17-${17 + dmaCycles - 1})`}
                            >
                                DMA
                            </div>
                            {/* CPU Phase 2 (Resume) */}
                            <div
                                style={{ width: `${((totalCycles - 17 - dmaCycles) / totalCycles) * 100}%` }}
                                className="bg-blue-400 flex items-center justify-center text-[9px] font-bold text-white"
                                title="CPU Resume"
                            >
                                CPU
                            </div>
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-500 mt-1">
                            <span>Cycle 0</span>
                            <span>Cycle 17</span>
                            <span>Cycle {totalCycles}</span>
                        </div>
                    </div>

                    {/* CPU Idle Time */}
                    <div className="bg-yellow-900/20 border border-yellow-700/50 p-2 rounded">
                        <div className="text-xs text-yellow-300 font-bold mb-1">CPU Idle During DMA</div>
                        <div className="text-lg font-mono text-yellow-200">{cpuIdleCycles} cycles</div>
                        <div className="text-[10px] text-yellow-400/80 mt-1">
                            CPU was free to do other work during DMA transfer
                        </div>
                    </div>

                    {/* Efficiency */}
                    <div className="bg-green-900/20 border border-green-700/50 p-2 rounded mt-2">
                        <div className="text-xs text-green-300 font-bold mb-1">DMA Efficiency Gain</div>
                        <div className="text-2xl font-mono text-neon-green">{efficiency.toFixed(1)}%</div>
                        <div className="text-[10px] text-green-400/80 mt-1">
                            Time saved by offloading I/O to DMA
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonPanel;
