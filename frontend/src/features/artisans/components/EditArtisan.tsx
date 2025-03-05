import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/SelectInput';
import { ArtisanUser, ChefUser } from '@/types/userType';
import { WORKSITE_SPECIALITIES, WorksiteSpeciality } from '@/types/worksiteType';
import { ArtisanFormData, artisanSchema } from '@/validators/artisanValidator';
import { zodResolver } from '@hookform/resolvers/zod';
import { HardHat, Mail, User } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface EditArtisanProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (data: ArtisanFormData) => void;
    artisan: ArtisanUser | ChefUser;
    view: 'artisans' | 'chefs';
}

const specialityOptions = WORKSITE_SPECIALITIES.map((speciality) => ({
    label: speciality,
    value: speciality,
}));

export default function EditArtisan({ onClose, onEdit, artisan, view }: EditArtisanProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
        setError,
    } = useForm<ArtisanFormData>({
        resolver: zodResolver(artisanSchema),
        defaultValues: {
            firstName: artisan.user.firstName,
            lastName: artisan.user.lastName,
            email: artisan.user.email,
            specialites: artisan.specialites,
            years_experience: 'years_experience' in artisan ? artisan.years_experience : undefined,
        },
    });

    // Reset form when artisan changes
    useEffect(() => {
        reset({
            firstName: artisan.user.firstName,
            lastName: artisan.user.lastName,
            email: artisan.user.email,
            specialites: artisan.specialites,
            years_experience: 'years_experience' in artisan ? artisan.years_experience : undefined,
        });
    }, [artisan, reset]);

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
            setValue('specialites', [...currentSpecialities, speciality], { shouldValidate: true });
        }
    };

    const onSubmit = async (data: ArtisanFormData) => {
        try {
            await onEdit(data);
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                setError('email', {
                    type: 'manual',
                    message: error.message,
                });
            }
            console.error('Error editing artisan:', error);
        }
    };

    return (
        // <Modal
        //     isOpen={isOpen}
        //     onClose={onClose}
        //     title={`Modifier ${view === 'artisans' ? "l'artisan" : 'le chef de chantier'}`}
        // >
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div className="bg-white rounded-lg p-6 w-[500px]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-6">
                    {view === 'artisans' ? (
                        <User className="text-primary" size={24} />
                    ) : (
                        <HardHat className="text-primary" size={24} />
                    )}
                    <h2 className="text-xl font-semibold">
                        Modifier {view === 'artisans' ? 'un artisan' : 'un chef de chantier'}
                    </h2>
                </div>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(onSubmit)();
                        }
                    }}
                >
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

                    <div className="flex justify-end gap-4 pt-4">
                        <Button variant="secondary" type="button" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit">Enregistrer</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
