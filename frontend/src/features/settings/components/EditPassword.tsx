import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useState } from 'react';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
    newPassword: z.string()
        .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface EditPasswordProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
}

interface ApiResponse {
    message: string;
}

export default function EditPassword({ isOpen, onClose, userId }: EditPasswordProps) {
    const [error, setError] = useState<string | null>(null);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
    });

    const onSubmit = async (data: PasswordFormData) => {
        try {
            setError(null);
            const response = await axios.put<ApiResponse>(`/api/users/${userId}/password`, {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });

            console.log('Mot de passe mis à jour avec succès');
            reset();
            onClose();
        } catch (error: any) {
            console.error('Erreur lors de la modification du mot de passe:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
            setError(errorMessage);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 w-[500px]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-6">
                    <Lock size={24} />
                    <h2 className="text-xl font-semibold">
                        Modifier mon mot de passe
                    </h2>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-4">
                        <Input
                            type="password"
                            label="Mot de passe actuel"
                            placeholder="••••••••"
                            error={errors.currentPassword?.message}
                            rightIcon={<Lock size={20} />}
                            {...register('currentPassword')}
                        />

                        <Input
                            type="password"
                            label="Nouveau mot de passe"
                            placeholder="••••••••"
                            error={errors.newPassword?.message}
                            rightIcon={<Lock size={20} />}
                            {...register('newPassword')}
                        />

                        <Input
                            type="password"
                            label="Confirmer le nouveau mot de passe"
                            placeholder="••••••••"
                            error={errors.confirmPassword?.message}
                            rightIcon={<Lock size={20} />}
                            {...register('confirmPassword')}
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="secondary" onClick={onClose}>
                                Annuler
                            </Button>
                            <Button type="submit">
                                Enregistrer
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
