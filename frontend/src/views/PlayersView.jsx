import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Target, Calendar, MapPin, X, Users, Search } from 'lucide-react';

const FLAG_MAP = {
    'Argentina': '🇦🇷',
    'España': '🇪🇸',
    'Brasil': '🇧🇷',
    'Chile': '🇨🇱',
    'Uruguay': '🇺🇾',
    'Paraguay': '🇵🇾',
    'México': '🇲🇽',
    'Italia': '🇮🇹',
    'Francia': '🇫🇷'
};

const getFlag = (pais) => {
    return FLAG_MAP[pais] || '🏳️';
};

const PlayersView = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const res = await axios.get(`/api/jugadores`);
                setPlayers(res.data);
            } catch (err) {
                console.error('Error fetching players:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, []);

    const filteredPlayers = players.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.apodo && p.apodo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.localidad && p.localidad.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-brand-dark min-h-screen text-white pt-24 pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-black tracking-[0.2em] uppercase border border-white/5 inline-block w-fit mb-4">
                            DIRECTORIO DE JUGADORES
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
                            NUESTROS <span className="text-white/40">JUGADORES</span>
                        </h1>
                    </div>
                    
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar jugador o apodo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Players Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredPlayers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredPlayers.map(player => (
                            <div 
                                key={player.dni}
                                onClick={() => navigate(`/jugadores/${player.dni}`)}
                                className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-white/30 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl group-hover:bg-brand-primary/20 transition-all pointer-events-none"></div>
                                
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border-2 border-transparent group-hover:border-white/20 flex-shrink-0 flex items-center justify-center relative z-10 text-xl font-black">
                                    {player.foto_perfil ? (
                                        <img src={`${player.foto_perfil}`} alt={`${player.nombre}`} className="w-full h-full object-cover" />
                                    ) : (
                                        player.apellido.charAt(0)
                                    )}
                                </div>
                                <div className="relative z-10 flex-1 min-w-0">
                                    <h3 className="text-lg font-black italic uppercase leading-tight truncate">
                                        {player.nombre} <br />
                                        <span className="text-white/70">{player.apellido}</span>
                                    </h3>
                                    {player.apodo && (
                                        <div className="mt-1">
                                            <span className="inline-block text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 truncate uppercase tracking-wider font-bold">
                                                "{player.apodo}"
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32">
                        <User size={48} className="mx-auto text-white/20 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No se encontraron jugadores</h3>
                        <p className="text-white/50">Intentá con otra búsqueda u otro apodo.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default PlayersView;
