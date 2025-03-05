import { Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Pencil } from 'lucide-react';
import EditInformations from './components/EditInformations';
import EditAddress from './components/EditAddress';

export default function Settings() {
    const [formData, setFormData] = useState({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '0123456789',
        specializations: [] as string[]
    });

    const [addressData, setAddressData] = useState({
        street: '123 rue de Paris',
        city: 'Paris',
        zipCode: '75000'
    });
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);

    const handleEditSubmit = (newData: typeof formData) => {
        setFormData(newData);
        // Ici, vous pouvez ajouter la logique pour envoyer les modifications au backend
        console.log('Nouvelles données:', newData);
    };

    const handleEditAddressSubmit = (newData: typeof addressData) => {
        setAddressData(newData);
        // Ici, vous pouvez ajouter la logique pour envoyer les modifications au backend
        console.log('Nouvelles données adresse:', newData);
    };

    return (
        <div className="p-8 text-gray-800">
            <div className="flex items-center gap-4 mb-8">
                <SettingsIcon size={28} strokeWidth={1.5} />
                <span className="text-2xl font-bold">Paramètres</span>
            </div>
            <div className="flex items-center gap-4 mb-8">
                <img src="" alt="Profile" className="w-16 h-16 rounded-full" />
                <div>
                    <h1 className="text-2xl font-bold">{formData.firstName} {formData.lastName}</h1>
                    <p className="text-sm text-gray-500">
                        {formData.specializations.length > 0 
                            ? formData.specializations.join(', ')
                            : 'Aucune spécialisation ajoutée'}
                    </p>
                    <p className="text-sm text-gray-500">{addressData.city}, {addressData.zipCode}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Informations personnelles</h2>
                    <Button className="ml-auto" onClick={() => setIsEditModalOpen(true)}>
                        <Pencil size={16} />
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Prénom</p>
                        <p className="text-lg">{formData.firstName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Nom de famille</p>
                        <p className="text-lg">{formData.lastName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-lg">{formData.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="text-lg">{formData.phone}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-gray-500">Spécialisations</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {formData.specializations.length > 0 ? (
                                formData.specializations.map((specialization, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                    >
                                        {specialization}
                                    </span>
                                ))
                            ) : (
                                <p className="text-lg">Aucune spécialisation ajoutée.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Adresse</h2>
                    <Button className="ml-auto" onClick={() => setIsEditAddressModalOpen(true)}>
                        <Pencil size={16} />
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <p className="text-sm text-gray-500">Numéro et rue</p>
                        <p className="text-lg">{addressData.street}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Ville</p>
                        <p className="text-lg">{addressData.city}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Code postal</p>
                        <p className="text-lg">{addressData.zipCode}</p>
                    </div>
                </div>
            </div>

            <EditInformations
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onEdit={handleEditSubmit}
                initialData={formData}
            />

            <EditAddress
                isOpen={isEditAddressModalOpen}
                onClose={() => setIsEditAddressModalOpen(false)}
                onEdit={handleEditAddressSubmit}
                initialData={addressData}
            />
        </div>
    );
}