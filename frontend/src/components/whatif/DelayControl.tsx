import { Clock, TrainFront } from "lucide-react";
import { useState } from "react";

interface Train {
    id: string;
    name: string;
}

interface DelayControlProps {
    trains: Train[];
    onApply: (trainId: string, minutes: number) => void;
}

export function DelayControl({ trains, onApply }: DelayControlProps) {
    const [selectedTrain, setSelectedTrain] = useState<string>("");
    const [minutes, setMinutes] = useState<number>(10);

    return (
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" /> Inject Delay
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Select Train</label>
                    <div className="relative">
                        <TrainFront className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <select
                            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={selectedTrain}
                            onChange={(e) => setSelectedTrain(e.target.value)}
                        >
                            <option value="">-- Choose Train --</option>
                            {trains.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.id} - {t.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Delay Duration (min)</label>
                    <input
                        type="number"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        value={minutes}
                        onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                    />
                </div>

                <button
                    onClick={() => {
                        if (selectedTrain) onApply(selectedTrain, minutes);
                    }}
                    disabled={!selectedTrain}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors text-sm"
                >
                    Apply Delay
                </button>
            </div>
        </div>
    );
}
