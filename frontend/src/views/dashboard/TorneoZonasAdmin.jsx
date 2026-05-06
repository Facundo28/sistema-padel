import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, ChevronLeft, LayoutGrid, CheckCircle, AlertCircle, Loader2, Plus, ArrowRight, Trash2, Edit2, Wand2 } from 'lucide-react';
import axios from 'axios';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import { useHeader } from '../../context/HeaderContext';

const TorneoZonasAdmin = () => {
    const { id } = useParams();
    const [torneo, setTorneo] = useState(null);
    const [inscriptos, setInscriptos] = useState([]);
    const [zonasCache, setZonasCache] = useState([]);
    const [loading, setLoading] = useState(true);
    const [asignando, setAsignando] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeZones, setActiveZones] = useState([]);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const fetchData = async () => {
        try {
            const resT = await axios.get(`/api/torneos`);
            const found = resT.data.find(t => t.id === parseInt(id));
            setTorneo(found);

            const resI = await axios.get(`/api/torneos/${id}/inscriptos`);
            setInscriptos(resI.data);

            const resZ = await axios.get(`/api/torneos/${id}/clasificacion`);
            const dbZones = resZ.data.zonas || [];
            setZonasCache(dbZones);

            const dbZoneNames = dbZones.map(z => z.nombre);
            
            setActiveZones(prev => {
                // Initial load with no zones in DB
                if (isFirstLoad && dbZoneNames.length === 0 && prev.length === 0) {
                    setIsFirstLoad(false);
                    return ['ZONA A', 'ZONA B', 'ZONA C'];
                }
                setIsFirstLoad(false);

                // Keep phantom zones (those created locally but not yet in DB)
                const phantomZones = prev.filter(p => !dbZoneNames.includes(p));
                
                const combined = [...new Set([...dbZoneNames, ...phantomZones])];
                return combined.sort((a, b) => a.localeCompare(b));
            });

            if (found) {
                setHeader(found.nombre, 'Gestión de Zonas y Armado de Partidos');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setToast({ type: 'error', message: 'Error al cargar datos' });
        } finally {
            setLoading(false);
        }
    };

    const { setHeader } = useHeader();

    useEffect(() => {
        fetchData();
        return () => setHeader('', '');
    }, [id]);

    const handleAsignar = async (parejaId, zonaNombre) => {
        if (!parejaId) {
            setToast({ type: 'error', message: 'Este jugador no tiene una pareja vinculada' });
            return;
        }
        setAsignando(true);
        try {
            await axios.post(`/api/torneos/${id}/zonas/asignar-pareja`, {
                pareja_id: parejaId,
                zona_nombre: zonaNombre
            });
            setToast({ 
                type: 'success', 
                message: `Asignado a la ${zonaNombre}` 
            });
            fetchData();
        } catch (err) {
            setToast({ type: 'error', message: err.response?.data?.msg || 'Error al asignar' });
        } finally {
            setAsignando(false);
        }
    };

    const handleGenerarPartidos = async (zonaId, zonaNombre) => {
        setAsignando(true);
        try {
            const res = await axios.post(`/api/torneos/${id}/zonas/${zonaId}/generar-partidos`);
            setToast({ type: 'success', message: res.data.msg });
            fetchData();
        } catch (err) {
            setToast({ type: 'error', message: err.response?.data?.msg || 'Error al generar partidos' });
        } finally {
            setAsignando(false);
        }
    };

    const handleRemover = async (parejaId, zonaId) => {
        if (!parejaId) {
            setToast({ type: 'error', message: 'ID de pareja no encontrado' });
            return;
        }
        if (!window.confirm('¿Estás seguro de quitar a esta pareja de la zona? Se eliminarán los partidos pendientes.')) return;
        setAsignando(true);
        try {
            await axios.delete(`/api/torneos/${id}/zonas/remover-pareja`, {
                data: { pareja_id: parejaId, zona_id: zonaId }
            });
            setToast({ type: 'success', message: 'Pareja removida correctamente' });
            fetchData();
        } catch (err) {
            console.error('Error removing partner:', err);
            setToast({ type: 'error', message: 'Error al remover pareja' });
        } finally {
            setAsignando(false);
        }
    };

    const handleAutoGenerar = async () => {
        if (!window.confirm('¿Estás seguro? Esto eliminará las zonas y partidos actuales para reasignar automáticamente a todas las parejas confirmadas según el cupo.')) return;
        setAsignando(true);
        try {
            const res = await axios.post(`/api/torneos/${id}/zonas/auto-generar`);
            setToast({ type: 'success', message: res.data.msg });
            fetchData();
        } catch (err) {
            setToast({ type: 'error', message: err.response?.data?.msg || 'Error al auto-generar zonas' });
        } finally {
            setAsignando(false);
        }
    };


    // Group inscriptos by pareja_id
    const couples = [];
    const waitingPlayers = [];

    inscriptos.forEach(inc => {
        if (!inc.pareja_id) {
            waitingPlayers.push(inc);
        } else {
            const exists = couples.find(c => c.pareja_id === inc.pareja_id);
            if (!exists) {
                couples.push({
                    pareja_id: inc.pareja_id,
                    player1: `${inc.apellido}, ${inc.nombre}`,
                    player2: `${inc.pareja_apellido}, ${inc.pareja_nombre}`,
                    nivel: inc.nivel
                });
            }
        }
    });

    const isCoupleInAnyZone = (parejaId) => {
        return zonasCache.some(z => z.equipos.some(e => e.pareja_id === parejaId));
    };

    const unassignedCouples = couples.filter(c => !isCoupleInAnyZone(c.pareja_id));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
            </div>
        );
    }

    const addZone = () => {
        const nextLetter = String.fromCharCode(65 + activeZones.length); // A, B, C...
        setActiveZones([...activeZones, `ZONA ${nextLetter}`]);
    };

    const removeZone = async (zName) => {
        const zoneData = zonasCache.find(z => z.nombre === zName);
        
        // If it's a zone that exists in the DB, delete it there first
        if (zoneData) {
            if (zoneData.equipos && zoneData.equipos.length > 0) {
                setToast({ type: 'error', message: 'No se puede eliminar una zona con equipos asignados' });
                return;
            }
            
            try {
                setAsignando(true);
                await axios.delete(`/api/torneos/${id}/zonas/${zoneData.id}`);
                setToast({ type: 'success', message: 'Zona eliminada permanentemente' });
                // We fetch data again to sync everything
                fetchData();
            } catch (err) {
                console.error('Error deleting zone:', err);
                setToast({ type: 'error', message: 'Error al eliminar la zona de la base de datos' });
            } finally {
                setAsignando(false);
            }
        }
        
        // Always update local state
        setActiveZones(activeZones.filter(z => z !== zName));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Unassigned Players */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                                <h2 className="text-sm font-black text-brand-dark tracking-widest uppercase italic flex items-center gap-2">
                                    <Users size={18} /> Inscriptos Confirmados
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {unassignedCouples.length > 0 ? (
                                    unassignedCouples.map((c) => (
                                        <div key={c.pareja_id} className="p-6 hover:bg-gray-50 transition-colors space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-brand-dark uppercase">{c.player1}</p>
                                                    <p className="text-xs font-black text-brand-dark uppercase">{c.player2}</p>
                                                    <span className="text-[10px] font-bold text-brand-gray uppercase block mt-1">{c.nivel}</span>
                                                </div>
                                                <div className="bg-green-50 px-2 py-1 rounded">
                                                    <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter flex items-center gap-1">
                                                        <CheckCircle size={10} /> LISTO
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                                {activeZones.map(zName => (
                                                    <button
                                                        key={zName}
                                                        onClick={() => handleAsignar(c.pareja_id, zName)}
                                                        disabled={asignando}
                                                        className="px-2 py-2 bg-brand-dark/5 text-brand-dark text-[9px] font-black uppercase tracking-tighter rounded border border-gray-100 hover:bg-brand-dark hover:text-white transition-all disabled:opacity-50"
                                                    >
                                                        + {zName}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={addZone}
                                                    className="px-2 py-2 bg-gray-50 text-gray-400 text-[9px] font-black uppercase tracking-tighter rounded border border-dashed border-gray-200 hover:border-brand-dark hover:text-brand-dark transition-all"
                                                >
                                                    <Plus size={10} className="inline mr-1" /> Nueva
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center">
                                        <p className="text-sm text-gray-400 font-medium italic">No hay equipos listos para asignar</p>
                                    </div>
                                )}
                            </div>

                            {/* Waiting Players Section */}
                            {waitingPlayers.length > 0 && (
                                <div className="border-t border-gray-100">
                                    <div className="p-4 bg-amber-50/30">
                                        <h3 className="text-[10px] font-black text-amber-600 tracking-widest uppercase flex items-center gap-2">
                                            <AlertCircle size={12} /> Esperando Pareja ({waitingPlayers.length})
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-50 max-h-[200px] overflow-y-auto custom-scrollbar bg-gray-50/30">
                                        {waitingPlayers.map(p => (
                                            <div key={p.id} className="p-4 flex items-center justify-between">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase">{p.apellido}, {p.nombre}</p>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter bg-white px-2 py-0.5 rounded border border-gray-100">Inscripto</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Zones Display */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black text-brand-dark tracking-widest uppercase italic flex items-center gap-2">
                                <LayoutGrid size={18} /> Distribución de Zonas
                            </h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleAutoGenerar}
                                    disabled={asignando}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-dark to-brand-green text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    <Wand2 size={14} /> Auto-armar Zonas
                                </button>
                                <button 
                                    onClick={addZone}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-black transition-all shadow-lg shadow-black/10"
                                >
                                    <Plus size={14} /> Añadir Zona
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeZones.map(zName => {
                                const zoneData = zonasCache.find(z => z.nombre === zName);
                                const count = zoneData?.equipos?.length || 0;

                                return (
                                    <div key={zName} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-black text-brand-dark tracking-widest uppercase italic">{zName}</h3>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                                    count >= 3 ? 'bg-green-100 text-green-600' : 'bg-brand-dark/5 text-brand-gray'
                                                }`}>
                                                    {count} EQUIPOS
                                                </span>
                                            </div>
                                            {count === 0 && (
                                                <button 
                                                    onClick={() => removeZone(zName)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                    title="Eliminar Zona"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 space-y-3 min-h-[150px]">
                                            {zoneData?.equipos?.map((eq, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                                                    <div className="w-8 h-8 bg-brand-dark text-white text-[10px] font-black rounded flex items-center justify-center">
                                                        {eq.code}
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-[10px] font-black text-brand-dark uppercase truncate leading-tight">{eq.player1}</p>
                                                        <p className="text-[10px] font-black text-brand-dark uppercase truncate leading-tight">{eq.player2}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button 
                                                            onClick={() => handleRemover(eq.pareja_id, zoneData.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                                            title="Remover de Zona"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {/* Dynamic slots: show up to 3 minimum, or 1 extra if 3 or more are filled */}
                                            {[...Array(count < 3 ? 3 - count : 1)].map((_, i) => (
                                                <div key={`empty-${i}`} className="p-3 border border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Espacio Libre</p>
                                                </div>
                                            ))}
                                        </div>
                                        {zoneData?.equipos?.length >= 2 && (!zoneData?.partidos || zoneData.partidos.length === 0) && (
                                            <div className="p-4 bg-brand-dark/5 border-t border-gray-100 text-center">
                                                <button
                                                    onClick={() => handleGenerarPartidos(zoneData.id, zName)}
                                                    disabled={asignando}
                                                    className="w-full py-2 bg-brand-dark text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-black transition-all shadow-md disabled:opacity-50"
                                                >
                                                    Generar Partidos
                                                </button>
                                            </div>
                                        )}
                                        {zoneData?.partidos?.length > 0 && (
                                            <div className="p-4 bg-green-50/50 border-t border-green-100 text-center">
                                                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest flex items-center justify-center gap-2">
                                                    <LayoutGrid size={14} /> {zoneData.partidos.length} Partidos Generados
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 flex gap-4">
                            <AlertCircle className="text-amber-500 flex-shrink-0" size={24} />
                            <div>
                                <p className="text-sm font-black text-amber-900 uppercase italic">Importante: Gestión de Zonas</p>
                                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                    Puedes asignar tantas parejas como necesites a cada zona (ej. 4 o 5). Una vez que la zona esté lista, presiona <strong>"Generar Partidos"</strong> para crear todos los enfrentamientos automáticamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TorneoZonasAdmin;
