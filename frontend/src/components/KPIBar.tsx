import { Activity, Clock, AlertTriangle, TrainFront } from "lucide-react";

export default function KPIBar() {
    return (
        <div className="grid grid-cols-4 gap-4 p-4">
            <KPIItem label="Active Trains" value="12" icon={<TrainFront className="text-blue-500" />} />
            <KPIItem label="System Status" value="Optimal" icon={<Activity className="text-green-500" />} />
            <KPIItem label="Delays > 15m" value="2" icon={<Clock className="text-orange-500" />} />
            <KPIItem label="Critical Alerts" value="0" icon={<AlertTriangle className="text-red-500" />} />
        </div>
    );
}

function KPIItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between shadow-sm">
            <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className="p-2 bg-muted rounded-full opacity-80">{icon}</div>
        </div>
    );
}
