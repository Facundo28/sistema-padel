import { useEffect, useState } from 'react';
import { useHeader } from '../../context/HeaderContext';
import axios from 'axios';

const Dashboard = () => {
    const { setHeader } = useHeader();
    const [dashboardStats, setDashboardStats] = useState({
        jugadores: 0,
        torneos: 0,
        ingresos: 0,
        recategorizaciones: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeader('Bienvenido de nuevo, Facundo', 'Resumen de actividad del club.');
        
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/dashboard/stats');
                setDashboardStats({
                    jugadores: res.data.jugadores_registrados || 0,
                    torneos: res.data.torneos_activos || 0,
                    ingresos: res.data.ingresos_totales || 0,
                    recategorizaciones: res.data.recategorizaciones || 0
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        return () => setHeader('', '');
    }, []);

    const stats = [
        { label: 'Jugadores Registrados', value: dashboardStats.jugadores, change: '', icon: '👤' },
        { label: 'Torneos Activos', value: dashboardStats.torneos, change: '', icon: '🏆' },
        { label: 'Ingresos Totales', value: `$${dashboardStats.ingresos.toLocaleString('es-AR')}`, change: '', icon: '💰' },
        { label: 'Recategorizaciones', value: dashboardStats.recategorizaciones, change: '', icon: '📈' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-32 animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl">{stat.icon}</span>
                                {stat.change && (
                                    <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                        {stat.change}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-brand-gray text-[10px] font-black uppercase tracking-widest mt-4">{stat.label}</h3>
                            <p className="text-2xl font-black uppercase text-brand-dark mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                    <h3 className="text-sm font-black uppercase text-brand-dark mb-4">Próximas Reservas</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                                    <th className="pb-3 font-black">Jugador</th>
                                    <th className="pb-3 font-black">Cancha</th>
                                    <th className="pb-3 font-black">Hora</th>
                                    <th className="pb-3 font-black text-right pr-4">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[1, 2, 3].map((_, i) => (
                                    <tr key={i} className="text-sm group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 font-medium text-brand-dark">Juan Perez</td>
                                        <td className="py-4 text-brand-gray">Cancha Central</td>
                                        <td className="py-4 text-brand-gray">18:30 - 20:00</td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-[10px] font-black uppercase tracking-wider">Confirmada</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                    <h3 className="text-sm font-black uppercase text-brand-dark mb-4">Acciones Rápidas</h3>
                    <div className="space-y-3">
                        <button className="w-full py-3 px-4 bg-brand-dark text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-black/90 transition-colors shadow-lg shadow-black/5">
                            Nueva Reserva
                        </button>
                        <button className="w-full py-3 px-4 border border-gray-200 text-brand-dark rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">
                            Registrar Jugador
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
