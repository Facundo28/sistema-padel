import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, ChevronLeft, Calendar, MapPin, Users, Info, DollarSign, Target, Swords, Map } from 'lucide-react';
import axios from 'axios';

const TournamentInfo = () => {
    const { id } = useParams();
    const [torneo, setTorneo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`/api/torneos`);
                const found = res.data.find(t => t.id === parseInt(id));
                setTorneo(found);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!torneo) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-black text-brand-dark mb-4">Torneo no encontrado</h1>
                <Link to="/eventos" className="text-brand-gray hover:text-brand-dark font-bold underline transition-colors">
                    Volver a Eventos
                </Link>
            </div>
        );
    }

    const dataCards = [
        { label: 'Costo de Inscripción', value: torneo.costo_inscripcion, icon: DollarSign, color: 'text-green-500' },
        { label: 'Localidad', value: torneo.localidad, icon: Map, color: 'text-blue-500' },
        { label: 'Ubicación / Club', value: torneo.ubicacion, icon: MapPin, color: 'text-red-500' },
        { label: 'Modalidad', value: torneo.modalidad, icon: Target, color: 'text-purple-500' },
        { label: 'Categoría', value: torneo.categoria, icon: Users, color: 'text-amber-500' },
        { label: 'Sistema de Competencia', value: torneo.sistema_competencia, icon: Swords, color: 'text-brand-dark' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-brand-dark text-white py-20 overflow-hidden relative">
                <div className="absolute top-1/2 right-0 -translate-y-1/2 p-10 opacity-5 pointer-events-none">
                    <Trophy size={400} strokeWidth={1} />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div>
                            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-black tracking-[0.2em] uppercase border border-white/5 mb-4 inline-block">
                                INFORMACIÓN GENERAL
                            </span>
                            <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-tight max-w-4xl">
                                {torneo.nombre}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-lg shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Info className="text-brand-dark" size={24} />
                                    <h2 className="text-xl font-black text-brand-dark tracking-tighter uppercase italic">Detalles del Evento</h2>
                                </div>
                                <span className={`px-4 py-2 border rounded-md text-[10px] font-black tracking-widest uppercase ${
                                    torneo.estado === 'INSCRIPCIONES' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                    torneo.estado === 'EN CURSO' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                    'bg-gray-50 border-gray-100 text-gray-500'
                                }`}>
                                    {torneo.estado}
                                </span>
                            </div>
                            <div className="p-8">
                                <p className="text-gray-600 text-lg font-medium leading-relaxed italic border-l-4 border-brand-dark pl-6">
                                    {torneo.descripcion || 'No hay una descripción detallada para este torneo.'}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                                    {dataCards.map((card, idx) => (
                                        <div key={idx} className="bg-gray-50/50 rounded-md p-6 border border-gray-50 hover:border-brand-dark/10 transition-all group">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-md bg-white shadow-sm transition-transform group-hover:scale-110 ${card.color}`}>
                                                    <card.icon size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                                                    <p className="text-sm font-black text-brand-dark uppercase">
                                                        {card.value || 'No especificado'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Additional dynamic info if needed could go here */}
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {torneo.imagen && (
                            <div className="bg-white rounded-lg shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
                                <img src={torneo.imagen} alt={torneo.nombre} className="w-full h-auto object-cover aspect-video" />
                            </div>
                        )}

                        <div className="bg-brand-dark rounded-lg shadow-xl p-8 text-white relative overflow-hidden">
                            <Trophy className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none" size={160} />
                            <h3 className="text-2xl font-black tracking-tighter uppercase italic mb-6">Próximas fechas</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-md p-4">
                                    <div className="w-12 h-12 rounded-md bg-white/10 flex flex-col items-center justify-center font-black">
                                        <span className="text-[10px] text-white/60 leading-none">MAR</span>
                                        <span className="text-lg leading-none">28</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-white/40">Iniciativa</p>
                                        <p className="font-black italic uppercase leading-tight">Lanzamiento Oficial</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-md p-4">
                                    <div className="w-12 h-12 rounded-md bg-white/10 flex flex-col items-center justify-center font-black">
                                        <span className="text-[10px] text-white/60 leading-none">ABR</span>
                                        <span className="text-lg leading-none">05</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-white/40">Competencia</p>
                                        <p className="font-black italic uppercase leading-tight">Inicio de Rondas</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-8 py-4 bg-white text-brand-dark font-black tracking-widest text-sm rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl uppercase">
                                INSCRIBIRME AHORA
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentInfo;
