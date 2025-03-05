import { z } from 'zod';

export const userSchema = z.object({
    firstName: z.string().min(1, 'Le prénom est requis'),
    lastName: z.string().min(1, 'Le nom est requis'),
    email: z.string()
        .email('Email invalide')
        .refine((email) => email.endsWith('@edifis.fr'), {
            message: "L'adresse email doit se terminer par @edifis.fr"
        }),
    role: z.enum(['admin', 'employe', 'artisan', 'chef'] as const),
    specialites: z.array(z.string()).optional(),
    years_experience: z.number().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;