import { Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {Pencil } from 'lucide-react';

export default function Settings() {
    const [formData, setFormData] = useState({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        adresse: '123 Rue de Paris',
        specialisation: 'Electricien',
        telephone: '0123456789'
    });
    const [editableFields, setEditableFields] = useState<{ [key: string]: boolean }>({
        nom: false,
        prenom: false,
        email: false,
        adresse: false,
        telephone: false
    });
    const [selectedSpecialisations, setSelectedSpecialisations] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const toggleEdit = (field: string) => {
        setEditableFields({ ...editableFields, [field]: !editableFields[field] });
    };

    const handleSpecialisationChange = (value: string) => {
        if (!selectedSpecialisations.includes(value)) {
            setSelectedSpecialisations([...selectedSpecialisations, value]);
        }
    };

    const removeSpecialisation = (value: string) => {
        setSelectedSpecialisations(selectedSpecialisations.filter(s => s !== value));
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
                    <h1 className="text-2xl font-bold">Jean Dupont</h1>
                    <p className="text-sm text-gray-500">Menuisier, Electricien</p>
                    <p className="text-sm text-gray-500">Paris, France</p>
                </div>
                <Button className="ml-auto"><Pencil size={16} /></Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Informations personnelles</h2>
                    <Button className="ml-auto"><Pencil size={16} /></Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Prénom</p>
                        <p className="text-lg">Jean</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Nom de famille</p>
                        <p className="text-lg">Dupont</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="text-lg">jean.dupont@example.com</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-lg">0123456789</p>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Adresse</h2>
                    <Button className="ml-auto"><Pencil size={16} /></Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Pays</p>
                        <p className="text-lg">France</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Ville</p>
                        <p className="text-lg">Paris</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Code postal</p>
                        <p className="text-lg">75000</p>
                    </div>
                </div>
            </div>
        </div>
    );
}