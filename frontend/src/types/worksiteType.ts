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

export type WorksiteStatus =
    | 'no_attributed'
    | 'attributed'
    | 'planned'
    | 'in_progress'
    | 'completed'
    | 'archived'
    | 'cancelled'
    | 'blocked';

export interface Worksite {
    id: string;
    name: string;
    address: string;
    startDate: string;
    endDate: string;
    status: WorksiteStatus;
    coordinates: { x: number; y: number };
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

export interface WorksiteInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    label: string;
    name: string;
    error?: string;
    worksites: Worksite[];
    value: string[];
    onChange?: (value: string) => void;
    isMulti?: boolean;
}