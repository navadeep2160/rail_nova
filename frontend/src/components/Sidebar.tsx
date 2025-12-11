import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Map as MapIcon, BarChart3, Settings, BrainCircuit } from "lucide-react";

export default function Sidebar() {
    const location = useLocation();

    const navItems = [
        { name: "Live Control", path: "/", icon: <LayoutDashboard size={20} /> },
        { name: "What-If Engine", path: "/what-if", icon: <BrainCircuit size={20} /> },
        { name: "Simulation", path: "/simulation", icon: <MapIcon size={20} /> },
        { name: "Analytics", path: "/analytics", icon: <BarChart3 size={20} /> },
    ];

    return (
        <div className="w-64 h-screen bg-card border-r border-border flex flex-col p-4">
            <div className="mb-8 flex items-center gap-2 px-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">RN</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">Rail-Nova</h1>
            </div>

            <nav className="space-y-2 flex-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                            location.pathname === item.path
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        {item.icon}
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground cursor-pointer">
                    <Settings size={20} />
                    <span className="text-sm font-medium">Settings</span>
                </div>
            </div>
        </div>
    );
}
