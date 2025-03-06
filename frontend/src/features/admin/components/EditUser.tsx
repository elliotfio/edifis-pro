import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/SelectInput';
import { UserRole } from '@/types/userType';
import { WORKSITE_SPECIALITIES, WorksiteSpeciality } from '@/types/worksiteType';
import { UserFormData, userSchema } from '@/validators/userValidator';
import { zodResolver } from '@hookform/resolvers/zod';
import { HardHat, Mail, User, UserCog } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface EditUserProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => void;
    user: {
        user: {
            firstName: string;
            lastName: string;
            email: string;
            role: string;
        };
        specialites?: string[];
        years_experience?: number;
    };
}

const specialityOptions = WORKSITE_SPECIALITIES.map((speciality) => ({
    label: speciality,
    value: speciality,
}));

const roleOptions = [
    { label: 'Employé administratif', value: 'employe' },
    { label: 'Artisan', value: 'artisan' },
    { label: 'Chef de chantier', value: 'chef' },
    { label: 'Administrateur', value: 'admin' },
];

export default function EditUser({ isOpen, onClose, onSubmit, user }: EditUserProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        setError,
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: user.user.firstName,
            lastName: user.user.lastName,
            email: user.user.email,
            role: user.user.role as UserRole,
            specialites: user.specialites || [],
            years_experience: user.years_experience,
        },
    });

    const selectedRole = watch('role');
    const selectedSpecialities = watch('specialites');

    const handleRoleChange = (value: string) => {
        setValue('role', value as UserRole, { shouldValidate: true });
        // Réinitialiser les champs spécifiques lors du changement de rôle
        if (value === 'artisan') {
            setValue('years_experience', undefined);
            setValue('specialites', []);
        } else if (value === 'chef') {
            setValue('specialites', []);
            setValue('years_experience', 0);
        } else {
            setValue('specialites', []);
            setValue('years_experience', undefined);
        }
    };

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
                [...currentSpecialities, speciality as WorksiteSpeciality],
                { shouldValidate: true }
            );
        }
    };

    const onSubmitForm = async (data: UserFormData) => {
        try {
            await onSubmit(data);
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                setError('email', {
                    type: 'manual',
                    message: error.message
                });
            }
            console.error('Error editing user:', error);
        }
    };

    if (!isOpen) return null;

    const showSpecialFields = selectedRole === 'artisan' || selectedRole === 'chef';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 w-[500px]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-6">
                    <UserCog size={24} />
                    <h2 className="text-xl font-semibold">
                        Modifier l'utilisateur
                    </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Prénom"
                                    placeholder='John'
                                    error={errors.firstName?.message}
                                    rightIcon={<User size={20} />}
                                    {...register('firstName')}
                                />
                            </div>
                            <div>
                                <Input
                                    label="Nom"
                                    placeholder='Doe'
                                    error={errors.lastName?.message}
                                    rightIcon={<User size={20} />}
                                    {...register('lastName')}
                                />
                            </div>
                        </div>

                        <Input
                            label="Email"
                            placeholder='john.doe@edifis.fr'
                            error={errors.email?.message}
                            rightIcon={<Mail size={20} />}
                            {...register('email')}
                        />

                        <SelectInput
                            label="Rôle"
                            name="role"
                            options={roleOptions}
                            value={selectedRole ? [selectedRole] : []}
                            onChange={handleRoleChange}
                            error={errors.role?.message}
                            isMulti={false}
                        />

                        {showSpecialFields && (
                            <>
                                {selectedRole === 'chef' && (
                                    <Input
                                        type="number"
                                        label="Années d'expérience"
                                        error={errors.years_experience?.message}
                                        rightIcon={<HardHat size={20} />}
                                        {...register('years_experience', { valueAsNumber: true })}
                                    />
                                )}

                                {selectedRole === 'artisan' && (
                                    <SelectInput
                                        label="Spécialités"
                                        name="specialites"
                                        options={specialityOptions}
                                        value={selectedSpecialities || []}
                                        onChange={handleSpecialitySelect}
                                        error={errors.specialites?.message}
                                        isMulti
                                    />
                                )}
                            </>
                        )}

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