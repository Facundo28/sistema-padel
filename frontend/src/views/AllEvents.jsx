import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Calendar, Swords, Sparkles } from 'lucide-react';
import EventCard from '../components/EventCard';

const AllEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get(`/api/torneos`);
                setEvents(res.data);
            } catch (err) {
                console.error('Error fetching events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleAction = (label, event) => {
        // Handle other actions like 'INFORMACIÓN GENERAL' if needed
        console.log(`Action ${label} for tournament ${event.name}`);
    };

    return (
        <div className="bg-gray-100 animate-in fade-in duration-500 min-h-screen">
            {/* Header Section */}
            <div className="bg-brand-dark text-white py-12 overflow-hidden relative mb-8">
                <div className="absolute top-1/2 right-0 -translate-y-1/2 p-6 opacity-5 pointer-events-none">
                    <Trophy size={250} strokeWidth={1} />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col gap-3">
                        <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-black tracking-[0.2em] uppercase border border-white/5 inline-block w-fit">
                            NUESTRO CALENDARIO
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-tight max-w-4xl">
                            TODOS LOS <span className="text-white/40">EVENTOS</span>
                        </h1>
                        <p className="text-white/60 font-medium max-w-2xl text-base md:text-lg leading-relaxed">
                            Explora todos nuestros torneos y eventos próximos. Participa, compite y sigue la clasificación en tiempo real.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {events.map((event) => (
                            <EventCard key={event.id} onAction={handleAction} event={{
                                id: event.id,
                                name: event.nombre,
                                description: event.descripcion || '',
                                image: event.imagen || 'https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?q=80&w=2028&auto=format&fit=crop',
                                estado: event.estado
                            }} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-brand-gray text-lg font-medium">No hay eventos disponibles en este momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllEvents;
