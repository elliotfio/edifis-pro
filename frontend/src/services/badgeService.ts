export const getLabelStatus = (status: string) => {
    switch (status) {
        case 'no_attributed':
            return 'Non attribué';
        case 'attributed':
            return 'Attribué';
        case 'planned':
            return 'Plannifié';
        case 'in_progress':
            return 'En cours';
        case 'completed':
            return 'Terminé';
        case 'archived':
            return 'Archivé';
        case 'cancelled':
            return 'Annulé';
        case 'blocked':
            return 'Bloqué';
        default:
            return status;
    }
};

export const getColorStatus = (status: string) => {
    switch (status) {
        case 'no_attributed':
            return 'bg-gray-100 text-gray-800';
        case 'attributed':
            return 'bg-blue-100 text-blue-800';
        case 'planned':
            return 'bg-orange-100 text-orange-800';
        case 'in_progress':
            return 'bg-green-100 text-green-800';
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'archived':
            return 'bg-red-100 text-red-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        case 'blocked':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
        case 'admin':
            return 'bg-purple-100 text-purple-800';
        case 'chef':
            return 'bg-blue-100 text-blue-800';
        case 'artisan':
            return 'bg-green-100 text-green-800';
        case 'employe':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const formatRole = (role: string) => {
    switch (role.toLowerCase()) {
        case 'admin':
            return 'Admin';
        case 'chef':
            return 'Chef de chantier';
        case 'artisan':
            return 'Artisan';
        case 'employe':
            return 'Employé';
        default:
            return role.charAt(0).toUpperCase() + role.slice(1);
    }
};
