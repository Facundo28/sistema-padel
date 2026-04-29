import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Target, Calendar, MapPin, ArrowLeft, Users, Trophy } from 'lucide-react';

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

const PlayerDetailView = () => {
    const { dni } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayerData = async () => {
            try {
                const [playerRes, partnerRes] = await Promise.all([
                    axios.get(`/api/jugadores/${dni}`),
                    axios.get(`/api/parejas/detalle/${dni}`)
                ]);
                setPlayer(playerRes.data);
                setPartner(partnerRes.data);
            } catch (err) {
                console.error('Error fetching player data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayerData();
    }, [dni]);

    if (loading) {
        return (
            <div className="bg-brand-dark min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="bg-brand-dark min-h-screen flex flex-col items-center justify-center text-white px-4">
                <Trophy size={64} className="text-white/10 mb-4" />
                <h2 className="text-2xl font-black uppercase italic">Jugador no encontrado</h2>
                <button 
                    onClick={() => navigate('/jugadores')}
                    className="mt-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full transition-all uppercase text-xs font-black"
                >
                    <ArrowLeft size={16} /> Volver al listado
                </button>
            </div>
        );
    }

    return (
        <div className="bg-brand-dark min-h-screen text-white relative overflow-hidden flex flex-col animate-in fade-in duration-500">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] -z-0"></div>
            
            <button 
                onClick={() => navigate('/jugadores')}
                className="absolute top-28 left-8 z-50 flex items-center gap-2 bg-white/5 backdrop-blur-md hover:bg-brand-primary px-5 py-2.5 rounded-full transition-all duration-300 border border-white/10 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="uppercase text-[10px] font-black tracking-widest">VOLVER</span>
            </button>

            <div className="flex-1 flex flex-col md:flex-row items-stretch pt-20 md:pt-0">
                {/* Left Side: Photo */}
                <div className="w-full md:w-1/2 relative bg-gradient-to-b from-transparent to-black/40 flex items-end justify-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                    
                    <div className="w-full h-full max-h-[800px] relative overflow-hidden animate-in slide-in-from-left duration-700">
                        {player.foto_perfil ? (
                            <img 
                                src={`${player.foto_perfil}`} 
                                alt={`${player.nombre} ${player.apellido}`}
                                className="w-full h-full object-contain md:object-cover origin-bottom scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5 border-r border-white/5">
                                <span className="text-[200px] font-black opacity-5 italic select-none">
                                    {player.nombre.charAt(0)}
                                </span>
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-brand-dark to-transparent"></div>
                    </div>
                </div>

                {/* Right Side: Stats */}
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative animate-in slide-in-from-right duration-700">
                    <div className="space-y-8">
                        {/* Name Header */}
                        <div className="relative">
                            <h1 className="text-4xl md:text-6xl font-black italic uppercase leading-[0.85] tracking-tighter text-white">
                                {player.nombre} <br />
                                {player.apellido}
                            </h1>
                            <div className="h-1 w-20 bg-brand-primary mt-4"></div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 max-w-lg">
                            {/* Apodo */}
                            <div>
                                <p className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-2">Apodo</p>
                                <p className="text-2xl font-black italic uppercase text-white leading-tight">
                                    {player.apodo || '-'}
                                </p>
                            </div>

                            {/* Fecha de Nacimiento */}
                            <div>
                                <p className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-2">Fecha de Nacimiento</p>
                                <p className="text-xl md:text-2xl font-black italic text-white uppercase tabular-nums">
                                    {player.fecha_nacimiento ? new Date(player.fecha_nacimiento).toLocaleDateString('es-AR').replace(/\//g, '-') : '-'}
                                </p>
                            </div>

                            {/* Mano de Juego / Brazo Hábil */}
                            <div>
                                <p className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-2">Mano de Juego</p>
                                <p className="text-xl md:text-2xl font-black italic text-white uppercase">
                                    {player.brazo_habil || '-'}
                                </p>
                            </div>

                            {/* Localidad */}
                            <div>
                                <p className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-2">Localidad</p>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-brand-primary" />
                                    <p className="text-xl md:text-2xl font-black italic text-white uppercase">
                                        {player.localidad || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Partner Section */}
                        <div className="max-w-md pt-4">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:bg-white/[0.08] transition-all duration-500">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-all"></div>
                                
                                <p className="text-[10px] font-black tracking-[0.3em] text-brand-primary uppercase mb-3 flex items-center gap-2">
                                    <Users size={14} /> EMPAREJADO/A CON
                                </p>

                                {partner ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-primary/30 bg-gray-900 flex-shrink-0 flex items-center justify-center text-lg font-black text-white/20">
                                            {partner.foto_perfil ? (
                                                <img 
                                                    src={`${partner.foto_perfil}`} 
                                                    alt={partner.nombre} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                partner.apellido.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xl font-black italic uppercase leading-none text-white tracking-widest">
                                                {partner.nombre} {partner.apellido}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-white/40 italic font-medium">Sin pareja activa.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerDetailView;
