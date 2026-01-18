// import React from 'react';

const InfoPanel = () => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-sm text-gray-300 shadow-xl">
            <h3 className="text-white font-bold mb-2 flex justify-between items-center">
                <span>What is DMA?</span>
                <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">INFO</span>
            </h3>
            <p className="mb-2">
                <strong>Direct Memory Access (DMA)</strong> allows hardware subsystems to access main system memory independently of the CPU.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-xs text-gray-400">
                <li><strong className="text-neon-cyan">CPU Mode:</strong> The CPU is fully occupied reading from I/O and writing to Memory (2 cycles per word).</li>
                <li><strong className="text-neon-green">DMA Mode:</strong> The CPU configures the DMA Controller (2 cycles), then is free to do other work while DMA handles the transfer.</li>
            </ul>
        </div>
    );
};

export default InfoPanel;
