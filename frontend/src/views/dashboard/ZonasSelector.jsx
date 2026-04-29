import { useState, useEffect } from 'react';
import { LayoutGrid, Search, ArrowRight, Loader2, Trophy, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useHeader } from '../../context/HeaderContext';
import Toast from '../../components/Toast';

const ZonasSelector = () => {
    const [torneos, setTorneos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();
    const { setHeader } = useHeader();

    useEffect(() => {
        const fetchTorneos = async () => {
            try {
                const res = await axios.get(`/api/torneos`);
                // Only show tournaments that are open or in progress
                const activeTorneos = res.data.filter(t => t.estado !== 'FINALIZADO');
                setTorneos(activeTorneos);
                setHeader('Gestión de Zonas', 'Seleccioná un torneo para organizar sus grupos y partidos.');
            } catch (err) {
                console.error('Error fetching torneos:', err);
                setToast({ type: 'error', message: 'Error al cargar los torneos' });
            } finally {
                setLoading(false);
            }
        };

        fetchTorneos();
        return () => setHeader('', '');
    }, []);

    const filteredTorneos = torneos.filter(t =>
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Selector Header / Search */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-dark transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar torneo activo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-100 rounded-lg focus:border-brand-dark/20 focus:outline-none focus:ring-4 focus:ring-brand-dark/5 text-sm font-bold transition-all"
                        />
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTorneos.length > 0 ? (
                        filteredTorneos.map(torneo => (
                            <button
                                key={torneo.id}
                                onClick={() => navigate(`/admin/torneos/${torneo.id}/zonas`)}
                                className="flex flex-col text-left bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-dark/20 transition-all group overflow-hidden"
                            >
                                <div className="p-5 space-y-4 flex-1 w-full">
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-10 bg-brand-dark/5 rounded-lg flex items-center justify-center text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-colors">
                                            <Trophy size={20} />
                                        </div>
                                        <span className={`px-2.5 py-1 rounded text-[9px] font-black tracking-widest uppercase border ${
                                            torneo.estado === 'INSCRIPCIONES' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {torneo.estado}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-black text-brand-dark uppercase tracking-tight line-clamp-1">{torneo.nombre}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-gray-400 uppercase">
                                            <Clock size={12} />
                                            {new Date(torneo.fecha).toLocaleDateString('es-AR')}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                        <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest">
                                            {torneo.inscriptos || 0} Inscriptos
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-brand-dark uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            Gestionar <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center">
                            <LayoutGrid size={48} className="mx-auto text-gray-100 mb-4" />
                            <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">No hay torneos activos para gestionar</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZonasSelector;
