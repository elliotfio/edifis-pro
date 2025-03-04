import { AddressInput } from '@/components/ui/AddressInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SelectInput } from '@/components/ui/SelectInput';
import { Worksite, WORKSITE_SPECIALITIES, WorksiteSpeciality } from '@/types/worksiteType';
import { WorksiteEditFormData, worksiteEditSchema } from '@/validators/worksiteValidator';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Text } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface EditWorksiteProps {
    isOpen: boolean;
    onClose: () => void;
    onEditWorksite: (worksite: Worksite) => void;
    worksite: Worksite;
}

const specialityOptions = WORKSITE_SPECIALITIES.map((speciality) => ({
    label: speciality,
    value: speciality,
}));

export default function EditWorksite({
    isOpen,
    onClose,
    onEditWorksite,
    worksite,
}: EditWorksiteProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        clearErrors,
        setError,
        reset,
    } = useForm<WorksiteEditFormData>({
        resolver: zodResolver(worksiteEditSchema),
        defaultValues: {
            name: worksite.name,
            startDate: worksite.startDate,
            endDate: worksite.endDate,
            budget: worksite.budget,
            address: worksite.address,
            coordinates: worksite.coordinates,
            specialities_needed: worksite.specialities_needed || [],
        },
    });

    // Reset form when worksite changes
    useEffect(() => {
        reset({
            name: worksite.name,
            startDate: worksite.startDate,
            endDate: worksite.endDate,
            budget: worksite.budget,
            address: worksite.address,
            coordinates: worksite.coordinates,
            specialities_needed: worksite.specialities_needed || [],
        });
    }, [worksite, reset]);

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

    const handleAddressSelect = (
        address: string,
        coordinates: [number, number],
        isValid: boolean
    ) => {
        setValue('address', address, { shouldValidate: true });
        setValue('coordinates', coordinates, { shouldValidate: true });

        if (!isValid && address) {
            setError('address', {
                type: 'manual',
                message: 'Veuillez sélectionner une adresse dans la liste',
            });
        } else {
            clearErrors('address');
        }
    };

    const onSubmit = (data: WorksiteEditFormData) => {
        const updatedWorksite: Worksite = {
            ...worksite,
            ...data,
            coordinates: data.coordinates || worksite.coordinates,
            cost: Math.round(data.budget * (Math.random() * (0.7 - 0.3) + 0.3)),
            id: worksite.id,
            status: worksite.status,
        };

        onEditWorksite(updatedWorksite);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Modifier le chantier"
        >
            <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Nom du projet"
                        rightIcon={<Text size={20} className="text-gray-400" />}
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

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Date de début"
                            error={errors.startDate?.message}
                            {...register('startDate')}
                        />
                        <Input
                            type="date"
                            label="Date de fin"
                            error={errors.endDate?.message}
                            {...register('endDate')}
                        />
                    </div>

                    <AddressInput
                        label="Adresse"
                        error={errors.address?.message}
                        value={watch('address')}
                        onChange={handleAddressSelect}
                    />

                    <Input
                        label="Budget"
                        rightIcon={<CreditCard size={20} className="text-gray-400" />}
                        type="number"
                        error={errors.budget?.message}
                        {...register('budget', { valueAsNumber: true })}
                    />

                    <div className="flex justify-end gap-4 pt-4">
                        <Button variant="secondary" type="button" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit">Enregistrer</Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
