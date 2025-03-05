import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/SelectInput';
import { WORKSITE_SPECIALITIES, WorksiteSpeciality } from '@/types/worksiteType';
import { zodResolver } from '@hookform/resolvers/zod';
import { HardHat, Mail, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface AddArtisanProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: ArtisanFormData) => void;
    view: 'artisans' | 'chefs';
}

const specialityOptions = WORKSITE_SPECIALITIES.map((speciality) => ({
    label: speciality,
    value: speciality,
}));

// Schema for form validation
const artisanSchema = z.object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide").endsWith("@edifis.fr", "L'email doit se terminer par @edifis.fr"),
    specialites: z.array(z.string()).min(1, "Sélectionnez au moins une spécialité"),
    years_experience: z.number().optional(),
});

export type ArtisanFormData = z.infer<typeof artisanSchema>;

export default function AddArtisan({ isOpen, onClose, onAdd, view }: AddArtisanProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        setError,
    } = useForm<ArtisanFormData>({
        resolver: zodResolver(artisanSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            specialites: [],
            years_experience: undefined,
        },
    });

    const selectedSpecialities = watch('specialites');

    const handleSpecialitySelect = (speciality: string) => {
        const currentSpecialities = selectedSpecialities || [];
        if (currentSpecialities.includes(speciality as WorksiteSpeciality)) {
            setValue(
                'specialites',
                currentSpecialities.filter((s) => s !== speciality),
                { shouldValidate: true }
            );
        } else {
            setValue(
                'specialites',
                [...currentSpecialities, speciality],
                { shouldValidate: true }
            );
        }
    };

    const onSubmit = async (data: ArtisanFormData) => {
        try {
            await onAdd(data);
            reset();
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                setError('email', {
                    type: 'manual',
                    message: error.message
                });
            }
            console.error('Error adding artisan:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 w-[500px]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-6">
                    {view === 'artisans' ? (
                        <User className="text-primary" size={24} />
                    ) : (
                        <HardHat className="text-primary" size={24} />
                    )}
                    <h2 className="text-xl font-semibold">
                        Ajouter un {view === 'artisans' ? 'artisan' : 'chef de chantier'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Prénom"
                                    error={errors.firstName?.message}
                                    rightIcon={<User size={20} />}
                                    {...register('firstName')}
                                />
                            </div>
                            <div>
                                <Input
                                    label="Nom"
                                    error={errors.lastName?.message}
                                    rightIcon={<User size={20} />}
                                    {...register('lastName')}
                                />
                            </div>
                        </div>

                        <Input
                            label="Email"
                            error={errors.email?.message}
                            rightIcon={<Mail size={20} />}
                            {...register('email')}
                        />

                        {view === 'chefs' && (
                            <Input
                                type="number"
                                label="Années d'expérience"
                                error={errors.years_experience?.message}
                                rightIcon={<HardHat size={20} />}
                                {...register('years_experience', { valueAsNumber: true })}
                            />
                        )}

                        <SelectInput
                            label="Spécialités"
                            name="specialites"
                            options={specialityOptions}
                            value={selectedSpecialities || []}
                            onChange={handleSpecialitySelect}
                            error={errors.specialites?.message}
                            isMulti
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="secondary" onClick={onClose}>
                                Annuler
                            </Button>
                            <Button type="submit">
                                Ajouter
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}