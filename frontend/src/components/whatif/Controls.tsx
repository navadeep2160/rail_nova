import React, { useState } from 'react';
import { Cloud, CloudRain, CloudFog, CloudLightning, ShieldAlert, TrainFront } from 'lucide-react';

interface ControlsProps {
    blocks: any[];
    trains: any[];
    onRunSimulation: (config: any) => void;
    isSimulating: boolean;
}

const WeatherOptions = [
    { value: 'clear', label: 'Clear', icon: Cloud },
    { value: 'rain', label: 'Rain', icon: CloudRain },
    { value: 'fog', label: 'Fog', icon: CloudFog },
    { value: 'storm', label: 'Storm', icon: CloudLightning },
];

export const WhatIfControls: React.FC<ControlsProps> = ({ blocks, trains, onRunSimulation, isSimulating }) => {
    const [weather, setWeather] = useState('clear');
    const [maintenanceBlocks, setMaintenanceBlocks] = useState<string[]>([]);
    const [rerouteTrains, setRerouteTrains] = useState<string[]>([]);
    const [selectedTrainDelay, setSelectedTrainDelay] = useState<{ id: string, delay: number }>({ id: '', delay: 0 });

    const handleRun = () => {
        const config = {
            modifiers: {
                weather,
                block_maintenance: maintenanceBlocks,
                reroute_trains: rerouteTrains,
                train_delays: selectedTrainDelay.id ? { [selectedTrainDelay.id]: selectedTrainDelay.delay } : {}
            },
            simulation_horizon_minutes: 60
        };
        onRunSimulation(config);
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-6">
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-yellow-400" />
                Scenario Controls
            </h2>

            {/* Weather */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Weather Condition</label>
                <div className="grid grid-cols-4 gap-2">
                    {WeatherOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setWeather(opt.value)}
                            className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${weather === opt.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                }`}
                        >
                            <opt.icon className="w-6 h-6 mb-1" />
                            <span className="text-xs">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Block Maintenance */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Block Closures</label>
                <div className="bg-gray-900 p-2 rounded max-h-32 overflow-y-auto border border-gray-700">
                    {blocks.map(block => (
                        <div key={block.id} className="flex items-center gap-2 mb-1">
                            <input
                                type="checkbox"
                                id={`blk-${block.id}`}
                                checked={maintenanceBlocks.includes(block.id)}
                                onChange={(e) => {
                                    if (e.target.checked) setMaintenanceBlocks([...maintenanceBlocks, block.id]);
                                    else setMaintenanceBlocks(maintenanceBlocks.filter(id => id !== block.id));
                                }}
                                className="rounded border-gray-600 bg-gray-700 text-blue-500"
                            />
                            <label htmlFor={`blk-${block.id}`} className="text-sm text-gray-300 truncate w-full">
                                {block.section} ({block.id})
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rerouting */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Reroute via Loop Line</label>
                <div className="bg-gray-900 p-2 rounded max-h-32 overflow-y-auto border border-gray-700">
                    {trains.map(train => (
                        <div key={train.id} className="flex items-center gap-2 mb-1">
                            <input
                                type="checkbox"
                                id={`reroute-${train.id}`}
                                checked={rerouteTrains.includes(train.id)}
                                onChange={(e) => {
                                    if (e.target.checked) setRerouteTrains([...rerouteTrains, train.id]);
                                    else setRerouteTrains(rerouteTrains.filter(id => id !== train.id));
                                }}
                                className="rounded border-gray-600 bg-gray-700 text-purple-500"
                            />
                            <label htmlFor={`reroute-${train.id}`} className="text-sm text-gray-300 flex items-center gap-2">
                                <TrainFront className="w-3 h-3" /> {train.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Train Delay Injection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Add Delay to Train (mins)</label>
                <div className="flex gap-2">
                    <select
                        className="bg-gray-700 border border-gray-600 text-sm rounded p-2 flex-1 text-white"
                        onChange={(e) => setSelectedTrainDelay(prev => ({ ...prev, id: e.target.value }))}
                        value={selectedTrainDelay.id}
                    >
                        <option value="">Select Train...</option>
                        {trains.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input
                        type="number"
                        className="w-20 bg-gray-700 border border-gray-600 text-sm rounded p-2 text-white"
                        placeholder="Min"
                        value={selectedTrainDelay.delay || ''}
                        onChange={(e) => setSelectedTrainDelay(prev => ({ ...prev, delay: parseInt(e.target.value) || 0 }))}
                    />
                </div>
            </div>

            <button
                onClick={handleRun}
                disabled={isSimulating}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md transition-all shadow-lg shadow-green-900/20"
            >
                {isSimulating ? 'Simulating...' : 'Run Simulation'}
            </button>
        </div>
    );
};
