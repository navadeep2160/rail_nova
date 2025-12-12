export interface Train {
    id: string;
    name: string;
    speed: number;
    distance: number;
    lat: number;
    lng: number;
    status: "on-time" | "delayed" | "stopped" | string;
    route_id?: string;
}

export interface Block {
    id: string;
    section: string;
    status: "free" | "occupied" | "maintenance";
    start_km: number;
    end_km: number;
}
