import React from 'react';
import type { DMAState } from '../hooks/useDMASimulation';
import clsx from 'clsx';

interface StateDiagramProps {
    currentState: DMAState;
}

const StateNode = ({ active, label }: { state: DMAState, active: boolean, label: string }) => (
    <div className={clsx(
        "relative flex items-center justify-center w-20 h-20 rounded-full border-4 transition-all duration-500 z-10",
        active ? "border-neon-cyan bg-gray-800 shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-110" : "border-gray-700 bg-gray-900 grayscale opacity-70"
    )}>
        <span className={clsx(
            "font-bold text-xs tracking-widest text-center",
            active ? "text-white" : "text-gray-500"
        )}>{label}</span>

        {/* Glow effect helper */}
        {active && <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-neon-cyan duration-1000" />}
    </div>
);

const StateDiagram: React.FC<StateDiagramProps> = ({ currentState }) => {
    const states: { state: DMAState; label: string }[] = [
        { state: 'IDLE', label: 'IDLE' },
        { state: 'CPU_EXEC', label: 'CPU' },
        { state: 'DMA_REQUEST', label: 'REQ' },
        { state: 'DMA_ACTIVE', label: 'DMA' },
        { state: 'DMA_DONE', label: 'DONE' },
        { state: 'CPU_RESUME', label: 'RESUME' },
        { state: 'COMPLETE', label: 'END' },
    ];

    const currentIndex = states.findIndex(s => s.state === currentState);

    return (
        <div className="w-full bg-gray-900 p-6 rounded-lg border border-gray-800 flex flex-col items-center">
            <h3 className="text-gray-500 text-xs font-bold uppercase mb-6 tracking-wider w-full text-left">Unified State Machine</h3>

            <div className="flex items-center justify-between w-full max-w-full relative overflow-x-auto">
                {states.map((s, index) => (
                    <React.Fragment key={s.state}>
                        {/* State Node */}
                        <StateNode
                            state={s.state}
                            active={currentState === s.state}
                            label={s.label}
                        />

                        {/* Arrow between nodes */}
                        {index < states.length - 1 && (
                            <div className="flex-1 h-1 bg-gray-800 mx-1 relative overflow-hidden min-w-[20px]">
                                <div className={clsx(
                                    "absolute inset-0 bg-neon-cyan transition-transform duration-300",
                                    currentIndex > index ? "translate-x-0" : "-translate-x-full"
                                )} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-4 text-xs text-gray-400 text-center">
                <div>IDLE → CPU (0-16) → DMA REQ (17) → DMA (18-24) → DONE → RESUME → END</div>
            </div>

        </div>
    );
};

export default StateDiagram;
