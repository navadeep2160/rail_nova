import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, AlertTriangle } from 'lucide-react';

interface AnalysisPanelProps {
    simulationResult: any;
    liveTrains: any[];
    liveAlerts?: any[];
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ simulationResult, liveAlerts = [] }) => {
    if (!simulationResult) {
        return (
            <div className="h-full flex flex-col gap-4">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live System Monitor
                    </h3>
                    <p className="text-xs text-gray-400">Monitoring real-time traffic. Run a simulation to see predictions.</p>
                </div>

                {/* Live Alerts List */}
                <div className="flex-1 bg-gray-800/50 rounded-lg border border-gray-700 p-4 overflow-y-auto">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Active System Alerts</h3>
                    {liveAlerts.length === 0 ? (
                        <div className="text-gray-500 text-sm italic">No active alerts. System optimal.</div>
                    ) : (
                        <div className="space-y-3">
                            {liveAlerts.map((alert, idx) => (
                                <div key={idx} className={`p-3 rounded border ${alert.type === 'critical' ? 'bg-red-900/20 border-red-800' : 'bg-orange-900/20 border-orange-800'
                                    }`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold uppercase ${alert.type === 'critical' ? 'text-red-400' : 'text-orange-400'
                                            }`}>{alert.type} Alert</span>
                                        <span className="text-xs text-gray-500">{alert.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-300">{alert.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Calculate Delay Difference (Simulated vs Live/Baseline)
    // Since we don't have "live delay" easily available as a number on client without calculation,
    // we'll just show the "Max Delay" metric from simulation.

    const delayData = Object.entries(simulationResult.max_delays || {}).map(([tid, delay]) => {
        const trainName = simulationResult.final_trains.find((t: any) => t.id === tid)?.name || tid;
        return {
            name: trainName,
            delay: Math.round((delay as number) * 10) / 10 // Rounded to 1 decimal
        };
    });

    const utilizationData = Object.entries(simulationResult.block_utilization || {}).map(([bid, util]) => ({
        name: bid.replace('BLK-', ''),
        utilization: Math.round((util as number))
    }));

    const conflictCount = simulationResult.predicted_conflicts?.length || 0;

    return (
        <div className="space-y-4">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider">Avg Delay (Sim)</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {(delayData.reduce((acc, curr) => acc + curr.delay, 0) / (delayData.length || 1)).toFixed(1)} min
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-xs uppercase tracking-wider">Predicted Conflicts</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-400">
                        {conflictCount}
                    </div>
                </div>
            </div>

            {/* Delay Chart */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-64">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Predicted Delays (Minutes)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={delayData} layout="vertical">
                        <XAxis type="number" stroke="#6b7280" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} width={80} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                        />
                        <Bar dataKey="delay" fill="#f87171" radius={[0, 4, 4, 0]} name="Delay (min)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Utilization Chart */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-64">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Block Utilization (%)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={utilizationData}>
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                        />
                        <Bar dataKey="utilization" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Occupancy %" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};
