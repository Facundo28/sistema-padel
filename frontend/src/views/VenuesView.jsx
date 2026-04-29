import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Phone, Search, ChevronRight, Navigation } from 'lucide-react';
import Reveal from '../components/Reveal';

const VenuesView = () => {
    const [venues, setVenues] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            const res = await axios.get(`/api/sedes`);
            setVenues(res.data);
            if (res.data.length > 0) {
                setSelectedVenue(res.data[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching venues:', error);
            setLoading(false);
        }
    };

    const filteredVenues = venues.filter(v =>
        v.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.localidad.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getGoogleMapUrl = (venue) => {
        if (!venue) return '';
        const query = encodeURIComponent(`${venue.nombre} ${venue.direccion} ${venue.localidad}`);
        return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${query}&language=es`;
        // Since I don't have an API Key here, I'll use the "search" URL which often works as an iframe source for basic embedding without key if structured correctly
        // However, the standard "embed/v1" requires it. 
        // For a generic demo without key, we can use the "google.com/maps?q=..." but it might not be a clean embed.
        // Let's use the free search embed which doesn't strictly require key for simple display sometimes, 
        // or better yet, a standard iframe format that google provides for sharing.
    };

    // Alternative embedding without API Key (Free legacy format)
    const getFreeEmbedUrl = (venue) => {
        if (!venue) return '';
        // Prioritize Address and Locality for better detection on maps if name is not a "known place"
        const query = encodeURIComponent(`${venue.direccion}, ${venue.localidad}`);
        return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
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
                        <span className="text-[10px] font-black tracking-[0.4em] text-gray-400 mb-3 block uppercase">Nuestras Instalaciones</span>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">
                            CANCHAS <span className="text-gray-400">OFICIALES</span>
                        </h1>
                    </Reveal>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Venues List */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar sede o ciudad..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-dark/10 focus:bg-white transition-all outline-none shadow-sm"
                            />
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-3xl"></div>
                                ))
                            ) : filteredVenues.length > 0 ? (
                                filteredVenues.map((venue) => (
                                    <button
                                        key={venue.id}
                                        onClick={() => setSelectedVenue(venue)}
                                        className={`w-full text-left p-6 rounded-3xl border transition-all group relative ${selectedVenue?.id === venue.id
                                                ? 'bg-brand-dark border-brand-dark shadow-xl shadow-black/10'
                                                : 'bg-white border-gray-100 hover:border-brand-dark/20 hover:shadow-lg'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h3 className={`text-sm font-black uppercase tracking-tight italic ${selectedVenue?.id === venue.id ? 'text-white' : 'text-brand-dark'
                                                    }`}>
                                                    {venue.nombre}
                                                </h3>
                                                <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedVenue?.id === venue.id ? 'text-gray-400' : 'text-gray-400'
                                                    }`}>
                                                    {venue.localidad}
                                                </p>
                                            </div>
                                            <div className={`p-2 rounded-xl transition-colors ${selectedVenue?.id === venue.id ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-brand-dark group-hover:text-white'
                                                }`}>
                                                <Navigation size={14} />
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={12} className={selectedVenue?.id === venue.id ? 'text-gray-400' : 'text-gray-300'} />
                                                <span className={`text-[10px] font-medium leading-none ${selectedVenue?.id === venue.id ? 'text-gray-300' : 'text-gray-500'
                                                    }`}>
                                                    {venue.direccion}
                                                </span>
                                            </div>
                                            {venue.telefono && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={12} className={selectedVenue?.id === venue.id ? 'text-gray-400' : 'text-gray-300'} />
                                                    <span className={`text-[10px] font-medium leading-none ${selectedVenue?.id === venue.id ? 'text-gray-300' : 'text-gray-500'
                                                        }`}>
                                                        {venue.telefono}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">No se encontraron sedes</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Google Maps */}
                    <div className="lg:col-span-8 sticky top-24">
                        <Reveal>
                            <div className="bg-gray-50 rounded-[2.5rem] p-3 border border-gray-100 shadow-2xl relative group">
                                <div className="absolute -top-4 -right-4 bg-brand-dark text-white p-4 rounded-3xl shadow-xl z-10 hidden md:block group-hover:scale-110 transition-transform">
                                    <MapPin size={24} />
                                </div>
                                <div className="overflow-hidden rounded-[2rem] h-[400px] md:h-[600px] bg-gray-200 relative">
                                    {!selectedVenue && !loading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-100">
                                            <MapPin size={48} className="mb-4 opacity-20" />
                                            <p className="text-sm font-black uppercase tracking-widest">Selecciona una sede para ver su ubicación</p>
                                        </div>
                                    )}
                                    {selectedVenue && (
                                        <iframe
                                            key={selectedVenue.id}
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight="0"
                                            marginWidth="0"
                                            src={getFreeEmbedUrl(selectedVenue)}
                                            style={{ filter: 'grayscale(0.2)' }}
                                            className="transition-all duration-700"
                                        ></iframe>
                                    )}
                                </div>
                            </div>
                        </Reveal>

                        {selectedVenue && (
                            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight italic">{selectedVenue.nombre}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedVenue.direccion}</p>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedVenue.nombre} ${selectedVenue.direccion} ${selectedVenue.localidad}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-brand-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-black/10 flex items-center gap-2"
                                >
                                    Abrir en Google Maps
                                    <ChevronRight size={14} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VenuesView;
