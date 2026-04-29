import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, BarChart2, ChevronRight, Trophy, Info, GitBranch, PlayCircle } from 'lucide-react';
import Reveal from './Reveal';

const CurrentEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const actions = [
        { label: 'INFORMACIÓN', icon: Info, color: 'text-blue-500' },
        { label: 'CLASIFICACIÓN', icon: BarChart2, color: 'text-brand-dark', primary: true },
        { label: 'LLAVE FINAL', icon: GitBranch, color: 'text-purple-500' },
        { label: 'PARTIDOS', icon: PlayCircle, color: 'text-amber-500' },
    ];

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get(`/api/torneos`);
                const current = Array.isArray(res.data) ? res.data.filter(e => 
                    e.estado === 'EN CURSO' || e.estado === 'INSCRIPCIONES'
                ) : [];
                setEvents(current);
            } catch (err) {
                console.error('Error fetching current events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <section className="py-24 bg-brand-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 mb-2 block uppercase">Nuestro Calendario</span>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">EVENTOS ACTIVOS</h2>
                    </div>
                    <Link
                        to="/eventos"
                        className="text-sm font-black tracking-widest text-white hover:text-gray-300 transition-colors pb-1 border-b-2 border-white"
                    >
                        VER TODOS LOS EVENTOS
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : events.length > 0 ? (
                    <div className="space-y-4">
                        {events.map((event, index) => (
                            <Reveal key={event.id} delay={index * 100} threshold={0.05}>
                                <div 
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-2 flex flex-col xl:flex-row xl:items-center gap-6 group"
                                >
                                    {/* Event Image/Badge */}
                                    <div className="w-full xl:w-32 h-32 xl:h-24 rounded-xl overflow-hidden bg-gray-100 relative shrink-0">
                                        {event.imagen ? (
                                            <img src={event.imagen} alt={event.nombre} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Trophy size={24} />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase text-white ${
                                                event.estado === 'INSCRIPCIONES' ? 'bg-blue-600' : 'bg-amber-600'
                                            }`}>
                                                {event.estado}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Event Info */}
                                    <div className="flex-1 px-4 xl:px-0">
                                        <h3 className="text-xl font-black text-brand-dark tracking-tight uppercase italic">{event.nombre}</h3>
                                    </div>

                                    {/* Actions Grid */}
                                    <div className="p-4 xl:p-6 border-t xl:border-t-0 xl:border-l border-gray-50 shrink-0">
                                        <div className="grid grid-cols-2 md:grid-cols-4 xl:flex xl:items-center gap-2">
                                            {actions.map((action) => (
                                                <button 
                                                    key={action.label}
                                                    onClick={() => {
                                                        if (action.label === 'CLASIFICACIÓN') {
                                                            navigate(`/torneos/${event.id}/clasificacion`);
                                                        } else if (action.label === 'LLAVE FINAL') {
                                                            navigate(`/torneos/${event.id}/llave`);
                                                        } else if (action.label === 'INFORMACIÓN') {
                                                            navigate(`/torneos/${event.id}/info`);
                                                        }
                                                    }}
                                                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                        action.primary 
                                                        ? 'bg-brand-dark text-white shadow-lg shadow-black/5 hover:bg-black' 
                                                        : 'bg-gray-50 text-brand-dark border border-gray-100 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <action.icon size={14} className={action.primary ? 'text-white/50' : action.color} />
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <Trophy size={48} className="mx-auto text-white/20 mb-4" />
                        <p className="text-white text-lg font-medium">No hay torneos activos en este momento.</p>
                        <p className="text-white/60 text-sm mt-1">Vuelve pronto para ver nuevas inscripciones.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CurrentEvents;
