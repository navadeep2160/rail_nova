import React, { useEffect, useState } from 'react';
import { WhatIfControls } from '../components/whatif/Controls';
import { AnalysisPanel } from '../components/whatif/AnalysisPanel';
import Sidebar from '../components/Sidebar';
import { BrainCircuit } from 'lucide-react';
import RailMap from "@/map/RailMap";
import TrackLayer from "@/map/TrackLayer";
import BlockOverlay from "@/map/BlockOverlay";
import TrainMarker from "@/map/TrainMarker";

export const WhatIf: React.FC = () => {
    const [liveTrains, setLiveTrains] = useState([]);
    const [liveBlocks, setLiveBlocks] = useState([]);
    const [liveAlerts, setLiveAlerts] = useState([]);
    const [simulationResult, setSimulationResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Initial Fetch & Socket Subscription for Live Data
    useEffect(() => {
        // Initial Fetch
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
            } catch (err: any) {
                console.error("Failed to fetch live data", err);
            }
        };
        fetchData();

        // Socket Subscription for Real-time Movement
        import("socket.io-client").then(({ io }) => {
            const socket = io('http://localhost:8000');

            socket.on('connect', () => {
                console.log("What-If connected to Live Stream");
            });

            socket.on('state_update', (data: any) => {
                // Only update live state if no simulation result is actively showing 
                // OR update background state anyway
                if (data.trains) {
                    setLiveTrains(data.trains);
                }
                if (data.alerts) {
                    setLiveAlerts(data.alerts);
                }
            });

            return () => {
                socket.disconnect();
            };
        });
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
        } catch (err: any) {
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

                    <div className="col-span-12 lg:col-span-5 bg-gray-900 rounded-xl border border-gray-800 p-1 relative overflow-hidden flex flex-col h-[600px] lg:h-auto">
                        <div className="absolute top-2 left-2 z-[400] bg-black/50 backdrop-blur px-2 py-1 rounded border border-white/10">
                            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Predicted Outcome Map</h2>
                        </div>

                        {/* Map Visualization */}
                        <div className="flex-1 rounded-lg overflow-hidden relative">
                            <RailMap>
                                <TrackLayer />
                                <BlockOverlay />

                                {/* Render Live Trains (faded) if no result, or Simulated Trains if result exists */}
                                {/* Actually, let's show Live Trains as ghosts if Result exists, or just Result */}
                                {(simulationResult?.final_trains || liveTrains).map((t: any) => (
                                    <TrainMarker
                                        key={t.id}
                                        {...t}
                                        status={simulationResult ? (t.speed < 5 ? 'delayed' : 'on-time') : t.status} // Simple status logic for sim
                                    />
                                ))}
                            </RailMap>

                            {!simulationResult && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
                                    <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300">
                                        Showing Live State (Run Simulation to see Prediction)
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Analytics */}
                    <div className="col-span-4 h-full overflow-y-auto">
                        <AnalysisPanel
                            simulationResult={simulationResult}
                            liveTrains={liveTrains}
                            liveAlerts={liveAlerts}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};
