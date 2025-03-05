import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Phone, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { WORKSITE_SPECIALITIES } from '@/types/worksiteType';

const personalInfoSchema = z.object({
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    phone: z.string().min(10, 'Numéro de téléphone invalide'),
    specializations: z.array(z.string()),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface EditInformationsProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (data: PersonalInfoFormData) => void;
    initialData: PersonalInfoFormData;
}

const specializationOptions = WORKSITE_SPECIALITIES.map((speciality) => ({
    label: speciality,
    value: speciality,
}));

export default function EditInformations({ isOpen, onClose, onEdit, initialData }: EditInformationsProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<PersonalInfoFormData>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            ...initialData,
            specializations: initialData.specializations || [],
        },
    });

    const selectedSpecializations = watch('specializations');

    const handleSpecializationSelect = (value: string) => {
        const currentSpecializations = selectedSpecializations || [];
        let newSpecializations;

        if (currentSpecializations.includes(value)) {
            // Si la spécialisation est déjà sélectionnée, on la retire
            newSpecializations = currentSpecializations.filter((s) => s !== value);
        } else {
            // Sinon, on l'ajoute
            newSpecializations = [...currentSpecializations, value];
        }

        setValue('specializations', newSpecializations, { shouldValidate: true });
    };

    const onSubmit = async (data: PersonalInfoFormData) => {
        try {
            await onEdit(data);
            onClose();
        } catch (error) {
            console.error('Erreur lors de la modification des informations:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 w-[500px]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-6">
                    <User size={24} />
                    <h2 className="text-xl font-semibold">
                        Modifier mes informations
                    </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Prénom"
                                    placeholder="John"
                                    error={errors.firstName?.message}
                                    rightIcon={<User size={20} />}
                                    {...register('firstName')}
                                />
                            </div>
                            <div>
                                <Input
                                    label="Nom"
                                    placeholder="Doe"
                                    error={errors.lastName?.message}
                                    rightIcon={<User size={20} />}
                                    {...register('lastName')}
                                />
                            </div>
                        </div>

                        <Input
                            label="Email"
                            placeholder="john.doe@example.com"
                            error={errors.email?.message}
                            rightIcon={<Mail size={20} />}
                            {...register('email')}
                        />

                        <Input
                            label="Téléphone"
                            placeholder="0123456789"
                            error={errors.phone?.message}
                            rightIcon={<Phone size={20} />}
                            {...register('phone')}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Spécialisations</label>
                            <div className="flex flex-wrap gap-2">
                                {specializationOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSpecializationSelect(option.value)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                            selectedSpecializations?.includes(option.value)
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            {errors.specializations?.message && (
                                <p className="text-sm text-red-500 mt-1">{errors.specializations.message}</p>
                            )}
                        </div>

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
