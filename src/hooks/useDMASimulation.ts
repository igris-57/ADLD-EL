import { useReducer, useEffect, useRef, useCallback, useState } from 'react';

// Unified state machine
export type UnifiedState =
    | 'IDLE'           // System ready to start
    | 'CPU_EXEC'       // CPU executing (cycles 1-16)
    | 'DMA_REQUEST'    // DMA requesting bus (cycle 17)
    | 'DMA_ACTIVE'     // DMA transferring (8 cycles, 18-25)
    | 'DMA_DONE'       // DMA completed, signaling CPU (cycle 26)
    | 'CPU_RESUME'     // CPU resumed after DMA (8 cycles, 27-34)
    | 'COMPLETE';      // All operations complete (cycle 35)

// For backward compatibility with UI components
export type DMAState = UnifiedState;
export type SimulationMode = 'DMA' | 'CPU'; // Kept for display purposes only

export interface Signals {
    dmaRequest: boolean;
    busGrant: boolean;
    transferActive: boolean;
    interrupt: boolean;
    cpuBusy: boolean;
    memRead: boolean;
    memWrite: boolean;
    addrBus: string;
    dataBus: string;
    cpuActive: boolean;
    dmaActive: boolean;
    busOwner: 'CPU' | 'DMA' | 'NONE';
}

export interface SimulationStats {
    totalCycles: number;
    cpuBusyCycles: number;
    dmaCycles: number;
    cpuIdleCycles: number;
    efficiency: number;
}

export interface ComparisonResults {
    cpu: SimulationStats | null;
    dma: SimulationStats | null;
}

const TRANSFER_SIZE = 8;
const CPU_TO_DMA_CYCLE = 17;
const RESUME_CYCLES = 8;

interface SimState {
    state: UnifiedState;
    cycle: number;
    blocksTransferred: number;
    resumeCount: number;
    isRunning: boolean;
    history: { cycle: number; signals: Signals }[];
    stats: SimulationStats;
}

type SimAction =
    | { type: 'START' }
    | { type: 'STEP' }
    | { type: 'RESET' }
    | { type: 'STOP' };

const initialStats: SimulationStats = {
    totalCycles: 0,
    cpuBusyCycles: 0,
    dmaCycles: 0,
    cpuIdleCycles: 0,
    efficiency: 0
};

const initialState: SimState = {
    state: 'IDLE',
    cycle: 0,
    blocksTransferred: 0,
    resumeCount: 0,
    isRunning: false,
    history: [],
    stats: initialStats
};

function getSignals(state: UnifiedState, _cycle: number, blocks: number): Signals {
    return {
        dmaRequest: state === 'DMA_REQUEST' || state === 'DMA_ACTIVE',
        busGrant: state === 'DMA_ACTIVE' || state === 'DMA_DONE',
        transferActive: state === 'DMA_ACTIVE',
        interrupt: state === 'DMA_DONE' || state === 'COMPLETE',
        cpuBusy: state === 'CPU_EXEC' || state === 'CPU_RESUME',
        cpuActive: state === 'CPU_EXEC' || state === 'CPU_RESUME',
        dmaActive: state === 'DMA_ACTIVE',
        busOwner: (state === 'CPU_EXEC' || state === 'CPU_RESUME') ? 'CPU' : (state === 'DMA_ACTIVE' ? 'DMA' : 'NONE'),
        memRead: state === 'DMA_ACTIVE' || state === 'CPU_EXEC',
        memWrite: state === 'DMA_ACTIVE' || state === 'CPU_EXEC',
        addrBus: state === 'DMA_ACTIVE'
            ? (0x1000 + (Math.max(0, blocks - 1)) * 4).toString(16).toUpperCase().padStart(4, '0')
            : '1000',
        dataBus: state === 'DMA_ACTIVE'
            ? (0xA0 + (Math.max(0, blocks - 1))).toString(16).toUpperCase().padStart(2, '0')
            : 'A0',
    };
}

function simReducer(state: SimState, action: SimAction): SimState {
    switch (action.type) {
        case 'START':
            if (state.state !== 'IDLE') return state;
            return { ...state, state: 'CPU_EXEC', isRunning: true };

        case 'RESET':
            return initialState;

        case 'STOP':
            return { ...state, isRunning: false };

        case 'STEP': {
            if (!state.isRunning || state.state === 'COMPLETE') return state;

            const nextCycle = state.cycle + 1;
            let nextState: UnifiedState = state.state;
            let nextBlocks = state.blocksTransferred;
            let nextResume = state.resumeCount;

            switch (state.state) {
                case 'CPU_EXEC':
                    if (nextCycle >= CPU_TO_DMA_CYCLE) nextState = 'DMA_REQUEST';
                    break;
                case 'DMA_REQUEST':
                    nextState = 'DMA_ACTIVE';
                    break;
                case 'DMA_ACTIVE':
                    nextBlocks += 1;
                    if (nextBlocks >= TRANSFER_SIZE) nextState = 'DMA_DONE';
                    break;
                case 'DMA_DONE':
                    nextState = 'CPU_RESUME';
                    break;
                case 'CPU_RESUME':
                    nextResume += 1;
                    if (nextResume >= RESUME_CYCLES) nextState = 'COMPLETE';
                    break;
            }

            const currentSignals = getSignals(nextState, nextCycle, nextBlocks);
            const newHistoryItem = { cycle: nextCycle, signals: currentSignals };
            const nextHistory = [...state.history, newHistoryItem].slice(-100);

            let nextStats = state.stats;
            if (nextState === 'COMPLETE') {
                const cpuCycles = (CPU_TO_DMA_CYCLE - 1) + nextResume;
                const dmaCycles = TRANSFER_SIZE + 2;
                nextStats = {
                    totalCycles: nextCycle,
                    cpuBusyCycles: cpuCycles,
                    dmaCycles,
                    cpuIdleCycles: dmaCycles,
                    efficiency: nextCycle > 0 ? ((dmaCycles / nextCycle) * 100) : 0
                };
            }

            return {
                ...state,
                state: nextState,
                cycle: nextCycle,
                blocksTransferred: nextBlocks,
                resumeCount: nextResume,
                isRunning: nextState !== 'COMPLETE',
                history: nextHistory,
                stats: nextStats
            };
        }
        default:
            return state;
    }
}

export const useDMASimulation = () => {
    const [sim, dispatch] = useReducer(simReducer, initialState);
    const [speed, setSpeed] = useState(1);
    const timerRef = useRef<number | null>(null);

    // Auto-stepping
    useEffect(() => {
        if (!sim.isRunning) return;
        const id = window.setInterval(() => dispatch({ type: 'STEP' }), 1000 / speed);
        timerRef.current = id;
        return () => clearInterval(id);
    }, [sim.isRunning, speed]);

    const startDMA = useCallback(() => dispatch({ type: 'START' }), []);
    const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

    const signals = getSignals(sim.state, sim.cycle, sim.blocksTransferred);

    const results: ComparisonResults = {
        cpu: null,
        dma: sim.state === 'COMPLETE' ? sim.stats : null
    };

    return {
        state: sim.state,
        mode: 'DMA' as SimulationMode,
        setMode: () => { },
        cycle: sim.cycle,
        remainingBlocks: TRANSFER_SIZE - sim.blocksTransferred,
        signals,
        history: sim.history,
        isRunning: sim.isRunning,
        startDMA,
        reset,
        setSpeed,
        speed,
        totalBlocks: TRANSFER_SIZE,
        results,
        stats: sim.stats,
        grantBus: () => { }
    };
};
