import React from 'react';
import { Play, RotateCcw, Cpu, Zap } from 'lucide-react';
import type { DMAState, SimulationMode } from '../hooks/useDMASimulation';
import clsx from 'clsx';

interface ControlPanelProps {
    state: DMAState;
    mode: SimulationMode;
    setMode: (m: SimulationMode) => void;
    startDMA: () => void;
    grantBus: () => void;
    reset: () => void;
    speed: number;
    setSpeed: (s: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ state, startDMA, reset, speed, setSpeed }) => {
    // Determine current execution phase
    const getExecutionPhase = () => {
        switch (state) {
            case 'IDLE':
                return { label: 'Ready to Start', color: 'text-gray-400', icon: '⏸️' };
            case 'CPU_EXEC':
                return { label: 'CPU Executing', color: 'text-blue-400', icon: '🔵' };
            case 'DMA_REQUEST':
                return { label: 'DMA Requesting Bus', color: 'text-yellow-400', icon: '🟡' };
            case 'DMA_ACTIVE':
                return { label: 'DMA Transferring', color: 'text-green-400', icon: '🟢' };
            case 'DMA_DONE':
                return { label: 'DMA Complete', color: 'text-green-300', icon: '✅' };
            case 'CPU_RESUME':
                return { label: 'CPU Resumed', color: 'text-blue-300', icon: '🔵' };
            case 'COMPLETE':
                return { label: 'Simulation Complete', color: 'text-neon-green', icon: '✨' };
            default:
                return { label: 'Unknown', color: 'text-gray-400', icon: '❓' };
        }
    };

    const phase = getExecutionPhase();

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col gap-4 shadow-lg">
            <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2">
                <Cpu size={16} /> Simulation Controls
            </h3>

            {/* Execution Phase Indicator */}
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-500 mb-1 uppercase">Current Phase</div>
                <div className={clsx("text-sm font-mono font-bold flex items-center gap-2", phase.color)}>
                    <span>{phase.icon}</span>
                    <span>{phase.label}</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                    {state === 'IDLE' && '→ Click "Start" to begin unified simulation'}
                    {state === 'CPU_EXEC' && '→ CPU will execute until cycle 17'}
                    {state === 'DMA_REQUEST' && '→ Automatic bus grant in progress'}
                    {state === 'DMA_ACTIVE' && '→ DMA transferring 8 blocks'}
                    {state === 'DMA_DONE' && '→ Returning control to CPU'}
                    {state === 'CPU_RESUME' && '→ CPU resuming execution'}
                    {state === 'COMPLETE' && '→ Click "Reset" to run again'}
                </div>
            </div>

            {/* Info Box about Unified Simulation */}
            <div className="bg-blue-900/20 border border-blue-700/50 p-2 rounded text-xs text-blue-300">
                <div className="flex items-center gap-1 mb-1">
                    <Zap size={12} />
                    <span className="font-bold">Unified Simulation</span>
                </div>
                <div className="text-blue-200/80">
                    CPU executes cycles 0-16, then automatically hands off to DMA at cycle 17. DMA completes in 8 cycles, then returns control to CPU.
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={startDMA}
                    disabled={state !== 'IDLE'}
                    className="col-span-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 px-4 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <Play size={16} /> Start Unified Simulation
                </button>

                <button
                    onClick={reset}
                    className="col-span-2 bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <RotateCcw size={16} /> Reset
                </button>
            </div>

            {/* Speed Control */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Simulation Speed: {speed}x</label>
                <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-neon-cyan h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>

        </div>
    );
};

export default ControlPanel;
