import { useState, useEffect } from 'react';
import { Plus, Trash2, X, AlertCircle, Save, User as UserIcon, Activity, Search } from 'lucide-react';
import { useHeader } from '../../context/HeaderContext';

const PlayerStatsManagement = () => {
    const { setHeader } = useHeader();
    const [jugadores, setJugadores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDni, setSelectedDni] = useState('');
    
    // Estadísticas
    const [stats, setStats] = useState({
        partidos_jugados: 0,
        partidos_ganados: 0,
        partidos_perdidos: 0,
        puntos: 0,
        racha_actual: 0,
        mejor_racha: 0
    });
    
    // Partidos Recientes
    const [partidos, setPartidos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [partidoForm, setPartidoForm] = useState({
        fecha: '',
        rival: '',
        resultado: 'GANADO',
        score: '',
        puntos_obtenidos: ''
    });

    const [isSubmittingStats, setIsSubmittingStats] = useState(false);
    const [isSubmittingPartido, setIsSubmittingPartido] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        setHeader('Gestión de Estadísticas', 'Administra los números y partidos recientes de los jugadores');
        fetchJugadores();
        return () => setHeader('', '');
    }, [setHeader]);

    const fetchJugadores = async () => {
        try {
            const response = await fetch(`/api/jugadores`);
            if (response.ok) {
                const data = await response.json();
                setJugadores(data);
            }
        } catch (error) {
            console.error('Error fetching jugadores:', error);
            setError('Error al cargar la lista de jugadores');
        }
    };

    const fetchPlayerStats = async (dni) => {
        try {
            const response = await fetch(`/api/estadisticas/${dni}`);
            if (response.ok) {
                const data = await response.json();
                setStats({
                    partidos_jugados: data.partidos_jugados || 0,
                    partidos_ganados: data.partidos_ganados || 0,
                    partidos_perdidos: data.partidos_perdidos || 0,
                    puntos: data.puntos || 0,
                    racha_actual: data.racha_actual || 0,
                    mejor_racha: data.mejor_racha || 0
                });
            }
        } catch (error) {
            console.error('Error fetching player stats:', error);
            setError('Error al cargar las estadísticas del jugador');
        }
    };

    const fetchPlayerPartidos = async (dni) => {
        try {
            const response = await fetch(`/api/estadisticas/partidos/${dni}`);
            if (response.ok) {
                const data = await response.json();
                setPartidos(data);
            }
        } catch (error) {
            console.error('Error fetching player matches:', error);
            setError('Error al cargar los partidos del jugador');
        }
    };

    const handlePlayerSelect = (dni) => {
        setSelectedDni(dni);
        setError(null);
        setSuccessMsg('');
        if (dni) {
            fetchPlayerStats(dni);
            fetchPlayerPartidos(dni);
        } else {
            setStats({ partidos_jugados: 0, partidos_ganados: 0, partidos_perdidos: 0, puntos: 0, racha_actual: 0, mejor_racha: 0 });
            setPartidos([]);
        }
    };

    const filteredJugadores = jugadores.filter(jugador => {
        const query = searchTerm.toLowerCase();
        return (
            jugador.nombre.toLowerCase().includes(query) ||
            jugador.apellido.toLowerCase().includes(query) ||
            jugador.dni.includes(query)
        );
    });

    const handleStatChange = (e) => {
        const { name, value } = e.target;
        setStats(prev => ({
            ...prev,
            [name]: value === '' ? '' : Number(value)
        }));
    };

    const handleSaveStats = async () => {
        if (!selectedDni) return;
        setIsSubmittingStats(true);
        setError(null);
        setSuccessMsg('');
        try {
            const response = await fetch(`/api/estadisticas/${selectedDni}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stats)
            });
            if (response.ok) {
                setSuccessMsg('Estadísticas globales actualizadas correctamente');
            } else {
                setError('Error al guardar las estadísticas');
            }
        } catch (error) {
            setError('Error de conexión al guardar estadísticas');
        } finally {
            setIsSubmittingStats(false);
        }
    };

    const handlePartidoInputChange = (e) => {
        const { name, value } = e.target;
        setPartidoForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddPartido = async (e) => {
        e.preventDefault();
        if (!selectedDni) return;
        setIsSubmittingPartido(true);
        setError(null);
        try {
            const payload = { ...partidoForm, usuario_dni: selectedDni };
            const response = await fetch(`/api/estadisticas/partidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                await fetchPlayerPartidos(selectedDni);
                setIsModalOpen(false);
                setPartidoForm({ fecha: '', rival: '', resultado: 'GANADO', score: '', puntos_obtenidos: '' });
                setSuccessMsg('Partido agregado correctamente');
            } else {
                const data = await response.json();
                setError(data.message || 'Error al guardar el partido');
            }
        } catch (error) {
            setError('Error de conexión al guardar partido');
        } finally {
            setIsSubmittingPartido(false);
        }
    };

    const handleDeletePartido = async (id) => {
        if (window.confirm('¿Eliminar este partido del historial?')) {
            try {
                const response = await fetch(`/api/estadisticas/partidos/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    await fetchPlayerPartidos(selectedDni);
                    setSuccessMsg('Partido eliminado');
                } else {
                    setError('Error al eliminar el partido');
                }
            } catch (error) {
                setError('Error de conexión');
            }
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}
            
            {successMsg && (
                <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-3 border border-green-100 transition-opacity">
                    <Activity size={20} />
                    <p className="text-sm font-medium">{successMsg}</p>
                </div>
            )}

            {/* SELECCIÓN DE JUGADOR BUSCABLE */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        Seleccionar Jugador a Editar
                    </label>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, apellido o DNI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {filteredJugadores.length === 0 ? (
                        <div className="col-span-full py-8 text-center text-slate-400 text-sm font-medium">
                            No se encontraron jugadores que coincidan con la búsqueda.
                        </div>
                    ) : (
                        filteredJugadores.map((jugador) => {
                            const isSelected = selectedDni === jugador.dni;
                            return (
                                <div
                                    key={jugador.dni}
                                    onClick={() => handlePlayerSelect(isSelected ? '' : jugador.dni)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                                        isSelected 
                                        ? 'border-brand-dark bg-brand-dark text-white shadow-md shadow-brand-dark/20' 
                                        : 'border-slate-200 bg-slate-50 hover:border-brand-dark/30 hover:bg-white text-slate-600'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                                        isSelected ? 'bg-white/20 text-white' : 'bg-brand-dark/10 text-brand-dark'
                                    }`}>
                                        {jugador.nombre.charAt(0)}{jugador.apellido.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm uppercase">{jugador.apellido}, {jugador.nombre}</p>
                                        <p className={`text-[10px] font-black tracking-widest uppercase ${
                                            isSelected ? 'text-white/70' : 'text-slate-400'
                                        }`}>DNI: {jugador.dni}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {selectedDni && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* ESTADÍSTICAS GLOBALES */}
                    <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider flex items-center gap-2">
                                <Activity size={18} />
                                ESTADÍSTICAS GLOBALES
                            </h3>
                        </div>
                        <div className="p-5 space-y-4 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">P. Jugados</label>
                                    <input type="number" name="partidos_jugados" value={stats.partidos_jugados} onChange={handleStatChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-dark/20" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 text-green-600">P. Ganados</label>
                                    <input type="number" name="partidos_ganados" value={stats.partidos_ganados} onChange={handleStatChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-green-500/20" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 text-red-500">P. Perdidos</label>
                                    <input type="number" name="partidos_perdidos" value={stats.partidos_perdidos} onChange={handleStatChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-red-500/20" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Puntos</label>
                                    <input type="number" name="puntos" value={stats.puntos} onChange={handleStatChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-dark/20" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Racha Actual</label>
                                    <input type="number" name="racha_actual" value={stats.racha_actual} onChange={handleStatChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-dark/20" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-amber-500 uppercase mb-2">Mejor Racha</label>
                                    <input type="number" name="mejor_racha" value={stats.mejor_racha} onChange={handleStatChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-amber-500/20" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
                            <button onClick={handleSaveStats} disabled={isSubmittingStats}
                                className="w-full bg-brand-dark text-white px-5 py-3 rounded-xl font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md shadow-brand-dark/20 disabled:opacity-50">
                                <Save size={16} />
                                {isSubmittingStats ? 'GUARDANDO...' : 'GUARDAR ESTADÍSTICAS'}
                            </button>
                        </div>
                    </div>

                    {/* PARTIDOS RECIENTES */}
                    <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">Historial de Partidos</h3>
                            <button onClick={() => setIsModalOpen(true)}
                                className="bg-brand-dark text-white px-4 py-2 rounded-lg font-black text-[10px] tracking-wider uppercase flex items-center gap-2 hover:bg-black transition-all shadow-md shadow-brand-dark/20 hover:-translate-y-0.5">
                                <Plus size={14} /> AGREGAR PARTIDO
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-slate-100">
                                        <th className="p-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Fecha</th>
                                        <th className="p-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Rival</th>
                                        <th className="p-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Score</th>
                                        <th className="p-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Res</th>
                                        <th className="p-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Pts</th>
                                        <th className="p-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {partidos.length === 0 ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-slate-400 text-sm">No hay partidos registrados</td></tr>
                                    ) : (
                                        partidos.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 text-xs font-medium text-slate-500">{p.fecha}</td>
                                                <td className="p-4 text-xs font-bold text-slate-700 uppercase">{p.rival}</td>
                                                <td className="p-4 text-xs font-medium text-slate-500">{p.score}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-[9px] font-black tracking-wider rounded-md ${
                                                        p.resultado === 'GANADO' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                                                    }`}>
                                                        {p.resultado}
                                                    </span>
                                                </td>
                                                <td className={`p-4 text-xs font-black ${String(p.puntos_obtenidos).includes('+') ? 'text-green-500' : 'text-red-400'}`}>
                                                    {p.puntos_obtenidos}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => handleDeletePartido(p.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL NUEVO PARTIDO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">Cargar Partido</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-brand-dark hover:bg-white rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAddPartido} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Fecha (Ej: 15/03/2025)</label>
                                <input type="text" name="fecha" value={partidoForm.fecha} onChange={handlePartidoInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-dark/20" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Rival (Ej: Perez / Gomez)</label>
                                <input type="text" name="rival" value={partidoForm.rival} onChange={handlePartidoInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-dark/20" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Score</label>
                                    <input type="text" name="score" value={partidoForm.score} onChange={handlePartidoInputChange} placeholder="6-3 / 6-4"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-dark/20" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Puntos Obtenidos</label>
                                    <input type="text" name="puntos_obtenidos" value={partidoForm.puntos_obtenidos} onChange={handlePartidoInputChange} placeholder="+25"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-dark/20" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Resultado</label>
                                <select name="resultado" value={partidoForm.resultado} onChange={handlePartidoInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-dark/20">
                                    <option value="GANADO">GANADO</option>
                                    <option value="PERDIDO">PERDIDO</option>
                                </select>
                            </div>
                            <div className="pt-4">
                                <button type="submit" disabled={isSubmittingPartido}
                                    className="w-full bg-brand-dark text-white px-6 py-3 rounded-xl font-black text-xs tracking-wider uppercase hover:bg-black transition-all shadow-md shadow-brand-dark/20 disabled:opacity-50">
                                    {isSubmittingPartido ? 'GUARDANDO...' : 'AGREGAR AL HISTORIAL'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerStatsManagement;
