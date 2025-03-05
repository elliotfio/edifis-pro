import { z } from 'zod';
import { WorksiteStatus, WorksiteSpeciality, WORKSITE_SPECIALITIES } from '@/types/worksiteType';

// Schéma de base commun pour la création et l'édition
const baseWorksiteSchema = {
    name: z.string()
        .min(1, "Le nom du projet est requis")
        .max(100, "Le nom du projet ne peut pas dépasser 100 caractères"),
    
    startDate: z.string()
        .min(1, "La date de début est requise"),
    
    endDate: z.string()
        .min(1, "La date de fin est requise"),
    
    budget: z.number({
        required_error: "Le budget est requis",
        invalid_type_error: "Le budget doit être un nombre"
    })
        .positive("Le budget doit être positif")
        .max(1000000000, "Le budget ne peut pas dépasser 1 milliard"),
    
    address: z.string()
        .min(1, "L'adresse est requise")
        .max(200, "L'adresse ne peut pas dépasser 200 caractères"),
    
    coordinates: z.tuple([z.number(), z.number()]),
    
    specialities_needed: z.array(z.enum(WORKSITE_SPECIALITIES as [WorksiteSpeciality, ...WorksiteSpeciality[]]))
        .min(1, "Au moins une spécialité est requise")
        .max(10, "Vous ne pouvez pas sélectionner plus de 10 spécialités"),
};

// Schema pour la création
export const worksiteSchema = z.object({
    ...baseWorksiteSchema,
    startDate: baseWorksiteSchema.startDate.refine(
        (date) => new Date(date) >= new Date(), 
        { message: "La date de début doit être dans le futur" }
    ),
    endDate: baseWorksiteSchema.endDate.refine(
        (date) => new Date(date) >= new Date(),
        { message: "La date de fin doit être dans le futur" }
    ),
}).refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    {
        message: "La date de fin doit être après la date de début",
        path: ["endDate"]
    }
);

// Schema pour l'édition
export const worksiteEditSchema = z.object({
    ...baseWorksiteSchema,
    coordinates: baseWorksiteSchema.coordinates.optional(),
}).refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    {
        message: "La date de fin doit être après la date de début",
        path: ["endDate"]
    }
);

export function createWorksiteFromFormData(formData: WorksiteFormData): {
    id: string;
    status: WorksiteStatus;
    cost: number;
} & WorksiteFormData {
    const MIN_COST_PERCENTAGE = 0.3;
    const MAX_COST_PERCENTAGE = 0.7;
    const randomPercentage = Math.random() * (MAX_COST_PERCENTAGE - MIN_COST_PERCENTAGE) + MIN_COST_PERCENTAGE;
    
    return {
        id: crypto.randomUUID(),
        status: 'attributed',
        cost: Math.round(formData.budget * randomPercentage),
        ...formData,
    };
}

export type WorksiteFormData = z.infer<typeof worksiteSchema>;
export type WorksiteEditFormData = z.infer<typeof worksiteEditSchema>;