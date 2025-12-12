import { Sun, CloudRain, CloudFog, CloudLightning } from "lucide-react";

interface WeatherSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const CONDITIONS = [
    { id: "clear", label: "Clear", icon: Sun, color: "text-yellow-400" },
    { id: "rain", label: "Rain", icon: CloudRain, color: "text-blue-400" },
    { id: "fog", label: "Fog", icon: CloudFog, color: "text-gray-400" },
    { id: "storm", label: "Storm", icon: CloudLightning, color: "text-purple-400" },
];

export function WeatherSelector({ value, onChange }: WeatherSelectorProps) {
    return (
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Weather Conditions</h3>
            <div className="grid grid-cols-2 gap-3">
                {CONDITIONS.map((c) => {
                    const Icon = c.icon;
                    const isActive = value === c.id;
                    return (
                        <button
                            key={c.id}
                            onClick={() => onChange(c.id)}
                            className={`
                                flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
                                ${isActive
                                    ? "bg-primary/10 border-primary ring-1 ring-primary"
                                    : "bg-background border-border hover:bg-muted/50 hover:border-gray-500"}
                            `}
                        >
                            <Icon className={`w-5 h-5 ${c.color}`} />
                            <span className={`text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                                {c.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
