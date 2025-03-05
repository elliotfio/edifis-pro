import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const addressSchema = z.object({
    street: z.string().min(2, 'L\'adresse doit contenir au moins 2 caractères'),
    city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
    zipCode: z.string().length(5, 'Le code postal doit contenir 5 chiffres'),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface EditAddressProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (data: AddressFormData) => void;
    initialData: AddressFormData;
}

export default function EditAddress({ isOpen, onClose, onEdit, initialData }: EditAddressProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: initialData,
    });

    const onSubmit = async (data: AddressFormData) => {
        try {
            await onEdit(data);
            onClose();
        } catch (error) {
            console.error('Erreur lors de la modification de l\'adresse:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 w-[500px]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-6">
                    <MapPin size={24} />
                    <h2 className="text-xl font-semibold">
                        Modifier mon adresse
                    </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-4">
                        <Input
                            label="Numéro et rue"
                            placeholder="123 rue de Paris"
                            error={errors.street?.message}
                            rightIcon={<Map size={20} />}
                            {...register('street')}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Ville"
                                placeholder="Paris"
                                error={errors.city?.message}
                                rightIcon={<Building2 size={20} />}
                                {...register('city')}
                            />
                            <Input
                                label="Code postal"
                                placeholder="75000"
                                error={errors.zipCode?.message}
                                rightIcon={<MapPin size={20} />}
                                {...register('zipCode')}
                            />
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
