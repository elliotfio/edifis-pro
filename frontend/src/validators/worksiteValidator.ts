import { z } from 'zod';
import { Worksite, WorksiteSpeciality, WORKSITE_SPECIALITIES } from '@/types/worksiteType';

export const worksiteSchema = z.object({
    name: z.string()
        .min(1, "Le nom du projet est requis")
        .max(100, "Le nom du projet ne peut pas dépasser 100 caractères"),
    
    startDate: z.string()
        .min(1, "La date de début est requise")
        .refine((date) => new Date(date) >= new Date(), {
            message: "La date de début doit être dans le futur"
        }),
    
    endDate: z.string()
        .min(1, "La date de fin est requise")
        .refine((date) => new Date(date) >= new Date(), {
            message: "La date de fin doit être dans le futur"
        }),
    
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
    
    specialities_needed: z.array(
        z.enum(WORKSITE_SPECIALITIES as [WorksiteSpeciality, ...WorksiteSpeciality[]])
    )
        .min(1, "Au moins une spécialité est requise")
        .max(10, "Vous ne pouvez pas sélectionner plus de 10 spécialités"),
}).refine((data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate >= startDate;
}, {
    message: "La date de fin doit être après la date de début",
    path: ["endDate"]
});

export type WorksiteFormData = z.infer<typeof worksiteSchema>;

export function createWorksiteFromFormData(formData: WorksiteFormData) {
    const randomPercentage = Math.random() * (0.7 - 0.3) + 0.3;
    return {
        id: crypto.randomUUID(),
        ...formData,
        status: 'attributed',
        cost: Math.round(formData.budget * randomPercentage)
    };
}