import Sidebar from "@/components/Sidebar";
import KPIBar from "@/components/KPIBar";
import RailMap from "@/map/RailMap";
import TrackLayer from "@/map/TrackLayer";
import BlockOverlay from "@/map/BlockOverlay";
import TrainMarker from "@/map/TrainMarker";
import AlertsPanel from "@/components/AlertsPanel";
import TrainTable from "@/components/TrainTable";
import { useState, useEffect } from "react";

// Mock train data state
interface Train {
    id: string;
    lat: number;
    lng: number;
    name: string;
    speed: number;
    status: "on-time" | "delayed";
}

export default function LiveControl() {
    const [trains, setTrains] = useState<Train[]>([
        { id: "12723", lat: 17.5, lng: 78.8, name: "Telangana Exp", speed: 85, status: "on-time" },
    ]);

    // Simple interpolation simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setTrains(prev => prev.map(t => ({
                ...t,
                // Move slightly east
                lng: t.lng + 0.005,
                lat: t.lat + 0.001
            })));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen bg-background text-foreground">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="border-b border-border bg-card">
                    <KPIBar />
                </header>

                <div className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden">
                    {/* Main Map Area */}
                    <div className="col-span-9 flex flex-col gap-4 h-full">
                        <div className="flex-1 relative min-h-0">
                            <RailMap>
                                <TrackLayer />
                                <BlockOverlay />
                                {trains.map(t => (
                                    <TrainMarker
                                        key={t.id}
                                        {...t}
                                    />
                                ))}
                            </RailMap>
                        </div>

                        {/* Rolling Stock / Train Table */}
                        <div className="h-48 overflow-auto">
                            <TrainTable />
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="col-span-3 h-full flex flex-col gap-4">
                        <AlertsPanel />
                        {/* AI Assistant Placeholder */}
                        <div className="bg-card border border-border rounded-lg p-4 h-1/3 flex items-center justify-center text-muted-foreground">
                            AI Assistant Ready
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
