import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Swords, Calendar, Clock, Save, Loader2, CheckCircle, AlertCircle, Trash2, Edit2, Play, GitBranch } from 'lucide-react';
import axios from 'axios';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import { useHeader } from '../../context/HeaderContext';

const ClassificationManagement = () => {
    const { id } = useParams();
    const [torneo, setTorneo] = useState(null);
    const [zones, setZones] = useState([]);
    const [playoffs, setPlayoffs] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [editingMatch, setEditingMatch] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const { setHeader } = useHeader();

    const fetchData = async () => {
        try {
            const [resT, resC, resS] = await Promise.all([
                axios.get(`/api/torneos`),
                axios.get(`/api/torneos/${id}/clasificacion`),
                axios.get(`/api/sedes`)
            ]);
            
            const found = resT.data.find(t => t.id === parseInt(id));
            setTorneo(found);

            if (found) {
                setHeader(found.nombre, 'Gestión de Partidos y Resultados');
            }

            setZones(resC.data.zonas || []);
            setPlayoffs(resC.data.playoffs || []);
            setSedes(resS.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setToast({ type: 'error', message: 'Error al cargar datos' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (torneo) {
            const actionButton = (
                <button
                    onClick={handleGenerateBrackets}
                    disabled={generating || zones.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg font-black hover:bg-black transition-colors shadow-sm text-[11px] uppercase tracking-widest disabled:opacity-50"
                >
                    {generating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                    GENERAR LLAVE
                </button>
            );
            setHeader(torneo.nombre, 'Gestión de Partidos y Resultados', actionButton);
        }
        return () => setHeader('', '', null);
    }, [torneo, generating, zones.length]);

    const handleEditMatch = (match, zoneId) => {
        const hasSet3 = match.score?.split(' / ').length === 3;
        setEditingMatch({
            ...match,
            zoneId,
            hasSet3,
            set1_p1: match.score?.split(' / ')[0]?.split('-')[0] || '',
            set1_p2: match.score?.split(' / ')[0]?.split('-')[1] || '',
            set2_p1: match.score?.split(' / ')[1]?.split('-')[0] || '',
            set2_p2: match.score?.split(' / ')[1]?.split('-')[1] || '',
            set3_p1: match.score?.split(' / ')[2]?.split('-')[0] || '',
            set3_p2: match.score?.split(' / ')[2]?.split('-')[1] || '',
            fecha: match.fecha_original ? new Date(match.fecha_original).toISOString().split('T')[0] : '',
            hora: match.fecha_original ? new Date(match.fecha_original).toTimeString().split(' ')[0].substring(0, 5) : '',
            sede_id: match.sede_id || ''
        });
        setIsModalOpen(true);
    };

    const handleUpdateMatch = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Reconstruct fecha_partido string
            let fecha_partido = null;
            if (editingMatch.fecha && editingMatch.hora) {
                fecha_partido = `${editingMatch.fecha} ${editingMatch.hora}:00`;
            }

            const payload = {
                set1_p1: editingMatch.set1_p1 === '' ? null : parseInt(editingMatch.set1_p1),
                set1_p2: editingMatch.set1_p2 === '' ? null : parseInt(editingMatch.set1_p2),
                set2_p1: editingMatch.set2_p1 === '' ? null : parseInt(editingMatch.set2_p1),
                set2_p2: editingMatch.set2_p2 === '' ? null : parseInt(editingMatch.set2_p2),
                set3_p1: (editingMatch.hasSet3 && editingMatch.set3_p1 !== '') ? parseInt(editingMatch.set3_p1) : null,
                set3_p2: (editingMatch.hasSet3 && editingMatch.set3_p2 !== '') ? parseInt(editingMatch.set3_p2) : null,
                estado: editingMatch.estado,
                fecha_partido,
                sede_id: editingMatch.sede_id || null
            };

            await axios.put(`/api/torneos/${id}/partidos/${editingMatch.id}`, payload);
            setToast({ type: 'success', message: 'Partido actualizado correctamente' });
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Error updating match:', err);
            setToast({ type: 'error', message: 'Error al actualizar el partido' });
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateBrackets = async () => {
        if (!window.confirm('¿Estás seguro de generar las llaves finales? Esto mezclará a los clasificados al azar y borrará las llaves anteriores si existen.')) return;
        
        setGenerating(true);
        try {
            const res = await axios.post(`/api/torneos/${id}/playoffs/generate`);
            setToast({ type: 'success', message: res.data.msg });
            fetchData();
        } catch (err) {
            console.error('Error generating brackets:', err);
            setToast({ type: 'error', message: err.response?.data?.msg || 'Error al generar llaves' });
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
            </div>
        );
    }

    const labelClass = "block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 ml-1";
    const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-brand-dark/5 text-sm font-bold text-brand-dark transition-all";

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="grid grid-cols-1 gap-8 mt-4">
                {zones.length > 0 ? zones.map((zone) => (
                    <div key={zone.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <h2 className="text-sm font-black text-brand-dark tracking-widest uppercase flex items-center gap-2">
                                <Swords size={18} /> {zone.nombre}
                            </h2>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest border border-gray-100 px-2 py-0.5 rounded-full">
                                {zone.partidos.length} PARTIDOS
                            </span>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {zone.partidos.map((match) => (
                                <div key={match.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-1">
                                            <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                                                {match.t1_code}
                                            </span>
                                            <span className="text-gray-300 text-[8px] font-black uppercase mt-0.5">VS</span>
                                            <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                                                {match.t2_code}
                                            </span>
                                        </div>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                            match.state === 'JUGADO' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {match.state}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-3 mb-4">
                                        <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-50">
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-brand-dark uppercase truncate w-32">{match.p1_player1}</p>
                                                <p className="text-[10px] font-black text-brand-dark uppercase truncate w-32">{match.p1_player2}</p>
                                            </div>
                                            <div className="flex flex-col items-center justify-center min-w-[60px] bg-white rounded-lg border border-gray-100 p-1.5 shadow-sm">
                                                {match.state === 'JUGADO' ? (
                                                    match.score.split(' / ').map((set, i) => (
                                                        <p key={i} className="text-[11px] font-black text-brand-dark leading-tight">
                                                            {set}
                                                        </p>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] font-black text-gray-300">VS</span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-brand-dark uppercase truncate w-32">{match.p2_player1}</p>
                                                <p className="text-[10px] font-black text-brand-dark uppercase truncate w-32">{match.p2_player2}</p>
                                            </div>
                                        </div>

                                        {match.fecha_original ? (
                                            <div className="flex flex-col gap-1 px-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="text-brand-gray" />
                                                    <span className="text-[9px] font-bold text-brand-gray uppercase italic">
                                                        {new Date(match.fecha_original).toLocaleDateString('es-AR')} - {new Date(match.fecha_original).toTimeString().substring(0, 5)} HS
                                                    </span>
                                                </div>
                                                {match.sede_nombre && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px]">🏟️</span>
                                                        <span className="text-[9px] font-bold text-brand-dark uppercase">{match.sede_nombre}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-1 text-amber-500/50">
                                                <Clock size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest italic">Fecha no definida</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleEditMatch(match, zone.id)}
                                        className="w-full py-2 bg-brand-dark/5 text-brand-dark text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-100 hover:bg-brand-dark hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={12} />
                                        Gestionar Partido
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-20 flex flex-col items-center justify-center text-center">
                        <Swords size={64} className="text-gray-100 mb-6" />
                        <h3 className="text-lg font-black text-brand-dark uppercase tracking-widest mb-2">No hay partidos para gestionar</h3>
                        <p className="text-sm text-gray-400 max-w-sm">Primero debés completar las zonas con 3 parejas para que los partidos se generen automáticamente.</p>
                        <Link to={`/admin/torneos/${id}/zonas`} className="mt-8 text-[10px] font-black text-brand-dark hover:underline uppercase tracking-widest">Ir a Gestión de Zonas</Link>
                    </div>
                )}

                {playoffs.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-12">
                        <div className="px-6 py-4 border-b border-gray-50 bg-brand-dark flex items-center justify-between">
                            <h2 className="text-sm font-black text-white tracking-widest uppercase italic flex items-center gap-2">
                                <GitBranch size={18} /> LLAVE FINAL / PLAYOFFS
                            </h2>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-full">
                                {playoffs.length} PARTIDOS
                            </span>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {playoffs.map((match) => (
                                <div key={match.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-brand-dark opacity-40 uppercase tracking-wider mb-1">{match.fase} - PARTIDO {match.orden_fase + 1}</span>
                                            <div className="flex gap-1">
                                                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                                                    {match.t1_code}
                                                </span>
                                                <span className="text-gray-300 text-[8px] font-black uppercase mt-0.5">VS</span>
                                                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                                                    {match.t2_code}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                            match.state === 'JUGADO' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {match.state}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-3 mb-4">
                                        <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-50">
                                            <div className="text-left w-1/3 min-w-0">
                                                <p className="text-[10px] font-black text-brand-dark uppercase truncate">{match.p1_player1}</p>
                                                <p className="text-[10px] font-black text-brand-dark uppercase truncate">{match.p1_player2}</p>
                                            </div>
                                            <div className="flex flex-col items-center justify-center min-w-[60px] bg-white rounded-lg border border-gray-100 p-1.5 shadow-sm mx-2">
                                                {match.state === 'JUGADO' ? (
                                                    match.score.split(' / ').map((set, i) => (
                                                        <p key={i} className="text-[11px] font-black text-brand-dark leading-tight whitespace-nowrap">
                                                            {set}
                                                        </p>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] font-black text-gray-300">VS</span>
                                                )}
                                            </div>
                                            <div className="text-right w-1/3 min-w-0">
                                                <p className="text-[10px] font-black text-brand-dark uppercase truncate">{match.p2_player1}</p>
                                                <p className="text-[10px] font-black text-brand-dark uppercase truncate">{match.p2_player2}</p>
                                            </div>
                                        </div>

                                        {match.fecha_original ? (
                                            <div className="flex flex-col gap-1 px-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="text-brand-gray" />
                                                    <span className="text-[9px] font-bold text-brand-gray uppercase italic">
                                                        {new Date(match.fecha_original).toLocaleDateString('es-AR')} - {new Date(match.fecha_original).toTimeString().substring(0, 5)} HS
                                                    </span>
                                                </div>
                                                {match.sede_nombre && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px]">🏟️</span>
                                                        <span className="text-[9px] font-bold text-brand-dark uppercase">{match.sede_nombre}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-1 text-amber-500/50">
                                                <Clock size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest italic">Fecha no definida</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleEditMatch(match, null)}
                                        className="w-full py-2 bg-brand-dark/5 text-brand-dark text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-100 hover:bg-brand-dark hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={12} />
                                        Gestionar Partido
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Match Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Programación y Resultado"
            >
                {editingMatch && (
                    <form onSubmit={handleUpdateMatch} className="space-y-8">
                        {/* Header info */}
                        <div className="flex items-center justify-around text-center p-6 bg-brand-dark rounded-xl text-white relative overflow-hidden">
                            <Swords size={100} className="absolute opacity-5 -right-4 -top-4 -rotate-12" />
                            <div className="relative z-10 w-full">
                                <span className="bg-white/10 px-2 py-1 rounded text-[8px] font-black tracking-[0.2em] mb-4 inline-block">ENFRENTAMIENTO</span>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase leading-tight">{editingMatch.p1_player1}</p>
                                        <p className="text-xs font-black uppercase leading-tight">{editingMatch.p1_player2}</p>
                                        <span className="text-[9px] font-black text-red-400 mt-1 block">{editingMatch.p1_localidad} {editingMatch.t1_code && <span className="text-white/20">[{editingMatch.t1_code}]</span>}</span>
                                    </div>
                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-sm font-black shadow-inner">VS</div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase leading-tight">{editingMatch.p2_player1}</p>
                                        <p className="text-xs font-black uppercase leading-tight">{editingMatch.p2_player2}</p>
                                        <span className="text-[9px] font-black text-red-400 mt-1 block">{editingMatch.p2_localidad} {editingMatch.t2_code && <span className="text-white/20">[{editingMatch.t2_code}]</span>}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scheduling Section */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black tracking-widest text-brand-dark uppercase border-b border-gray-50 pb-2">Programación</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelClass}>Fecha</label>
                                    <input
                                        type="date"
                                        value={editingMatch.fecha}
                                        onChange={(e) => setEditingMatch({...editingMatch, fecha: e.target.value})}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Hora</label>
                                    <input
                                        type="time"
                                        value={editingMatch.hora}
                                        onChange={(e) => setEditingMatch({...editingMatch, hora: e.target.value})}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Sede</label>
                                    <select
                                        value={editingMatch.sede_id}
                                        onChange={(e) => setEditingMatch({...editingMatch, sede_id: e.target.value})}
                                        className={inputClass}
                                    >
                                        <option value="">(Sin definir)</option>
                                        {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                <h4 className="text-[10px] font-black tracking-widest text-brand-dark uppercase">Marcador / Resultado</h4>
                                <div className="flex items-center gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setEditingMatch({...editingMatch, hasSet3: !editingMatch.hasSet3})}
                                        className={`text-[9px] font-black uppercase px-2 py-1 rounded border transition-all ${
                                            editingMatch.hasSet3 ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-400 border-gray-200 hover:border-brand-dark hover:text-brand-dark'
                                        }`}
                                    >
                                        {editingMatch.hasSet3 ? '- Quitar 3er Set' : '+ Agregar 3er Set'}
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Estado:</label>
                                        <select
                                            value={editingMatch.estado}
                                            onChange={(e) => setEditingMatch({...editingMatch, estado: e.target.value})}
                                            className="text-[9px] font-black uppercase border border-gray-200 rounded px-2 py-1 bg-white"
                                        >
                                            <option value="PENDIENTE">PENDIENTE</option>
                                            <option value="JUGADO">JUGADO</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[1, 2, 3].map((setNum) => (
                                    (setNum < 3 || editingMatch.hasSet3) && (
                                        <div key={setNum} className="flex items-center gap-8 bg-gray-50/50 p-4 rounded-xl border border-gray-50">
                                            <span className="text-[10px] font-black text-brand-gray uppercase w-12 shrink-0">Set {setNum}</span>
                                            <div className="flex items-center gap-4 flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={editingMatch[`set${setNum}_p1`]}
                                                    onChange={(e) => setEditingMatch({...editingMatch, [`set${setNum}_p1`]: e.target.value})}
                                                    className={`${inputClass} text-center`}
                                                />
                                                <span className="text-gray-300 font-black">-</span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={editingMatch[`set${setNum}_p2`]}
                                                    onChange={(e) => setEditingMatch({...editingMatch, [`set${setNum}_p2`]: e.target.value})}
                                                    className={`${inputClass} text-center`}
                                                />
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-[10px] font-black text-gray-400 hover:text-brand-dark transition-colors uppercase tracking-widest"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-4 bg-brand-dark text-white text-[10px] font-black tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-black/10 flex items-center gap-3 hover:bg-black disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle size={14} />
                                        GUARDAR CAMBIOS
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default ClassificationManagement;
