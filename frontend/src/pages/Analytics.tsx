import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Activity, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area } from 'recharts';

// Mock Data
const DELAY_DATA = [
    { time: '06:00', actual: 2, predicted: 1 },
    { time: '08:00', actual: 5, predicted: 4 },
    { time: '10:00', actual: 12, predicted: 15 },
    { time: '12:00', actual: 8, predicted: 10 },
    { time: '14:00', actual: 15, predicted: 12 },
    { time: '16:00', actual: 20, predicted: 18 },
    { time: '18:00', actual: 10, predicted: 8 },
];

const BLOCK_UTILIZATION = [
    { block: 'B-101', usage: 85 },
    { block: 'B-102', usage: 60 },
    { block: 'B-103', usage: 92 },
    { block: 'B-104', usage: 45 },
    { block: 'B-105', usage: 78 },
];

export default function Analytics() {
    const [lastSync, setLastSync] = useState<string>("Syncing...");

    useEffect(() => {
        setLastSync(new Date().toLocaleTimeString());
    }, []);

    const handleExport = async () => {
        try {
            const data = { delays: DELAY_DATA, utilization: BLOCK_UTILIZATION };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rail_nova_analytics_${new Date().toISOString()}.json`;
            a.click();
            setLastSync(new Date().toLocaleTimeString());
        } catch (e: any) {
            console.error("Export failed", e);
        }
    };

    return (
        <div className="flex h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="border-b border-border bg-card p-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Activity className="text-purple-500" /> System Analytics
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Last Sync: {lastSync}</span>
                        <button
                            onClick={handleExport}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                        >
                            <RefreshCw size={14} /> Export JSON
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 overflow-y-auto">

                    {/* Delay Chart */}
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col h-80">
                        <h3 className="font-semibold mb-4 text-sm">Delay Trend (Actual vs Predicted)</h3>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={DELAY_DATA}>
                                    <defs>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="time" stroke="#888" />
                                    <YAxis stroke="#888" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                                    <Legend />
                                    <Area type="monotone" dataKey="actual" stroke="#ef4444" fillOpacity={1} fill="url(#colorActual)" />
                                    <Area type="monotone" dataKey="predicted" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPredicted)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Block Utilization */}
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col h-80">
                        <h3 className="font-semibold mb-4 text-sm">Block Utilization %</h3>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={BLOCK_UTILIZATION}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="block" stroke="#888" />
                                    <YAxis stroke="#888" />
                                    <Tooltip cursor={{ fill: '#333' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                                    <Bar dataKey="usage" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* New Third Verification Panel */}
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col h-80 col-span-1 md:col-span-2">
                        <h3 className="font-semibold mb-4 text-sm">System Health & Conflicts</h3>
                        <div className="flex items-center justify-center h-full gap-8">
                            <div className="text-center p-4 bg-muted/20 rounded-lg w-1/3">
                                <div className="text-4xl font-bold text-green-500 mb-2">98%</div>
                                <div className="text-sm text-muted-foreground">Uptime</div>
                            </div>
                            <div className="text-center p-4 bg-muted/20 rounded-lg w-1/3">
                                <div className="text-4xl font-bold text-amber-500 mb-2">3</div>
                                <div className="text-sm text-muted-foreground">Active Alerts</div>
                            </div>
                            <div className="text-center p-4 bg-muted/20 rounded-lg w-1/3">
                                <div className="text-4xl font-bold text-blue-500 mb-2">12</div>
                                <div className="text-sm text-muted-foreground">Active Trains</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
