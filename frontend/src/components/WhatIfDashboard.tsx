import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, AlertTriangle, TrendingUp, Clock, CloudRain, Sun, Wind, CloudFog } from 'lucide-react';

const WhatIfDashboard = () => {
    // State
    const [liveTrains, setLiveTrains] = useState([]);
    const [liveBlocks, setLiveBlocks] = useState([]);
    const [scenario, setScenario] = useState({
        weather: 'clear',
        train_delays: {}, // trainId -> minutes
        block_maintenance: [], // list of blockIds
        speed_limits: {},
        simulation_horizon_minutes: 60
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tRes, bRes] = await Promise.all([
                    fetch('http://localhost:8000/trains/live'),
                    fetch('http://localhost:8000/blocks/live')
                ]);
                const trains = await tRes.json();
                const blocks = await bRes.json();
                setLiveTrains(trains);
                setLiveBlocks(blocks);
            } catch (err) {
                console.error("Failed to fetch live data", err);
            }
        };
        fetchData();
    }, []);

    // Handlers
    const handleDelayChange = (trainId, mins) => {
        setScenario(prev => ({
            ...prev,
            modifiers: {
                ...prev.modifiers,
                train_delays: {
                    ...prev.modifiers?.train_delays,
                    [trainId]: parseFloat(mins)
                }
            }
        }));
    };

    // Simplification: Flattened state handling for the UI config
    const updateScenario = (field, value) => {
        setScenario(prev => ({ ...prev, [field]: value }));
    };

    const toggleMaintenance = (blockId) => {
        setScenario(prev => {
            const current = prev.block_maintenance || [];
            const exists = current.includes(blockId);
            return {
                ...prev,
                block_maintenance: exists
                    ? current.filter(id => id !== blockId)
                    : [...current, blockId]
            };
        });
    };

    const runSimulation = async () => {
        setLoading(true);
        try {
            // Construct payload matching backend ScenarioConfig
            const payload = {
                name: "User Scenario",
                layout_name: "default",
                simulation_horizon_minutes: scenario.simulation_horizon_minutes,
                modifiers: {
                    weather: scenario.weather,
                    train_delays: scenario.train_delays || {},
                    block_maintenance: scenario.block_maintenance || [],
                    speed_limits: scenario.speed_limits || {},
                    priorities: {}
                }
            };

            const res = await fetch('http://localhost:8000/api/what-if/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error("Simulation failed", err);
        } finally {
            setLoading(false);
        }
    };

    const resetScenario = () => {
        setScenario({
            weather: 'clear',
            train_delays: {},
            block_maintenance: [],
            speed_limits: {},
            simulation_horizon_minutes: 60
        });
        setResult(null);
    };

    return (
        <div className="h-full flex flex-col bg-slate-900 text-white p-4 overflow-hidden">
            <header className="mb-4 flex justify-between items-center border-b border-slate-700 pb-2">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">What-If Scenario Engine</h1>
                    <p className="text-slate-400 text-sm">Predict operational impacts of delays and maintenance</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={resetScenario} className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2">
                        <RotateCcw size={16} /> Reset
                    </button>
                    <button onClick={runSimulation} className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-blue-900/50">
                        {loading ? 'Simulating...' : <><Play size={16} /> Run Simulation</>}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* CONFIG PANEL */}
                <div className="w-1/3 bg-slate-800/50 rounded-xl p-4 overflow-y-auto border border-slate-700 backdrop-blur-sm">
                    <h2 className="text-lg font-semibold mb-4 text-cyan-400 flex items-center gap-2">
                        <TrendingUp size={18} /> Scenario Controls
                    </h2>

                    {/* Weather Section */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Weather Condition</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['clear', 'rain', 'fog', 'storm'].map(w => (
                                <button
                                    key={w}
                                    onClick={() => updateScenario('weather', w)}
                                    className={`p-2 rounded flex flex-col items-center justify-center gap-1 text-xs transition-all ${scenario.weather === w ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                >
                                    {w === 'clear' && <Sun size={16} />}
                                    {w === 'rain' && <CloudRain size={16} />}
                                    {w === 'fog' && <CloudFog size={16} />}
                                    {w === 'storm' && <Wind size={16} />}
                                    <span className="capitalize">{w}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Delays Section */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Inject Train Delays (min)</label>
                        <div className="space-y-3">
                            {liveTrains.map(train => (
                                <div key={train.id} className="bg-slate-700/50 p-3 rounded border border-slate-600">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-mono text-yellow-500">{train.id}</span>
                                        <span className="text-slate-300">{train.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="0" max="120"
                                            value={scenario.train_delays?.[train.id] || 0}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setScenario(prev => ({
                                                    ...prev,
                                                    train_delays: { ...prev.train_delays, [train.id]: val }
                                                }));
                                            }}
                                            className="w-full accent-blue-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-sm font-mono w-12 text-right">
                                            {scenario.train_delays?.[train.id] || 0}m
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Maintenance Section */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Block Maintenance</label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {liveBlocks.map(block => (
                                <div key={block.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded border border-slate-700">
                                    <div className="text-sm">
                                        <div className="text-slate-300">{block.section}</div>
                                        <div className="text-xs text-slate-500">{block.id}</div>
                                    </div>
                                    <button
                                        onClick={() => toggleMaintenance(block.id)}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${(scenario.block_maintenance || []).includes(block.id)
                                                ? 'bg-red-500/20 text-red-500 border border-red-500/50'
                                                : 'bg-green-500/20 text-green-500 border border-green-500/50'
                                            }`}
                                    >
                                        {(scenario.block_maintenance || []).includes(block.id) ? 'CLOSED' : 'OPEN'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RESULTS PANEL */}
                <div className="flex-1 bg-slate-800/50 rounded-xl p-4 border border-slate-700 backdrop-blur-sm flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 text-purple-400 flex items-center gap-2">
                        <Clock size={18} /> Predicted Outcomes ({scenario.simulation_horizon_minutes}m Horizon)
                    </h2>

                    {!result ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <TrendingUp size={48} className="mb-4 opacity-50" />
                            <p>Configure scenario and click Run Simulation</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 h-full">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                    <div className="text-slate-400 text-xs uppercase">Predicted Conflicts</div>
                                    <div className={`text-2xl font-bold ${result.predicted_conflicts.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {result.predicted_conflicts.length}
                                    </div>
                                </div>
                                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                    <div className="text-slate-400 text-xs uppercase">Avg Network Load</div>
                                    <div className="text-2xl font-bold text-blue-400">
                                        {Object.values(result.block_utilization).reduce((a, b) => a + b, 0) / (Object.values(result.block_utilization).length || 1).toFixed(1)}%
                                    </div>
                                </div>
                                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                    <div className="text-slate-400 text-xs uppercase">Critical Delays</div>
                                    <div className="text-2xl font-bold text-orange-400">
                                        {Object.values(result.max_delays).filter(d => d > 30).length}
                                    </div>
                                </div>
                            </div>

                            {/* Conflicts List */}
                            <div className="flex-1 overflow-y-auto">
                                <h3 className="text-sm font-medium text-slate-300 mb-2">Conflict Log</h3>
                                {result.predicted_conflicts.length === 0 ? (
                                    <div className="text-green-500/80 text-sm italic">No conflicts predicted.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {result.predicted_conflicts.map((alert, idx) => (
                                            <div key={idx} className="flex gap-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-1" />
                                                <div>
                                                    <div className="text-red-300 font-semibold text-sm">Conflict Detected</div>
                                                    <div className="text-slate-300 text-xs">{alert.message}</div>
                                                    <div className="text-slate-500 text-xs mt-1">@ {alert.time} (Simulated)</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Train Projections */}
                            <div className="flex-1 overflow-y-auto mt-4">
                                <h3 className="text-sm font-medium text-slate-300 mb-2">Projected Train Status</h3>
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-700 text-slate-300">
                                        <tr>
                                            <th className="p-2 rounded-tl">Train</th>
                                            <th className="p-2">Current Pos</th>
                                            <th className="p-2">Final Pos</th>
                                            <th className="p-2 rounded-tr">Addtl Delay</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {result.final_trains.map(t => (
                                            <tr key={t.id} className="hover:bg-slate-700/30">
                                                <td className="p-2 font-mono text-cyan-400">{t.id}</td>
                                                <td className="p-2 text-slate-400">{(liveTrains.find(lt => lt.id === t.id)?.distance || 0).toFixed(1)} km</td>
                                                <td className="p-2 text-white">{t.distance.toFixed(1)} km</td>
                                                <td className="p-2 text-orange-400">
                                                    +{((result.max_delays[t.id] || 0)).toFixed(1)} min
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Visual Map Placeholder (Optional improvement) */}
            {/* <div className="mt-4 h-48 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-slate-500 text-sm">
                Future Projection Map (Coming Soon)
            </div> */}
        </div>
    );
};

export default WhatIfDashboard;
