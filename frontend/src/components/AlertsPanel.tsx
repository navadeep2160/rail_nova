import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
    id: number;
    type: "critical" | "warning" | "info";
    message: string;
    time: string;
}

const MOCK_ALERTS: Alert[] = [
    { id: 1, type: "critical", message: "Signal Failure at Block SC-04", time: "10:42 AM" },
    { id: 2, type: "warning", message: "Train 12723 Delayed by 15m", time: "10:35 AM" },
    { id: 3, type: "info", message: "Maintenance Scheduled for Track 2", time: "09:00 AM" },
];

export default function AlertsPanel() {
    return (
        <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col h-full">
            <div className="p-3 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <AlertTriangle size={16} /> Latest Alerts
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {MOCK_ALERTS.map((alert) => (
                    <div key={alert.id} className={cn(
                        "p-3 rounded-md border text-sm flex gap-3",
                        alert.type === "critical" ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" :
                            alert.type === "warning" ? "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400" :
                                "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                    )}>
                        <div className="mt-0.5">
                            {alert.type === "critical" ? <AlertCircle size={16} /> :
                                alert.type === "warning" ? <AlertTriangle size={16} /> : <Info size={16} />}
                        </div>
                        <div>
                            <p className="font-medium leading-tight">{alert.message}</p>
                            <p className="text-xs opacity-70 mt-1">{alert.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
