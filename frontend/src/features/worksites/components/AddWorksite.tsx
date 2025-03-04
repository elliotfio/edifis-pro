import { AddressInput } from '@/components/ui/AddressInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/SelectInput';
import { Worksite, WORKSITE_SPECIALITIES, WorksiteSpeciality } from '@/types/worksiteType';
import {
    createWorksiteFromFormData,
    WorksiteFormData,
    worksiteSchema,
} from '@/validators/worksiteValidator';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Pickaxe, Text } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface AddWorksiteProps {
    isOpen: boolean;
    onClose: () => void;
    onAddWorksite: (worksite: Partial<Worksite>) => void;
}

const specialityOptions = WORKSITE_SPECIALITIES.map((speciality) => ({
    label: speciality,
    value: speciality,
}));

export default function AddWorksite({ isOpen, onClose, onAddWorksite }: AddWorksiteProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        setError,
        clearErrors,
    } = useForm<WorksiteFormData>({
        resolver: zodResolver(worksiteSchema),
        defaultValues: {
            name: '',
            startDate: '',
            endDate: '',
            budget: undefined,
            address: '',
            coordinates: [0, 0],
            specialities_needed: [],
        },
    });

    // Log form values on every change
    const formValues = watch();
    console.log('Form values:', {
        ...formValues,
        errors: Object.keys(errors).length > 0 ? errors : 'No errors'
    });

    const selectedSpecialities = watch('specialities_needed');

    const handleSpecialitySelect = (speciality: string) => {
        const currentSpecialities = selectedSpecialities || [];
        if (currentSpecialities.includes(speciality as WorksiteSpeciality)) {
            setValue(
                'specialities_needed',
                currentSpecialities.filter((s) => s !== (speciality as WorksiteSpeciality)),
                { shouldValidate: true }
            );
        } else {
            setValue(
                'specialities_needed',
                [...currentSpecialities, speciality as WorksiteSpeciality],
                { shouldValidate: true }
            );
        }
    };

    const handleAddressSelect = (address: string, coordinates: [number, number], isValid: boolean) => {
        setValue('address', address, { shouldValidate: true });
        setValue('coordinates', coordinates, { shouldValidate: true });
        
        if (!isValid && address) {
            setError('address', {
                type: 'manual',
                message: 'Veuillez sélectionner une adresse dans la liste'
            });
        } else {
            clearErrors('address');
        }
    };

    const onSubmit = (data: WorksiteFormData) => {
        // Vérifie si l'adresse est valide avant de soumettre
        const addressValue = watch('address');
        const coordinates = watch('coordinates');
        if (addressValue && (coordinates[0] === 0 && coordinates[1] === 0)) {
            setError('address', {
                type: 'manual',
                message: 'Veuillez sélectionner une adresse valide dans la liste'
            });
            return;
        }

        const newWorksite = createWorksiteFromFormData(data);
        onAddWorksite(newWorksite);
        reset();
        onClose();
    };

    console.log('')

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex gap-2">
                <Pickaxe size={24} />
                <h2 className="text-lg font-medium mb-4">Ajouter un nouveau chantier</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Nom du projet"
                        rightIcon={<Text size={20} className='text-gray-400' />}
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <SelectInput
                        label="Spécialités requises"
                        name="specialities"
                        options={specialityOptions}
                        value={selectedSpecialities || []}
                        onChange={handleSpecialitySelect}
                        error={errors.specialities_needed?.message}
                        disabled={selectedSpecialities?.length >= 10}
                        isMulti
                    />

                    <Input
                        label="Date de début"
                        type="date"
                        error={errors.startDate?.message}
                        {...register('startDate')}
                    />

                    <Input
                        label="Date de fin"
                        type="date"
                        error={errors.endDate?.message}
                        {...register('endDate')}
                    />

                    <AddressInput
                        label="Adresse"
                        error={errors.address?.message}
                        value={watch('address')}
                        onChange={handleAddressSelect}
                    />

                    <Input
                        label="Budget"
                        rightIcon={<CreditCard size={20} className='text-gray-400' />}
                        type="number"
                        error={errors.budget?.message}
                        {...register('budget', { valueAsNumber: true })}
                    />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                reset();
                                onClose();
                            }}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" variant="primary">
                            Ajouter
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
