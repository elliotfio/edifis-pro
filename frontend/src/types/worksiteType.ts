export interface Worksite {
    id: string;
    name: string;
    address: string;
    startDate: string;
    endDate: string;
    status: string;
    coordinates: [number, number];
}