import { AlertTriangle, Route } from "lucide-react";
import { WeatherSelector } from "./WeatherSelector";
import { DelayControl } from "./DelayControl";

interface ScenarioControlsProps {
    weather: string;
    setWeather: (w: string) => void;
    blockClosure: boolean;
    setBlockClosure: (b: boolean) => void;
    loopLine: boolean;
    setLoopLine: (l: boolean) => void;
    trains: any[];
    onInjectDelay: (id: string, mins: number) => void;
    onRun: () => void;
    loading: boolean;
}

export function ScenarioControls({
    weather, setWeather,
    blockClosure, setBlockClosure,
    loopLine, setLoopLine,
    trains, onInjectDelay,
    onRun, loading
}: ScenarioControlsProps) {
    return (
        <div className="space-y-6">
            <WeatherSelector value={weather} onChange={setWeather} />

            {/* Toggles */}
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Infrastructure</h3>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-sm font-medium">Block Closures</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={blockClosure} onChange={(e) => setBlockClosure(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Route className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium">Use Loop Lines</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={loopLine} onChange={(e) => setLoopLine(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>

            <DelayControl trains={trains} onApply={onInjectDelay} />

            <button
                onClick={onRun}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg font-bold text-lg disabled:opacity-50 transform transition-all active:scale-95"
            >
                {loading ? "Running Simulation..." : "Run Simulation"}
            </button>
        </div>
    );
}
