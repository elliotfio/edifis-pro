import { useEffect, useState } from 'react';
import { Worksite } from '@/types/worksiteType';
import { User } from '@/types/userType';
import {
    ChartColumn,
    LayoutDashboard,
    LucideCalendarArrowUp,
    LucideCalendar,
    TrendingUp,
    UsersRound,
    Wallet,
    PiggyBank,
    Pickaxe,
    HardHat,
    User2,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const COLORS = ['#5D6ABD', '#EBF0FE', '#E7E895'];

const Dashboard = () => {
    const [worksites, setWorksites] = useState<Worksite[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [worksitesResponse, usersResponse] = await Promise.all([
                    fetch('http://localhost:3000/api/worksites'),
                    fetch('http://localhost:3000/api/users')
                ]);

                if (!worksitesResponse.ok || !usersResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [worksitesData, usersData] = await Promise.all([
                    worksitesResponse.json(),
                    usersResponse.json()
                ]);

                setWorksites(worksitesData);
                setUsers(usersData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculer les statistiques des chantiers
    const plannedWorksites = worksites.filter((w) => w.status === 'planned').length;
    const inProgressWorksites = worksites.filter((w) => w.status === 'in_progress').length;
    const completedWorksites = worksites.filter((w) => w.status === 'completed').length;

    const activeWorksites = worksites.filter(w => w.status === 'in_progress' || w.status === 'completed');
    const totalRevenue = Number(activeWorksites.reduce((sum, worksite) => sum + Number(worksite.budget), 0)).toFixed(2);
    const totalCosts = Number(activeWorksites.reduce((sum, worksite) => sum + Number(worksite.cost), 0)).toFixed(2);
    const profit = (Number(totalRevenue) - Number(totalCosts)).toFixed(2);

    // Calculer les statistiques des employés par rôle
    const roleStats = {
        artisan: users.filter(user => user.role === 'artisan').length,
        chef: users.filter(user => user.role === 'chef').length,
        employe: users.filter(user => user.role === 'employe').length
    };

    // Données pour le graphique circulaire
    const employeeData = [
        { name: 'Artisan', value: roleStats.artisan, icon: Pickaxe },
        { name: 'Chef de chantier', value: roleStats.chef, icon: HardHat },
        { name: 'Employé administratif', value: roleStats.employe, icon: User2 }
    ];

    // Données pour le graphique d'évolution
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
        count: worksites.filter((w) => {
            const date = new Date(w.startDate);
            return date.getMonth() === i && date.getFullYear() === 2024;
        }).length,
    }));

    if (isLoading) {
        return <div className="p-6">Chargement...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <LayoutDashboard size={24} strokeWidth={1.7} />
                    <span className="text-xl font-semibold">Dashboard</span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex gap-2 items-center justify-between">
                        <div className="flex gap-2 items-center">
                            <LucideCalendarArrowUp size={20} strokeWidth={1.7} />
                            <h3 className="text-sm">Chantiers planifiés</h3>
                        </div>
                        <div className="flex bg-primary text-white rounded-full px-3 py-[.15rem] text-[.65rem] items-center gap-2">
                            <p>-9.6%</p>
                            <TrendingUp size={14} strokeWidth={1.7} />
                        </div>
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="text-7xl font-bold my-2">{plannedWorksites}</div>
                        <div className="text-xs text-gray-600 mb-4">Sur les 3 prochains mois</div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex gap-2 items-center justify-between">
                        <div className="flex gap-2 items-center">
                            <LucideCalendar size={20} strokeWidth={1.7} />
                            <h3 className="text-sm">Chantiers en cours</h3>
                        </div>
                        <div className="flex bg-primary text-white rounded-full px-3 py-[.15rem] text-[.65rem] items-center gap-2">
                            <p>-9.6%</p>
                            <TrendingUp size={14} strokeWidth={1.7} />
                        </div>
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="text-7xl font-bold my-2">{inProgressWorksites}</div>
                        <div className="text-xs text-gray-600 mb-4">Sur les 3 prochains mois</div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex gap-2 items-center justify-between">
                        <div className="flex items-start gap-2">
                            <LucideCalendarArrowUp size={20} strokeWidth={1.7} />
                            <h3 className="text-sm">Chantiers terminés</h3>
                        </div>
                        <div className="flex bg-primary text-white rounded-full px-3 py-[.15rem] text-[.65rem] items-center gap-2">
                            <p>-9.6%</p>
                            <TrendingUp size={14} strokeWidth={1.7} />
                        </div>
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="text-7xl font-bold my-2">{completedWorksites}</div>
                        <div className="text-xs text-gray-600 mb-4">+65 depuis le 1er Janvier</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                <div className="col-span-3 bg-white rounded-lg border border-gray-400 shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex gap-2">
                        <ChartColumn size={20} />
                        <h3 className="text-sm mb-4">Évolution du nombre de chantier par mois</h3>
                    </div>
                    <div className="h-[30vh]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#E5E7EB"
                                />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} />
                                <YAxis axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip
                                    cursor={false}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        padding: '8px',
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#5D6ABD"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="col-span-2 bg-white rounded-lg border border-gray-400 shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex gap-2">
                        <UsersRound size={20} />
                        <h3 className="text-sm mb-4">Parité des employés</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-[280px] flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={employeeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={75}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={10}
                                        cornerRadius={20}
                                        dataKey="value"
                                    >
                                        {employeeData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ payload }) => {
                                            if (!payload || !payload[0]) return null;
                                            const data = payload[0].payload;
                                            const total = employeeData.reduce(
                                                (sum, item) => sum + item.value,
                                                0
                                            );
                                            const percentage = ((data.value / total) * 100).toFixed(1);

                                            const getIcon = (name: string) => {
                                                switch (name) {
                                                    case 'Artisan':
                                                        return (
                                                            <Pickaxe
                                                                size={18}
                                                                className="text-gray-600"
                                                            />
                                                        );
                                                    case 'Chef de chantier':
                                                        return (
                                                            <HardHat
                                                                size={18}
                                                                className="text-gray-600"
                                                            />
                                                        );
                                                    case 'Employé administratif':
                                                        return (
                                                            <User2
                                                                size={18}
                                                                className="text-gray-600"
                                                            />
                                                        );
                                                    default:
                                                        return null;
                                                }
                                            };

                                            return (
                                                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 min-w-[180px]">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getIcon(data.name)}
                                                        <p className="text-sm font-medium">
                                                            {data.name}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className="flex items-center justify-between p-2 rounded-md mb-2"
                                                        style={{
                                                            backgroundColor:
                                                                COLORS[
                                                                    (payload[0] as any).dataIndex %
                                                                        COLORS.length
                                                                ] + '20',
                                                        }}
                                                    >
                                                        <span className="text-xs text-gray-600">
                                                            Pourcentage
                                                        </span>
                                                        <span className="text-sm font-semibold">
                                                            {percentage}%
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="flex items-center justify-between p-2 rounded-md"
                                                        style={{
                                                            backgroundColor:
                                                                COLORS[
                                                                    (payload[0] as any).dataIndex %
                                                                        COLORS.length
                                                                ] + '20',
                                                        }}
                                                    >
                                                        <span className="text-xs text-gray-600">
                                                            Nombre
                                                        </span>
                                                        <span className="text-sm font-semibold">
                                                            {data.value}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col justify-center gap-8">
                            {employeeData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div
                                        className="w-5 h-5 rounded-full relative"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    >
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white"></div>
                                    </div>
                                    <span className="text-sm">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex gap-2 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wallet size={20} />
                            <h3 className="text-sm">Chiffre d'affaire brut</h3>
                        </div>
                        <div className="flex bg-primary text-white rounded-full px-3 py-[.15rem] text-[.65rem] items-center gap-2">
                            <p>-9.6%</p>
                            <TrendingUp size={14} strokeWidth={1.7} />
                        </div>
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="text-6xl font-bold my-2">
                            {totalRevenue.toLocaleString()}€
                        </div>
                        <div className="text-xs text-gray-600 mb-4">Depuis le 1er Janvier</div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex gap-2 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PiggyBank size={24} strokeWidth={1.7} />
                            <h3 className="text-sm">Bénéfice brut</h3>
                        </div>
                        <div className="flex bg-primary text-white rounded-full px-3 py-[.15rem] text-[.65rem] items-center gap-2">
                            <p>-9.6%</p>
                            <TrendingUp size={14} strokeWidth={1.7} />
                        </div>
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="text-6xl font-bold my-2">{profit.toLocaleString()}€</div>
                        <div className="text-xs text-gray-600 mb-4">Depuis le 1er Janvier</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
