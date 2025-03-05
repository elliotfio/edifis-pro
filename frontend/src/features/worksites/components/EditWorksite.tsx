import { AddressInput } from '@/components/ui/AddressInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/SelectInput';
import { Worksite, WORKSITE_SPECIALITIES } from '@/types/worksiteType';
import { CreditCard, Pickaxe, Text } from 'lucide-react';
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

// Fonction utilitaire pour s'assurer qu'une valeur est un tableau
const ensureArray = (value: any): string[] => {
    if (!value) return [];
    if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
    if (Array.isArray(value)) return value;
    return [];
};

// Fonction utilitaire pour formater une date en YYYY-MM-DD
const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
};

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
    } = useForm({
        defaultValues: {
            name: worksite.name,
            startDate: formatDate(worksite.startDate),
            endDate: formatDate(worksite.endDate),
            budget: worksite.budget,
            cost: worksite.cost,
            address: worksite.address,
            coordinates: worksite.coordinates,
            specialities_needed: ensureArray(worksite.specialities_needed),
            status: worksite.status
        },
    });

    // Reset form when worksite changes
    useEffect(() => {
        reset({
            name: worksite.name,
            startDate: formatDate(worksite.startDate),
            endDate: formatDate(worksite.endDate),
            budget: worksite.budget,
            cost: worksite.cost,
            address: worksite.address,
            coordinates: worksite.coordinates,
            specialities_needed: ensureArray(worksite.specialities_needed),
            status: worksite.status
        });
    }, [worksite, reset]);

    const selectedSpecialities = watch('specialities_needed');

    const handleSpecialitySelect = (speciality: string) => {
        const currentSpecialities = ensureArray(selectedSpecialities);
        if (currentSpecialities.includes(speciality)) {
            setValue(
                'specialities_needed',
                currentSpecialities.filter((s) => s !== speciality),
                { shouldValidate: true }
            );
        } else {
            setValue(
                'specialities_needed',
                [...currentSpecialities, speciality],
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
        setValue('coordinates', { x: coordinates[0], y: coordinates[1] }, { shouldValidate: true });

        if (!isValid && address) {
            setError('address', {
                type: 'manual',
                message: 'Veuillez sélectionner une adresse dans la liste',
            });
        } else {
            clearErrors('address');
        }
    };

    const onSubmit = async (data: any) => {
        // Vérifie si l'adresse est valide avant de soumettre
        const addressValue = watch('address');
        const coordinates = watch('coordinates');
        if (addressValue && (coordinates.x === 0 && coordinates.y === 0)) {
            setError('address', {
                type: 'manual',
                message: 'Veuillez sélectionner une adresse valide dans la liste'
            });
            return;
        }

        // Calculer le coût comme 80% du budget
        const budget = parseFloat(data.budget);
        const cost = budget * 0.8;

        // Préparer les données pour l'API
        const worksiteData = {
            name: data.name.trim(),
            address: data.address,
            coordinates: data.coordinates,
            startDate: formatDate(data.startDate),
            endDate: formatDate(data.endDate),
            status: data.status,
            budget: budget.toString(),
            cost: cost.toString(),
            specialities_needed: Array.isArray(data.specialities_needed) 
                ? data.specialities_needed 
                : [data.specialities_needed]
        };

        try {
            const response = await fetch(`http://localhost:3000/api/worksites/${worksite.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(worksiteData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la mise à jour du chantier');
            }

            const result = await response.json();
            onEditWorksite({
                ...data,
                id: worksite.id,
                cost: cost
            });
            reset();
            onClose();
        } catch (error: any) {
            console.error('Erreur lors de la mise à jour du chantier:', error);
            setError('root', {
                type: 'manual',
                message: error.message || 'Erreur lors de la mise à jour du chantier'
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex gap-2">
                    <Pickaxe size={24} />
                    <h2 className="text-lg font-medium mb-4">Modifier le chantier</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Nom du projet"
                        rightIcon={<Text size={20} className='text-gray-400' />}
                        error={errors.name?.message}
                        {...register('name', { required: 'Le nom est requis' })}
                    />

                    <SelectInput
                        label="Spécialités requises"
                        name="specialities"
                        options={specialityOptions}
                        value={ensureArray(selectedSpecialities)}
                        onChange={handleSpecialitySelect}
                        error={errors.specialities_needed?.message}
                        disabled={selectedSpecialities?.length >= 10}
                        isMulti
                    />

                    <Input
                        label="Date de début"
                        type="date"
                        error={errors.startDate?.message}
                        defaultValue={formatDate(worksite.startDate)}
                        {...register('startDate', { required: 'La date de début est requise' })}
                    />

                    <Input
                        label="Date de fin"
                        type="date"
                        error={errors.endDate?.message}
                        defaultValue={formatDate(worksite.endDate)}
                        {...register('endDate', { required: 'La date de fin est requise' })}
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
                        {...register('budget', { 
                            required: 'Le budget est requis',
                            min: { value: 1000, message: 'Le budget minimum est de 1000€' }
                        })}
                    />

                    {errors.root && (
                        <div className="text-red-500 text-sm mt-2">
                            {errors.root.message}
                        </div>
                    )}

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
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
