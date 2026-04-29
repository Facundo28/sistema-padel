import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, ChevronLeft, BarChart2, CheckCircle, Loader2, Save, Trophy } from 'lucide-react';
import axios from 'axios';
import Toast from '../../components/Toast';
import { useHeader } from '../../context/HeaderContext';

const PointsManagement = () => {
    const { id } = useParams();
    const [torneo, setTorneo] = useState(null);
    const [couples, setCouples] = useState([]);
    const [selectedCouple, setSelectedCouple] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const { setHeader } = useHeader();

    const fetchData = async () => {
        try {
            const resT = await axios.get(`/api/torneos`);
            const found = resT.data.find(t => t.id === parseInt(id));
            setTorneo(found);

            if (found) {
                setHeader(found.nombre, 'Gestión de Puntos y Estadísticas');
            }

            const resC = await axios.get(`/api/torneos/${id}/clasificacion`);
            // resC.data.zonas is an array of zones, each with "equipos"
            const allCouples = [];
            (resC.data.zonas || []).forEach(zone => {
                zone.equipos.forEach(eq => {
                    allCouples.push({
                        ...eq,
                        zoneName: zone.nombre,
                        zoneId: zone.id
                    });
                });
            });
            
            // Sort by code or name
            allCouples.sort((a, b) => a.code.localeCompare(b.code));
            setCouples(allCouples);

            // If we had a selected couple, update its data from the new fetch
            if (selectedCouple) {
                const updated = allCouples.find(c => c.id === selectedCouple.id);
                if (updated) setSelectedCouple(updated);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setToast({ type: 'error', message: 'Error al cargar datos' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        return () => setHeader('', '');
    }, [id]);

    const handleUpdateStats = async (e) => {
        e.preventDefault();
        if (!selectedCouple) return;
        
        setSaving(true);
        try {
            await axios.put(`/api/torneos/${id}/participantes/${selectedCouple.id}/stats`, selectedCouple);
            setToast({ type: 'success', message: 'Estadísticas actualizadas correctamente' });
            fetchData();
        } catch (err) {
            console.error('Error updating stats:', err);
            setToast({ type: 'error', message: 'Error al actualizar las estadísticas' });
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setSelectedCouple({
            ...selectedCouple,
            [field]: parseInt(value) || 0
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
            </div>
        );
    }

    const statFields = [
        { id: 'pts', label: 'Puntos' },
        { id: 'pj', label: 'PJ' },
        { id: 'pg', label: 'PG' },
        { id: 'pp', label: 'PP' },
        { id: 'sf', label: 'SF' },
        { id: 'sc', label: 'SC' },
        { id: 'ds', label: 'DS' },
        { id: 'gf', label: 'GF' },
        { id: 'gc', label: 'GC' },
        { id: 'dg', label: 'DG' },
        { id: 'stb', label: 'STB' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Couple List */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden sticky top-8">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <h2 className="text-sm font-black text-brand-dark tracking-widest uppercase italic flex items-center gap-2">
                                <Users size={18} /> Parejas en Torneo
                            </h2>
                            <span className="text-[10px] font-black bg-brand-dark text-white px-2 py-0.5 rounded-full">
                                {couples.length}
                            </span>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                            {couples.length > 0 ? (
                                couples.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCouple(c)}
                                        className={`w-full p-5 flex items-center gap-4 hover:bg-gray-50 transition-all text-left border-l-4 ${
                                            selectedCouple?.id === c.id ? 'border-brand-dark bg-gray-50/80 shadow-inner' : 'border-transparent'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${
                                            selectedCouple?.id === c.id ? 'bg-brand-dark text-white' : 'bg-gray-100 text-brand-gray'
                                        }`}>
                                            {c.code}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-black text-brand-dark uppercase truncate leading-tight">{c.player1}</p>
                                            <p className="text-[11px] font-black text-brand-dark uppercase truncate leading-tight">{c.player2}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{c.zoneName}</span>
                                                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                <span className="text-[9px] font-black text-brand-dark uppercase tracking-tighter">{c.pts} PTS</span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-10 text-center">
                                    <p className="text-sm text-gray-400 font-medium italic">No hay parejas asignadas a zonas aún</p>
                                    <Link to={`/admin/torneos/${id}/zonas`} className="text-[10px] font-black text-brand-dark uppercase underline mt-4 block">Ir a Gestión de Zonas</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="lg:col-span-7 xl:col-span-8">
                    {selectedCouple ? (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-300">
                            <div className="p-8 border-b border-gray-50 bg-brand-dark text-white relative">
                                <Trophy className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10" size={80} />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase border border-white/10">
                                            {selectedCouple.code}
                                        </span>
                                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                                            {selectedCouple.zoneName}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase italic tracking-tighter leading-tight">
                                        {selectedCouple.player1} /<br />{selectedCouple.player2}
                                    </h3>
                                </div>
                            </div>
                            
                            <div className="p-8">
                                <form onSubmit={handleUpdateStats} className="space-y-8">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                        {statFields.map(field => (
                                            <div key={field.id} className="space-y-2">
                                                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase ml-1">
                                                    {field.label}
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={selectedCouple[field.id] ?? 0}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-brand-dark/5 text-lg font-black text-brand-dark transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CheckCircle size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Listo para guardar</span>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-8 py-4 bg-brand-dark text-white text-xs font-black tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-black/10 flex items-center gap-3 hover:bg-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    GUARDAR ESTADÍSTICAS
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] bg-white rounded-xl border border-gray-100 border-dashed flex flex-col items-center justify-center p-12 text-center opacity-50">
                            <BarChart2 size={64} className="text-gray-200 mb-6" />
                            <h3 className="text-xl font-black text-brand-dark tracking-tighter uppercase italic mb-2">Seleccioná una pareja</h3>
                            <p className="text-sm font-medium text-gray-400 max-w-xs">
                                Seleccioná una pareja del listado de la izquierda para cargar sus puntos y actualizar sus estadísticas.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PointsManagement;
