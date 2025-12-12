import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

interface Alert {
    id: number;
    type: "critical" | "major" | "minor" | "info" | "warning"; // Updated types to match backend models + warning fallback
    message: string;
    time: string;
}

export default function AlertsPanel() {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        socket.on('state_update', (data: any) => {
            if (data.alerts) {
                // Reverse to show newest first
                setAlerts([...data.alerts].reverse());
            }
        });
        return () => {
            socket.off('state_update');
        };
    }, []);

    return (
        <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col h-full min-h-0">
            <div className="p-3 border-b border-border bg-muted/30 shrink-0">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <AlertTriangle size={16} className="text-orange-500" /> System Alerts
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {alerts.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-4">No Active Alerts</div>
                ) : (
                    alerts.map((alert) => (
                        <div key={alert.id} className={cn(
                            "p-3 rounded-md border text-sm flex gap-3 animate-in fade-in slide-in-from-right-4 duration-300",
                            (alert.type === "critical") ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" :
                                (alert.type === "major" || alert.type === "warning") ? "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400" :
                                    (alert.type === "minor") ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                                        "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                        )}>
                            <div className="mt-0.5 shrink-0">
                                {alert.type === "critical" ? <AlertCircle size={16} /> :
                                    (alert.type === "major" || alert.type === "warning") ? <AlertTriangle size={16} /> :
                                        <Info size={16} />}
                            </div>
                            <div>
                                <p className="font-medium leading-tight">{alert.message}</p>
                                <p className="text-xs opacity-70 mt-1">{alert.time}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
