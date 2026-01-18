import React from 'react';
import { Cpu, Database, HardDrive, Network } from 'lucide-react';
import type { DMAState, Signals } from '../hooks/useDMASimulation';
import clsx from 'clsx';

interface BlockDiagramProps {
    state: DMAState;
    signals: Signals;
}

const BlockDiagram: React.FC<BlockDiagramProps> = ({ state, signals }) => {
    // Styles for active components
    const cpuActive = signals.cpuBusy;
    const dmaActive = state === 'DMA_ACTIVE';
    const memActive = signals.memRead || signals.memWrite;
    const ioActive = signals.transferActive;

    return (
        <div className="relative w-full h-[300px] bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-xl overflow-hidden select-none">
            <h3 className="text-gray-400 text-sm font-bold absolute top-2 left-4 uppercase tracking-wider">System Architecture</h3>

            {/* System Bus (Central Highway) */}
            <div className="absolute top-1/2 left-4 right-4 h-6 -mt-3 bg-gray-700 rounded z-0 flex items-center justify-center">
                <span className="text-xs text-gray-500 font-mono tracking-[0.5em] opacity-30">SYSTEM BUS</span>
                {(cpuActive || dmaActive) && (
                    <div className={clsx(
                        "absolute inset-0 rounded animate-pulse opacity-40 transition-colors duration-300",
                        dmaActive ? "bg-neon-green" : "bg-neon-cyan"
                    )} />
                )}
            </div>

            {/* SVG Overlay for Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1000 300" preserveAspectRatio="none">
                {/* Vertical Lines connecting components to bus */}
                {/* CPU: x=150, y=40..135 */}
                <line x1="150" y1="90" x2="150" y2="140" stroke={cpuActive ? "#06b6d4" : "#374151"} strokeWidth="4" />
                {/* DMA: x=150, y=160..210 (inv) */}
                <line x1="150" y1="210" x2="150" y2="160" stroke={dmaActive ? "#22c55e" : "#374151"} strokeWidth="4" />

                {/* Memory: x=850 */}
                <line x1="850" y1="90" x2="850" y2="140" stroke={memActive ? "#a855f7" : "#374151"} strokeWidth="4" />
                {/* I/O: x=850 */}
                <line x1="850" y1="210" x2="850" y2="160" stroke={ioActive ? "#f97316" : "#374151"} strokeWidth="4" />

                {/* DMA Active Data Flow Animation */}
                {/* I/O -> Bus -> Memory */}
                {dmaActive && (
                    <>
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f97316" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                        {/* Path: Up from I/O(850,210) to Bus(850,150) then... wait, Memory is at 850, so just vertical? 
                    That's boring. Let's make Memory offset or I/O offset.
                    Actually, if I/O writes to Mem directly? No, via bus.
                    Let's assume Mem is at 700 and I/O at 850 to show movement on bus.
                */}
                    </>
                )}
            </svg>

            {/* Component Nodes - Absolute positioning percentages or CSS Grid? using absolute for precise alignment with SVG */}

            {/* CPU: Top Left */}
            <div className="absolute top-[40px] left-[10%] -ml-[50px] w-[100px] flex flex-col items-center z-10">
                <div className={clsx(
                    "p-3 rounded-lg border-2 transition-all duration-300 bg-gray-900 w-16 h-16 flex items-center justify-center",
                    cpuActive ? "border-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "border-gray-600"
                )}>
                    <Cpu size={32} className={cpuActive ? "text-neon-cyan" : "text-gray-500"} />
                </div>
                <span className="text-xs mt-1 font-bold text-gray-400">CPU</span>
            </div>

            {/* DMA: Bottom Left */}
            <div className="absolute bottom-[40px] left-[10%] -ml-[50px] w-[100px] flex flex-col-reverse items-center z-10">
                <div className={clsx(
                    "p-3 rounded-lg border-2 transition-all duration-300 bg-gray-900 w-16 h-16 flex items-center justify-center",
                    dmaActive ? "border-neon-green shadow-[0_0_15px_rgba(34,197,94,0.5)]" : (signals.dmaRequest ? "border-yellow-500" : "border-gray-600")
                )}>
                    <Network size={32} className={dmaActive ? "text-neon-green" : (signals.dmaRequest ? "text-yellow-500" : "text-gray-500")} />
                </div>
                <span className="text-xs mb-1 font-bold text-gray-400">DMA</span>
            </div>

            {/* Memory: Top Right */}
            <div className="absolute top-[40px] right-[10%] -mr-[50px] w-[100px] flex flex-col items-center z-10">
                <div className={clsx(
                    "p-3 rounded-lg border-2 transition-all duration-300 bg-gray-900 w-16 h-16 flex items-center justify-center",
                    memActive ? "border-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "border-gray-600"
                )}>
                    <Database size={32} className={memActive ? "text-neon-purple" : "text-gray-500"} />
                </div>
                <span className="text-xs mt-1 font-bold text-gray-400">Memory</span>
            </div>

            {/* I/O: Bottom Right */}
            <div className="absolute bottom-[40px] right-[10%] -mr-[50px] w-[100px] flex flex-col-reverse items-center z-10">
                <div className={clsx(
                    "p-3 rounded-lg border-2 transition-all duration-300 bg-gray-900 w-16 h-16 flex items-center justify-center",
                    ioActive ? "border-neon-orange shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "border-gray-600"
                )}>
                    <HardDrive size={32} className={ioActive ? "text-neon-orange" : "text-gray-500"} />
                </div>
                <span className="text-xs mb-1 font-bold text-gray-400">I/O</span>
            </div>

            <div className="absolute top-2 right-4 text-xs font-mono text-neon-cyan bg-gray-900/80 px-2 py-1 rounded">
                ADDR: {signals.addrBus} | DATA: {signals.dataBus}
            </div>

        </div>
    );
};

export default BlockDiagram;
