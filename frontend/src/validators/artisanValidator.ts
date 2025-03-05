import { z } from 'zod';

export const artisanSchema = z.object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide").endsWith("@edifis.fr", "L'email doit se terminer par @edifis.fr"),
    specialites: z.array(z.string()).min(1, "Sélectionnez au moins une spécialité"),
    years_experience: z.number().optional(),
});

export type ArtisanFormData = z.infer<typeof artisanSchema>;