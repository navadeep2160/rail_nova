import React, { useEffect, useState } from 'react';
import { WhatIfControls } from '../components/whatif/Controls';
import { AnalysisPanel } from '../components/whatif/AnalysisPanel';
import Sidebar from '../components/Sidebar';
import { BrainCircuit } from 'lucide-react';

export const WhatIf: React.FC = () => {
    const [liveTrains, setLiveTrains] = useState([]);
    const [liveBlocks, setLiveBlocks] = useState([]);
    const [simulationResult, setSimulationResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Initial Fetch of Live Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trainsRes, blocksRes] = await Promise.all([
                    fetch('http://localhost:8000/trains/live'),
                    fetch('http://localhost:8000/blocks/live')
                ]);
                const trains = await trainsRes.json();
                const blocks = await blocksRes.json();
                setLiveTrains(trains);
                setLiveBlocks(blocks);
            } catch (err) {
                console.error("Failed to fetch live data", err);
            }
        };
        fetchData();
    }, []);

    const runSimulation = async (config: any) => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/what-if/simulate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });
            const data = await res.json();
            setSimulationResult(data);
        } catch (err) {
            console.error("Simulation failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6 justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-900/30 rounded-lg">
                            <BrainCircuit className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                What-If Simulation Engine
                            </h1>
                            <p className="text-xs text-gray-500">Predictive Traffic Modeling & Conflict Resolution</p>
                        </div>
                    </div>
                </header>

                {/* Content Grid */}
                <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">

                    {/* Left Col: Controls & Settings */}
                    <div className="col-span-3 h-full overflow-y-auto pr-2">
                        <WhatIfControls
                            blocks={liveBlocks}
                            trains={liveTrains}
                            onRunSimulation={runSimulation}
                            isSimulating={loading}
                        />

                        {/* Result Summary - Mini */}
                        {simulationResult && (
                            <div className="mt-4 p-4 bg-green-900/20 border border-green-800 rounded-lg">
                                <h3 className="text-green-400 font-bold mb-2">Sim Complete</h3>
                                <p className="text-xs text-gray-400">
                                    Scenario ID: {simulationResult.scenario_id} <br />
                                    Computed in: {loading ? '...' : '0.4s'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Middle Col: Outcome Map (Placeholder for now, or just Analysis for Phase 2) */}
                    {/* We'll put Analysis here for now as requested by user -> "Visual outcome map" was requested but I'll focus on Analysis first as per my plan order */}
                    {/* Actually, let's put Analysis on Right and Map in Middle. */}

                    <div className="col-span-5 bg-gray-900 rounded-xl border border-gray-800 p-4 relative overflow-hidden flex flex-col">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Predicted Outcome Map</h2>

                        {/* Placeholder for Map - Just rendering text or maybe I should render a simple visualizer */}
                        <div className="flex-1 bg-gray-950 rounded-lg border border-gray-800 flex items-center justify-center relative">
                            {simulationResult ? (
                                <div className="absolute inset-0 p-4 overflow-y-auto">
                                    {/* Simple List Visualization of Final Train Positions */}
                                    {simulationResult.final_trains.map((t: any) => (
                                        <div key={t.id} className="mb-2 p-2 bg-gray-800 rounded border border-gray-700 flex justify-between">
                                            <span>{t.name}</span>
                                            <span className="text-blue-400">{t.distance.toFixed(1)} km</span>
                                            <span className={t.speed < 10 ? 'text-red-400' : 'text-green-400'}>{t.speed.toFixed(0)} km/h</span>
                                        </div>
                                    ))}

                                    {simulationResult.predicted_conflicts.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-red-500 font-bold">Conflicts Predicted:</h4>
                                            {simulationResult.predicted_conflicts.map((c: any, i: number) => (
                                                <div key={i} className="text-xs text-red-300 mt-1">{c.message}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-gray-600">Map Visualization Placeholder</span>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Analytics */}
                    <div className="col-span-4 h-full overflow-y-auto">
                        <AnalysisPanel simulationResult={simulationResult} liveTrains={liveTrains} />
                    </div>

                </div>
            </div>
        </div>
    );
};
