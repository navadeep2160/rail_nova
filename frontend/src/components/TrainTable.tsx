import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Pause } from "lucide-react";

const TRAINS = [
    { id: "12723", name: "Telangana Exp", from: "SC", to: "NDLS", status: "On Time", speed: 85 },
    { id: "12760", name: "Charminar Exp", from: "MAS", to: "HYB", status: "Delayed 10m", speed: 60 },
    { id: "17010", name: "Intercity Exp", from: "SC", to: "BZA", status: "On Time", speed: 92 },
];

export default function TrainTable() {
    return (
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-3 bg-muted/30 border-b border-border">
                <h3 className="font-semibold text-sm">Active Trains</h3>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Train No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Speed</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {TRAINS.map((train) => (
                        <TableRow key={train.id}>
                            <TableCell className="font-medium">{train.id}</TableCell>
                            <TableCell>{train.name}</TableCell>
                            <TableCell>{train.from} → {train.to}</TableCell>
                            <TableCell className={train.status.includes("Delayed") ? "text-red-500" : "text-green-500"}>
                                {train.status}
                            </TableCell>
                            <TableCell>{train.speed} km/h</TableCell>
                            <TableCell>
                                <button className="p-1 hover:bg-muted rounded text-primary">
                                    <Play size={14} />
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
