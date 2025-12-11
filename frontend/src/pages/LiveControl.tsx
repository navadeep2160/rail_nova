import Sidebar from "@/components/Sidebar";
import KPIBar from "@/components/KPIBar";
import RailMap from "@/map/RailMap";
import TrackLayer from "@/map/TrackLayer";
import BlockOverlay from "@/map/BlockOverlay";
import TrainMarker from "@/map/TrainMarker";
import AlertsPanel from "@/components/AlertsPanel";
import AIAssistant from "@/components/AIAssistant";
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

    // Connect to Backend WebSocket
    useEffect(() => {
        // Assume global socket or create new one since we don't have a context provider visible in this view
        // Ideally use a useSocket hook.
        // For Hackathon speed:
        import('socket.io-client').then(({ io }) => {
            const socket = io('http://localhost:8000');

            socket.on('connect', () => {
                console.log("LiveControl connected to backend");
            });

            socket.on('state_update', (data: any) => {
                if (data.trains) {
                    setTrains(data.trains);
                }
            });

            return () => socket.disconnect();
        });
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
                    <div className="col-span-3 h-full flex flex-col gap-4 min-h-0">
                        <div className="h-1/2 min-h-0">
                            <AlertsPanel />
                        </div>
                        <div className="h-1/2 min-h-0">
                            <AIAssistant />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
