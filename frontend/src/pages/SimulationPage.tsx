import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Sliders, Activity } from "lucide-react";
import { ScenarioControls } from "@/components/whatif/ScenarioControls";
import MapSimulation from "@/components/whatif/MapSimulation";

const MOCK_TRAINS = [
    { id: "12723", name: "Telangana Exp" },
    { id: "17010", name: "Intercity Exp" },
    { id: "12760", name: "Charminar Exp" },
];

export default function SimulationPage() {
    // State
    const [weather, setWeather] = useState("clear");
    const [blockClosure, setBlockClosure] = useState(false);
    const [loopLine, setLoopLine] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleInjectDelay = (trainId: string, mins: number) => {
        console.log(`Injecting ${mins}m delay for ${trainId}`);
    };

    const handleRunSimulation = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000); // Mock run
    };

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-6 justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Sliders className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">What-If Simulation</h1>
                            <p className="text-xs text-muted-foreground">Predict conflicts & test scenarios</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-muted-foreground">Engine Ready</span>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">

                    {/* Left Controls */}
                    <div className="col-span-12 lg:col-span-4 xl:col-span-3 h-full overflow-y-auto pr-2 custom-scrollbar">
                        <ScenarioControls
                            weather={weather} setWeather={setWeather}
                            blockClosure={blockClosure} setBlockClosure={setBlockClosure}
                            loopLine={loopLine} setLoopLine={setLoopLine}
                            trains={MOCK_TRAINS}
                            onInjectDelay={handleInjectDelay}
                            onRun={handleRunSimulation}
                            loading={loading}
                        />
                    </div>

                    {/* Right Map */}
                    <div className="col-span-12 lg:col-span-8 xl:col-span-9 h-full flex flex-col gap-4">
                        <div className="flex-1 bg-card rounded-xl border border-border shadow-sm p-1 relative">
                            {/* Replaced PredictionMap with actual MapSimulation */}
                            <MapSimulation trains={MOCK_TRAINS.map(t => ({ // Mock locations for initial render, real data would come from context/prop
                                ...t,
                                lat: 17.5 + Math.random() * 0.1,
                                lng: 78.8 + Math.random() * 0.1,
                                speed: 60 + Math.random() * 40,
                                status: Math.random() > 0.7 ? 'delayed' : 'on-time',
                                distance: 12.5
                            }))} />

                            {/* Overlay Card Example */}
                            <div className="absolute bottom-6 left-6 z-[1000] bg-card/90 backdrop-blur p-4 rounded-xl border border-border shadow-lg max-w-xs">
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary" /> Simulation Stats
                                </h4>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Trains</span>
                                        <span className="font-medium">3</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Predicted Conflicts</span>
                                        <span className="font-medium text-green-500">0</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Est. Delay</span>
                                        <span className="font-medium text-amber-500">+12m</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
