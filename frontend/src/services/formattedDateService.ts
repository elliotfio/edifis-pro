export const formatDateToDDMMYYYY = (date: string): string => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
};

export const getTimeAgo = (date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return "à l'instant";
    }

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) {
        return `il y a ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `il y a ${hours} ${hours === 1 ? 'heure' : 'heures'}`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `il y a ${days} ${days === 1 ? 'jour' : 'jours'}`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
        return `il y a ${weeks} ${weeks === 1 ? 'semaine' : 'semaines'}`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `il y a ${months} ${months === 1 ? 'mois' : 'mois'}`;
    }

    const years = Math.floor(days / 365);
    return `il y a ${years} ${years === 1 ? 'an' : 'ans'}`;
};