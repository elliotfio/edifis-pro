import { Settings as SettingsIcon, User2, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Pencil } from 'lucide-react';
import EditInformations from './components/EditInformations';
import EditPassword from './components/EditPassword';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

interface UserData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    date_creation: string;
    roleInfo?: {
        specialites?: string[];
        disponible?: boolean;
        note_moyenne?: number;
        current_worksite?: string;
        years_experience?: number;
    };
}

export default function Settings() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!user?.id) {
                    throw new Error('Utilisateur non connecté');
                }

                // Configure axios with the base URL
                axios.defaults.baseURL = 'http://localhost:3000';

                console.log('Fetching user data...'); // Debug log
                const response = await axios.get<UserData>(`/api/users/${user.id}`);
                console.log('User data received:', response.data); // Debug log

                if (!response.data) {
                    throw new Error('Aucune donnée reçue');
                }

                setUserData(response.data);
            } catch (error: any) {
                console.error('Detailed error:', error); // Debug log
                const errorMessage =
                    error.response?.data?.message || error.message || 'Erreur inconnue';
                setError(`Erreur lors de la récupération des données: ${errorMessage}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user?.id]);

    const handleEditSubmit = async (newData: Partial<UserData>) => {
        try {
            if (!userData?.id) return;

            const updateData = {
                ...newData,
                oldRole: userData.role,
                role: userData.role,
                roleInfo: {
                    ...userData.roleInfo,
                    ...newData.roleInfo,
                },
            };

            console.log('Sending update data:', updateData); // Log the data being sent
            const updateResponse = await axios.put(`/api/users/${userData.id}`, updateData);
            console.log('Update response:', updateResponse.data); // Log the update response

            // Refresh user data after update
            const response = await axios.get<UserData>(`/api/users/${userData.id}`);
            console.log('Refreshed user data:', response.data); // Log the refreshed data
            setUserData(response.data);
        } catch (error: any) {
            console.error('Detailed update error:', error);
            const errorMessage =
                error.response?.data?.message || error.message || 'Erreur inconnue';
            setError(`Erreur lors de la mise à jour: ${errorMessage}`);
        }
    };

    if (isLoading) {
        return <div className="p-6">Chargement...</div>;
    }

    if (error || !userData) {
        return (
            <div className="p-6 text-red-500">{error || 'Erreur de chargement des données'}</div>
        );
    }

    const userInitials = `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    const specializations = userData.roleInfo?.specialites || [];

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <SettingsIcon size={24} strokeWidth={1.7} />
                    <span className="text-xl font-semibold">Paramètres</span>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <p className="text-primary text-xl font-semibold">{userInitials}</p>
                </div>
                <div>
                    <h1 className="text-xl font-bold">
                        {userData.firstName} {userData.lastName}
                    </h1>
                    {(userData.role === 'artisan' || userData.role === 'chef') && (
                        <p className="text-sm text-gray-500">
                            {specializations.length > 0
                                ? specializations.join(', ')
                                : 'Aucune spécialisation ajoutée'}
                        </p>
                    )}
                    {userData.roleInfo?.current_worksite && (
                        <p className="text-sm text-gray-500">
                            Chantier actuel: {userData.roleInfo.current_worksite}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <User2 size={20} strokeWidth={1.7} />
                            <h2 className="text-sm">Informations personnelles</h2>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            <Pencil size={16} />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500">Prénom</p>
                            <p className="text-base font-medium">{userData.firstName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Nom de famille</p>
                            <p className="text-base font-medium">{userData.lastName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-base font-medium">{userData.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Rôle</p>
                            <p className="text-base font-medium capitalize">{userData.role}</p>
                        </div>
                        {userData.role === 'artisan' && (
                            <>
                                <div>
                                    <p className="text-xs text-gray-500">Disponibilité</p>
                                    <p className="text-base font-medium">
                                        {userData.roleInfo?.disponible
                                            ? 'Disponible'
                                            : 'Non disponible'}
                                    </p>
                                </div>
                                {userData.roleInfo?.note_moyenne && (
                                    <div>
                                        <p className="text-xs text-gray-500">Note moyenne</p>
                                        <p className="text-base font-medium">
                                            {userData.roleInfo.note_moyenne.toFixed(1)}/5
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                        {userData.role === 'chef' && userData.roleInfo?.years_experience && (
                            <div>
                                <p className="text-xs text-gray-500">Années d'expérience</p>
                                <p className="text-base font-medium">
                                    {userData.roleInfo.years_experience} ans
                                </p>
                            </div>
                        )}
                        {(userData.role === 'artisan' || userData.role === 'chef') &&
                            specializations.length > 0 && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Spécialisations</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {specializations.map((specialization, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                            >
                                                {specialization}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Lock size={20} strokeWidth={1.7} />
                            <h2 className="text-sm">Mot de passe</h2>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => setIsPasswordModalOpen(true)}
                        >
                            <Pencil size={16} />
                        </Button>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Mot de passe</p>
                        <p className="text-base font-medium">••••••••</p>
                    </div>
                </div>
            </div>

            <EditInformations
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onEdit={handleEditSubmit}
                initialData={userData}
            />

            <EditPassword
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                userId={userData.id}
            />
        </div>
    );
}
