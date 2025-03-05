export type UserRole = 'admin' | 'employe' | 'artisan' | 'chef';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    date_creation: string;
    password?: string;
}

export interface ArtisanFormData {
    firstName: string;
    lastName: string;
    email: string;
    specialites: string[];
    years_experience?: number;
}

export interface ArtisanUser {
    user_id: number;
    user: User;
    specialites: string[];
    disponible: boolean;
    note_moyenne: number;
    nombre_chantiers: number;
    current_worksite?: string;
    history_worksite?: string[];
}

export interface ChefUser {
    user_id: number;
    user: User;
    specialites: string[];
    disponible: boolean;
    years_experience: number;
    chantiers_en_cours: number;
    chantiers_termines: number;
    current_worksite?: string;
    history_worksite?: string[];
    note_moyenne?: number;
}
