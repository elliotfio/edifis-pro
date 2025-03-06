import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/SelectInput';
import { Mail, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { WORKSITE_SPECIALITIES } from '@/types/worksiteType';
import { useEffect } from 'react';

const personalInfoSchema = z.object({
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    roleInfo: z.object({
        specialites: z.array(z.string()).optional(),
    }).optional(),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface EditInformationsProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (data: PersonalInfoFormData) => void;
    initialData: {
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        roleInfo?: {
            specialites?: string[];
        };
    };
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
        reset,
    } = useForm<PersonalInfoFormData>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            firstName: initialData.firstName,
            lastName: initialData.lastName,
            email: initialData.email,
            roleInfo: {
                specialites: initialData.roleInfo?.specialites || [],
            },
        },
    });

    // Reset form when modal is opened with new initialData
    useEffect(() => {
        if (isOpen) {
            reset({
                firstName: initialData.firstName,
                lastName: initialData.lastName,
                email: initialData.email,
                roleInfo: {
                    specialites: initialData.roleInfo?.specialites || [],
                },
            });
        }
    }, [isOpen, initialData, reset]);

    const selectedSpecializations = watch('roleInfo.specialites') || [];

    const handleSpecializationChange = (value: string) => {
        const currentSpecializations = selectedSpecializations;
        let newSpecializations;

        if (currentSpecializations.includes(value)) {
            newSpecializations = currentSpecializations.filter((s) => s !== value);
        } else {
            newSpecializations = [...currentSpecializations, value];
        }

        setValue('roleInfo.specialites', newSpecializations, { shouldValidate: true });
    };

    const onSubmit = async (data: PersonalInfoFormData) => {
        try {
            console.log('Form data before submission:', data); // Debug log
            const submissionData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                roleInfo: {
                    specialites: data.roleInfo?.specialites || [],
                }
            };
            console.log('Data being submitted:', submissionData); // Debug log
            await onEdit(submissionData);
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

                        {initialData.role === 'artisan' && (
                            <SelectInput
                                label="Spécialisations"
                                name="specialites"
                                options={WORKSITE_SPECIALITIES.map(speciality => ({
                                    label: speciality,
                                    value: speciality,
                                }))}
                                value={selectedSpecializations}
                                onChange={handleSpecializationChange}
                                error={errors.roleInfo?.specialites?.message}
                            />
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
