import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Trophy, Clock, Info, X } from 'lucide-react';
import Reveal from '../components/Reveal';

const CircuitView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`/api/circuito`);
            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching circuit events:', error);
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        const [y, m, d] = datePart.split('-');
        return `${d}/${m}/${y}`;
    };

    const formatLongDate = (dateStr) => {
        if (!dateStr) return '';
        const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        const [y, m, d] = datePart.split('-');
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const renderDays = () => {
        const totalDays = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        const days = [];

        // Adjusted for Monday start (default is Sunday=0)
        // If Sunday (0), it becomes 6. Otherwise day-1.
        const mondayFirstOffset = firstDay === 0 ? 6 : firstDay - 1;

        // Blanks for prev month days
        for (let i = 0; i < mondayFirstOffset; i++) {
            days.push(<div key={`blank-${i}`} className="h-28 md:h-34 bg-gray-50/50 border border-gray-100/50"></div>);
        }

        // Days of current month
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            // Handle both YYYY-MM-DD and YYYY-MM-DDTHH:mm:ss.sssZ formats
            const dayEvents = events.filter(e => {
                const eventDate = e.fecha.includes('T') ? e.fecha.split('T')[0] : e.fecha;
                return eventDate === dateStr;
            });
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            days.push(
                <div 
                    key={day} 
                    onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
                    className={`h-28 md:h-34 border border-gray-100 p-3 transition-all relative group/day ${
                        isToday ? 'bg-brand-dark/5' : 'bg-white hover:bg-gray-50'
                    } ${dayEvents.length > 0 ? 'cursor-pointer hover:shadow-inner' : ''}`}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-black ${isToday ? 'text-brand-dark underline underline-offset-4' : 'text-gray-400'}`}>
                            {day}
                        </span>
                        {dayEvents.length > 0 && (
                            <span className="text-[8px] font-black text-white uppercase tracking-tighter bg-brand-dark px-1.5 py-0.5 rounded shadow-sm">
                                HAY EVENTO
                            </span>
                        )}
                    </div>
                    
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-1.5rem)]">
                        {dayEvents.map(event => (
                            <button
                                key={event.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEvent(event);
                                }}
                                className={`w-full text-left px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter truncate transition-all hover:scale-[1.02] active:scale-95 ${
                                    event.tipo === 'TORNEO' ? 'bg-brand-dark text-white' :
                                    event.tipo === 'CLINICA' ? 'bg-blue-500 text-white' :
                                    'bg-amber-500 text-white'
                                } shadow-sm`}
                            >
                                {event.titulo}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <div className="min-h-screen bg-white animate-in fade-in duration-500">
            {/* Hero Section */}
            <section className="bg-brand-dark py-14 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('/images/hero-pattern.png')] bg-repeat opacity-20"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <Reveal>
                        <span className="text-[10px] font-black tracking-[0.4em] text-gray-400 mb-3 block uppercase">Circuito Profesional</span>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">
                            CALENDARIO <span className="text-gray-400">2026</span>
                        </h1>
                    </Reveal>
                </div>
            </section>

            {/* Calendar Section - Reducción de padding vertical */}
            <section className="py-6 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-6">
                            <h2 className="text-3xl font-black text-brand-dark italic uppercase tracking-tighter">
                                {monthNames[month]} <span className="text-gray-300 ml-1">{year}</span>
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-100">
                                    <ChevronLeft size={20} className="text-brand-dark" />
                                </button>
                                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-100">
                                    <ChevronRight size={20} className="text-brand-dark" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-brand-dark"></div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Torneos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Clínicas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Social / Otros</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xl shadow-black/[0.03]">
                        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                            {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(day => (
                                <div key={day} className="py-4 text-center text-[10px] font-black text-brand-dark tracking-widest bg-white border-r last:border-r-0 border-gray-100">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 border-l border-t border-gray-100">
                            {renderDays()}
                        </div>
                    </div>
                </div>
            </section>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setSelectedEvent(null)}
                    ></div>
                    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-white/20">
                        {selectedEvent.imagen && (
                            <div className="h-64 relative">
                                <img src={selectedEvent.imagen} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <button 
                                    onClick={() => setSelectedEvent(null)}
                                    className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white backdrop-blur-md"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            selectedEvent.tipo === 'TORNEO' ? 'bg-brand-dark text-white' : 'bg-blue-600 text-white'
                                        }`}>
                                            {selectedEvent.tipo}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
                                        {selectedEvent.titulo}
                                    </h3>
                                </div>
                            </div>
                        )}
                        
                        {!selectedEvent.imagen && (
                            <div className="p-8 pb-0 flex justify-between items-start">
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                        selectedEvent.tipo === 'TORNEO' ? 'bg-brand-dark text-white' : 'bg-blue-600 text-white'
                                    }`}>
                                        {selectedEvent.tipo}
                                    </span>
                                    <h3 className="text-3xl font-black text-brand-dark italic uppercase tracking-tighter mt-4">
                                        {selectedEvent.titulo}
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => setSelectedEvent(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-all text-brand-dark border border-gray-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}

                        <div className="p-8 pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-gray-400">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand-dark shadow-sm">
                                            <CalendarIcon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 leading-none mb-1">Fecha</p>
                                            <p className="text-sm font-bold text-brand-dark uppercase tracking-tight">
                                                {formatLongDate(selectedEvent.fecha)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-400">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand-dark shadow-sm">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 leading-none mb-1">Horario</p>
                                            <p className="text-sm font-bold text-brand-dark uppercase tracking-tight">A definir</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-gray-400">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand-dark shadow-sm">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 leading-none mb-1">Ubicación</p>
                                            <p className="text-sm font-bold text-brand-dark uppercase tracking-tight">Central Padel Club</p>
                                        </div>
                                    </div>
                                    {selectedEvent.torneo_id && (
                                        <div className="flex items-center gap-4 text-gray-400">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand-dark shadow-sm">
                                                <Trophy size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 leading-none mb-1">Competición</p>
                                                <p className="text-sm font-bold text-brand-dark uppercase tracking-tight">Torneo Oficial</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 mb-2">Información Adicional</p>
                                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                    {selectedEvent.descripcion || 'No hay descripción disponible para este evento actualmente. Por favor, contacte con la organización para más detalles.'}
                                </p>
                            </div>

                            <div className="pt-4 flex gap-4">
                                {selectedEvent.torneo_id && (
                                    <button className="flex-1 bg-brand-dark text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-black/10 active:scale-95">
                                        Inscribirse Ahora
                                    </button>
                                )}
                                <button 
                                    onClick={() => setSelectedEvent(null)}
                                    className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-gray-200 active:scale-95 ${selectedEvent.torneo_id ? 'w-1/3 text-gray-400 hover:text-brand-dark hover:bg-gray-50' : 'w-full bg-gray-50 text-brand-dark hover:bg-gray-100'}`}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CircuitView;
