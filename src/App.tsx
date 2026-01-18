// import React from 'react';
import { useDMASimulation } from './hooks/useDMASimulation';
import BlockDiagram from './components/BlockDiagram';
import StateDiagram from './components/StateDiagram';
import TimingDiagram from './components/TimingDiagram';
import ControlPanel from './components/ControlPanel';
import ComparisonPanel from './components/ComparisonPanel';
import InfoPanel from './components/InfoPanel';
import { Activity } from 'lucide-react';

function App() {
  const sim = useDMASimulation();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans select-none">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-3">
          <div className="bg-neon-cyan/20 p-2 rounded-lg">
            <Activity className="text-neon-cyan" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">DMA Controller Simulator</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Interactive Educational Tool</p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs text-gray-400">Course Code: ADLD-LAB</div>
          <div className="text-xs text-xl font-mono text-neon-green">
            CLK: {sim.cycle} | BLOCKS: {sim.remainingBlocks}
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Left Column (Visualization) - Spans 3 columns */}
        <div className="lg:col-span-3 space-y-4">

          {/* Top: Block Diagram */}
          <section>
            <BlockDiagram state={sim.state} signals={sim.signals} />
          </section>

          {/* Middle: FSM & Timing */}
          <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <StateDiagram currentState={sim.state} />
            </div>
            <div className="md:col-span-3">
              <TimingDiagram history={sim.history} />
            </div>
          </section>

          {/* Bottom: Comparison */}
          <section>
            <ComparisonPanel
              results={sim.results}
              totalBlocks={sim.totalBlocks}
            />
          </section>

        </div>

        {/* Right Column (Controls & Info) */}
        <div className="space-y-4 sticky top-4 h-fit">
          <ControlPanel
            state={sim.state}
            mode={sim.mode}
            setMode={sim.setMode}
            startDMA={sim.startDMA}
            grantBus={sim.grantBus}
            reset={sim.reset}
            speed={sim.speed}
            setSpeed={sim.setSpeed}
          />

          <InfoPanel />

          {/* Context Help / Log */}
          <div className="bg-black/30 p-4 rounded border border-gray-800 font-mono text-xs h-40 overflow-y-auto">
            <div className="text-gray-500 mb-2 font-bold uppercase">Log Output</div>
            <div className="flex flex-col gap-1 text-gray-300">
              {sim.state === 'IDLE' && (
                <>
                  <div>&gt; Unified Simulation Ready</div>
                  <div>&gt; Click Start to begin CPU→DMA→CPU flow</div>
                </>
              )}
              {sim.state === 'CPU_EXEC' && (
                <>
                  <div className="text-blue-400">&gt; CPU Executing (Cycle {sim.cycle})</div>
                  <div>&gt; Will transfer to DMA at cycle 17</div>
                </>
              )}
              {sim.state === 'DMA_REQUEST' && (
                <>
                  <div className="text-yellow-400">&gt; Cycle 17: CPU Halted</div>
                  <div className="text-yellow-400">&gt; DMA Requesting Bus...</div>
                </>
              )}
              {sim.state === 'DMA_ACTIVE' && (
                <>
                  <div className="text-neon-green">&gt; Bus Granted to DMA</div>
                  <div className="text-neon-green">&gt; Transferring Block {sim.totalBlocks - sim.remainingBlocks + 1}/{sim.totalBlocks}</div>
                  <div>&gt; CPU Idle during DMA transfer</div>
                </>
              )}
              {sim.state === 'DMA_DONE' && (
                <>
                  <div className="text-green-300">&gt; DMA Transfer Complete</div>
                  <div className="text-green-300">&gt; Interrupt Raised</div>
                  <div>&gt; Returning control to CPU...</div>
                </>
              )}
              {sim.state === 'CPU_RESUME' && (
                <>
                  <div className="text-blue-400">&gt; Control Returned to CPU</div>
                  <div className="text-blue-400">&gt; CPU Resuming Execution</div>
                </>
              )}
              {sim.state === 'COMPLETE' && (
                <>
                  <div className="text-neon-cyan">&gt; Simulation Complete!</div>
                  <div>&gt; Total Cycles: {sim.cycle}</div>
                  <div>&gt; Check timing diagram for details</div>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;
