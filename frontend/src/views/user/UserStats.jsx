import { useState, useEffect } from 'react';
import { Trophy, Target, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { useHeader } from '../../context/HeaderContext';
import { useAuth } from '../../context/AuthContext';

const UserStats = () => {
    const { setHeader } = useHeader();
    const { user } = useAuth();
    
    const [matchStats, setMatchStats] = useState({
        partidos_jugados: 0,
        partidos_ganados: 0,
        partidos_perdidos: 0,
        puntos: 0,
        racha_actual: 0,
        mejor_racha: 0,
    });
    const [recentMatches, setRecentMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setHeader('MIS PARTIDOS', 'Estadísticas de juego y partidos recientes.');
        
        if (user?.dni) {
            fetchStats(user.dni);
        }

        return () => setHeader('', '');
    }, [setHeader, user]);

    const fetchStats = async (dni) => {
        setIsLoading(true);
        setError(null);
        try {
            const [statsRes, matchesRes] = await Promise.all([
                fetch(`/api/estadisticas/${dni}`),
                fetch(`/api/estadisticas/partidos/${dni}`)
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setMatchStats(statsData);
            }
            if (matchesRes.ok) {
                const matchesData = await matchesRes.json();
                setRecentMatches(matchesData);
            }
        } catch (err) {
            console.error('Error fetching statistics:', err);
            setError('Error al cargar las estadísticas. Verifica tu conexión.');
        } finally {
            setIsLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, color = 'text-brand-dark' }) => (
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Icon size={18} className="text-gray-400" />
                </div>
            </div>
            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{label}</p>
            <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Match Statistics */}
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <StatCard icon={Target} label="Jugados" value={matchStats.partidos_jugados || 0} />
                <StatCard icon={Trophy} label="Ganados" value={matchStats.partidos_ganados || 0} color="text-green-500" />
                <StatCard icon={TrendingUp} label="Perdidos" value={matchStats.partidos_perdidos || 0} color="text-red-400" />
                <StatCard icon={Award} label="Puntos" value={matchStats.puntos || 0} />
                <StatCard icon={TrendingUp} label="Racha Actual" value={matchStats.racha_actual || 0} color="text-blue-500" />
                <StatCard icon={Award} label="Mejor Racha" value={matchStats.mejor_racha || 0} color="text-amber-500" />
            </div>

            {/* Recent Matches Table */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50">
                    <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">Últimos Partidos</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="text-left px-6 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Fecha</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Rival</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Score</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Resultado</th>
                                <th className="text-right px-6 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Puntos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-sm font-medium text-slate-400">
                                        Cargando partidos...
                                    </td>
                                </tr>
                            ) : recentMatches.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-sm font-medium text-slate-400">
                                        Aún no hay partidos registrados en tu historial.
                                    </td>
                                </tr>
                            ) : (
                                recentMatches.map((match, index) => (
                                    <tr key={index} className="border-b border-gray-50/50 hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-brand-gray">{match.fecha}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-brand-dark uppercase">{match.rival}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-brand-gray">{match.score}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-black tracking-wider rounded-md ${match.resultado === 'GANADO'
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'bg-red-50 text-red-500'
                                                }`}>
                                                {match.resultado}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right text-sm font-black ${String(match.puntos_obtenidos).includes('+') ? 'text-green-500' : 'text-red-400'
                                            }`}>
                                            {match.puntos_obtenidos}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-gray-50/30 border-t border-gray-50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Mostrando {recentMatches.length} partidos recientes
                    </span>
                </div>
            </div>
        </div>
    );
};

export default UserStats;
