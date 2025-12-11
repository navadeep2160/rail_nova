import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import KPIBar from '@/components/KPIBar';
import { BarChart, Activity, Map, Zap, RefreshCw } from 'lucide-react';

// Mock Grafana Panel Component
const GrafanaPanel = ({ title, type, url }: { title: string, type: string, url: string }) => (
    <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-semibold text-sm flex items-center gap-2">
                {type === 'chart' ? <BarChart size={16} /> :
                    type === 'map' ? <Map size={16} /> : <Activity size={16} />}
                {title}
            </h3>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                View in Grafana
            </a>
        </div>
        <div className="flex-1 bg-black/5 relative group">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-0">
                {/* Fallback visual if iframe fails or is blocked */}
                <div className="text-center">
                    <p className="font-mono text-xs mb-2">Grafana Panel</p>
                    <p className="text-xs opacity-50">Source: {url}</p>
                </div>
            </div>
            {/* If we had a real public grafana URL, we'd enable this iframe. 
                Using a placeholder image or functionality for now as requested. 
            */}
            <iframe
                src={url}
                className="w-full h-full absolute inset-0 z-10 opacity-90 hover:opacity-100 transition-opacity"
                frameBorder="0"
            />
        </div>
    </div>
);

export default function Analytics() {
    const [lastSync, setLastSync] = useState<string>("Syncing...");

    const handleExport = async () => {
        try {
            const res = await fetch('http://localhost:8000/analytics/export');
            const data = await res.json();
            console.log("Exported Data:", data);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rail_nova_analytics_${new Date().toISOString()}.json`;
            a.click();
            setLastSync(new Date().toLocaleTimeString());
        } catch (e) {
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
                        <span className="text-sm text-muted-foreground">Last Export: {lastSync}</span>
                        <button
                            onClick={handleExport}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                        >
                            <RefreshCw size={14} /> Export JSON
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                    {/* Mock Grafana Panels - Pointing to a demo dashboard or generic chart for visual */}
                    <div className="col-span-1 h-64">
                        <GrafanaPanel
                            title="Block Congestion"
                            type="chart"
                            url="https://snapshot.raintank.io/dashboard/snapshot/y7z80MvFPdla9M0Rj0y59gq9l64A5j4e?orgId=2" // Public demo snapshot
                        />
                    </div>
                    <div className="col-span-1 h-64">
                        <GrafanaPanel
                            title="Delay Trend (24h)"
                            type="chart"
                            url="https://play.grafana.org/d-solo/000000012/grafana-play-home?orgId=1&panelId=2"
                        />
                    </div>
                    <div className="col-span-1 h-64">
                        <GrafanaPanel
                            title="Conflict Heatmap"
                            type="map"
                            url="https://play.grafana.org/d-solo/000000012/grafana-play-home?orgId=1&panelId=4"
                        />
                    </div>

                    {/* Full width row */}
                    <div className="col-span-2 lg:col-span-3 h-80">
                        <GrafanaPanel
                            title="Network Throughput & Speed"
                            type="chart"
                            url="https://play.grafana.org/d-solo/000000012/grafana-play-home?orgId=1&panelId=3"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
