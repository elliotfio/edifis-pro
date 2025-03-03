import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z
    .string()
    .min(1, 'La confirmation du mot de passe est requise'),
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
