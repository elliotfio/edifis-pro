export type WorksiteSpeciality = 
    | "Plomberie"
    | "Électricité"
    | "Maçonnerie"
    | "Peinture"
    | "Carrelage"
    | "Menuiserie"
    | "Couverture"
    | "Isolation"
    | "Chauffage"
    | "Climatisation";

export interface Worksite {
    id: string;
    name: string;
    address: string;
    startDate: string;
    endDate: string;
    status: string;
    coordinates: [number, number];
    cost: number;
    budget: number;
    specialities_needed: WorksiteSpeciality[];
}

export const WORKSITE_SPECIALITIES: WorksiteSpeciality[] = [
    "Plomberie",
    "Électricité",
    "Maçonnerie",
    "Peinture",
    "Carrelage",
    "Menuiserie",
    "Couverture",
    "Isolation",
    "Chauffage",
    "Climatisation"
];