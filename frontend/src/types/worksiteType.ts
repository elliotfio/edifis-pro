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
    | "Climatisation"
    | "Gros œuvre"
    | "Charpente"
    | "Plâtrerie"
    | "Sanitaire"
    | "Domotique"
    | "Éclairage"
    | "Béton"
    | "Décoration"
    | "Revêtements muraux"
    | "Cloisons"
    | "Enduits"
    | "Façades"
    | "Acoustique"
    | "Thermique"
    | "Plaques de plâtre"
    | "Faux plafonds"
    | "Staff"
    | "Agencement"
    | "Ébénisterie"
    | "Parquet"
    | "Revêtements de sol"
    | "Automatisation"
    | "Ossature bois"
    | "Vitrerie"
    | "Fenêtres"
    | "Faïence"
    | "Mosaïque"
    | "Terrassement"
    | "Fondations"
    | "Métallerie"
    | "Serrurerie"
    | "Sols"
    | "Toiture"
    | "Zinguerie"
    | "Ascenseurs"
    | "Mécanique"
    | "Paysagisme"
    | "Aménagement extérieur"
    | "Jardinage"
    | "Isolation extérieure"
    | "Étanchéité"
    | "Toiture-terrasse"
    | "Démolition"
    | "Déconstruction"
    | "Bois"
    | "Carrosserie"
    | "Soudure"
    | "Ferronnerie"
    | "Forge"
    | "Miroiterie"
    | "Fumisterie"
    | "Cheminées"
    | "Ramonage"
    | "Entretien conduits"
    | "Nettoyage"
    | "Travaux en hauteur"
    | "Sécurité"
    | "Assemblage"
    | "Bardage"
    | "Montage"
    | "Granit"
    | "Pierre"
    | "Pavage"
    | "Dallage";

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
    "Climatisation",
    "Gros œuvre",
    "Charpente",
    "Plâtrerie",
    "Sanitaire",
    "Domotique",
    "Éclairage",
    "Béton",
    "Décoration",
    "Revêtements muraux",
    "Cloisons",
    "Enduits",
    "Façades",
    "Acoustique",
    "Thermique",
    "Plaques de plâtre",
    "Faux plafonds",
    "Staff",
    "Agencement",
    "Ébénisterie",
    "Parquet",
    "Revêtements de sol",
    "Automatisation",
    "Ossature bois",
    "Vitrerie",
    "Fenêtres",
    "Faïence",
    "Mosaïque",
    "Terrassement",
    "Fondations",
    "Métallerie",
    "Serrurerie",
    "Sols",
    "Toiture",
    "Zinguerie",
    "Ascenseurs",
    "Mécanique",
    "Paysagisme",
    "Aménagement extérieur",
    "Jardinage",
    "Isolation extérieure",
    "Étanchéité",
    "Toiture-terrasse",
    "Démolition",
    "Déconstruction",
    "Bois",
    "Carrosserie",
    "Soudure",
    "Ferronnerie",
    "Forge",
    "Miroiterie",
    "Fumisterie",
    "Cheminées",
    "Ramonage",
    "Entretien conduits",
    "Nettoyage",
    "Travaux en hauteur",
    "Sécurité",
    "Assemblage",
    "Bardage",
    "Montage",
    "Granit",
    "Pierre",
    "Pavage",
    "Dallage"
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