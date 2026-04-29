import { useState, useEffect } from 'react';
import { Trophy, Filter, ChevronDown, Plus, Search, MoreVertical, Edit2, Trash2, UserPlus, X } from 'lucide-react';
import axios from 'axios';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import { useHeader } from '../../context/HeaderContext';

const RankingManagement = () => {
    // Filter states
    const [segmento, setSegmento] = useState('LIBRES');
    const [periodo, setPeriodo] = useState('CIRCUITO 2024');
    const [estado, setEstado] = useState('VIGENTE');
    const [categoria, setCategoria] = useState('Caballeros Primera (1ra C)');
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const categorias = [
        'Caballeros Primera (1ra C)',
        'Caballeros Segunda (2da C)',
        'Caballeros Tercera (3ra C)',
        'Caballeros Cuarta (4ta C)',
        'Caballeros Quinta (5ta C)',
        'Caballeros Sexta (6ta C)',
        'Caballeros Septima (7ma C)',
        'Caballeros Octava (8va C)',
        'Caballeros SIN Categorizar (Cab_SC)',
        'Damas Primera (1ra D)',
        'Damas Segunda (2da D)',
        'Damas Tercera (3ra D)',
        'Damas Cuarta (4ta D)',
        'Damas Quinta (5ta D)',
        'Damas Sexta (6ta D)',
        'Damas Septima (7ma D)',
        'Damas Octava (8va D)',
        'Damas SIN Categorizar (Dam_SC)'
    ];

    const segmentos = ['LIBRES', 'MENORES', 'VETERANOS'];
    const periodos = ['CIRCUITO 2023', 'CIRCUITO 2024', 'CIRCUITO 2025', 'CIRCUITO 2026'];
    const estados = ['VIGENTE', 'TODAS', 'NO VIGENTE'];

    // Modal Form State
    const [newPlayer, setNewPlayer] = useState({
        nombre: '',
        apellido: '',
        puntos: '',
        estado: 'VIGENTE',
        segmento: 'LIBRES',
        periodo: 'CIRCUITO 2024',
        categoria: 'Caballeros Primera (1ra C)'
    });

    // Players from database
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch players from API
    const fetchPlayers = async () => {
        try {
            const params = new URLSearchParams();
            if (segmento !== 'TODOS') params.append('segmento', segmento);
            params.append('periodo', periodo);
            if (estado !== 'TODAS') params.append('estado', estado);
            params.append('categoria', categoria);
            if (searchTerm) params.append('search', searchTerm);

            const res = await axios.get(`/api/ranking?${params.toString()}`);
            setPlayers(res.data);
        } catch (err) {
            console.error('Error fetching ranking:', err);
            setToast({ type: 'error', message: 'Error al cargar el ranking' });
        } finally {
            setLoading(false);
        }
    };

    const { setHeader } = useHeader();

    useEffect(() => {
        const actionButton = (
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg font-bold hover:bg-black transition-colors shadow-sm text-sm uppercase tracking-wide"
            >
                <UserPlus size={16} />
                AGREGAR JUGADOR
            </button>
        );
        fetchPlayers();
        setHeader('Ranking Oficial', 'Panel de control y gestión de posiciones.', actionButton);
        return () => setHeader('', '', null);
    }, [segmento, periodo, estado, categoria]);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchPlayers();
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const handleNewPlayerChange = (e) => {
        setNewPlayer({ ...newPlayer, [e.target.name]: e.target.value });
    };

    const handleSavePlayer = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/ranking`, {
                nombre: newPlayer.nombre,
                apellido: newPlayer.apellido,
                categoria: newPlayer.categoria,
                puntos: parseInt(newPlayer.puntos) || 0,
                estado: newPlayer.estado,
                segmento: newPlayer.segmento,
                periodo: newPlayer.periodo
            });
            setIsAddModalOpen(false);
            setToast({ type: 'success', message: '¡Jugador añadido al ranking!' });
            setNewPlayer({
                nombre: '',
                apellido: '',
                puntos: '',
                estado: 'VIGENTE',
                segmento: 'LIBRES',
                periodo: 'CIRCUITO 2024',
                categoria: 'Caballeros Primera (1ra C)'
            });
            fetchPlayers();
        } catch (err) {
            console.error('Error adding player:', err);
            setToast({ type: 'error', message: 'Error al guardar el jugador' });
        }
    };

    const handleDeletePlayer = async (id) => {
        try {
            await axios.delete(`/api/ranking/${id}`);
            setToast({ type: 'success', message: 'Jugador eliminado del ranking' });
            fetchPlayers();
        } catch (err) {
            console.error('Error deleting player:', err);
            setToast({ type: 'error', message: 'Error al eliminar el jugador' });
        }
    };

    const filteredPlayers = players;

    const FilterItem = ({ label, value, options, onChange }) => (
        <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-1">
                {label}
            </label>
            <div className="relative w-full">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-full bg-white border border-gray-100 pl-6 pr-12 py-3 rounded-lg text-[11px] font-black text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/5 transition-all cursor-pointer appearance-none uppercase tracking-wider block"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '1rem'
                    }}
                >
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        </div>
    );

    const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-dark/5 text-sm font-medium transition-all text-brand-dark";
    const labelClass = "block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 ml-1";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Actions & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 rounded-lg border border-gray-100 shadow-sm transition-all">
                <div className="flex flex-wrap items-end gap-4 flex-1 lg:max-w-4xl">
                    <FilterItem label="Segmento" value={segmento} options={['TODOS', ...segmentos]} onChange={setSegmento} />
                    <FilterItem label="Periodo" value={periodo} options={periodos} onChange={setPeriodo} />
                    <FilterItem label="Estado" value={estado} options={estados} onChange={setEstado} />
                    <FilterItem label="Categoría" value={categoria} options={categorias} onChange={setCategoria} />
                </div>

            </div>


            {/* Table Card */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden text-brand-dark">
                {/* Search & Stats Bar */}
                <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/20">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-dark transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar jugador por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 bg-white border border-gray-100 rounded-lg focus:border-brand-dark/20 focus:outline-none focus:ring-4 focus:ring-brand-dark/5 text-sm font-bold transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-brand-dark/5 border border-brand-dark/10 rounded-md">
                            <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">{filteredPlayers.length} JUGADORES</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Pos</th>
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Nombre Completo</th>
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase text-center">Cat</th>
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase text-center">Puntos</th>
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase text-center">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPlayers.length > 0 ? filteredPlayers.map((player, index) => (
                                <tr key={player.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-brand-dark tabular-nums">#{index + 1}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:bg-brand-dark group-hover:text-white transition-colors">
                                                <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-white">{player.apellido?.charAt(0)}</span>
                                            </div>
                                            <span className="text-sm font-bold text-brand-dark">{player.apellido}, {player.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-500 rounded border border-gray-200/50 uppercase">
                                            {player.categoria.split('(')[1]?.replace(')', '') || player.categoria}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-black text-brand-dark tabular-nums">{player.puntos?.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center px-2 py-1 text-[10px] font-black rounded-md border uppercase ${player.estado === 'VIGENTE'
                                                ? 'bg-green-50 text-green-600 border-green-100'
                                                : 'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {player.estado}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-100 rounded-md transition-all">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDeletePlayer(player.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-brand-gray">
                                        No se encontraron jugadores que coincidan con los filtros.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50/30 flex items-center justify-between border-t border-gray-50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mostrando {filteredPlayers.length} registros</span>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1.5 text-[10px] font-black text-gray-300 border border-gray-200 rounded-md cursor-not-allowed uppercase">Ant</button>
                        <button disabled className="px-3 py-1.5 text-[10px] font-black text-gray-300 border border-gray-200 rounded-md cursor-not-allowed uppercase">Sig</button>
                    </div>
                </div>
            </div>

            {/* Add Player Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Nuevo Jugador en Ranking"
            >
                <form onSubmit={handleSavePlayer} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Nombre</label>
                            <input
                                required
                                name="nombre"
                                value={newPlayer.nombre}
                                onChange={handleNewPlayerChange}
                                className={inputClass}
                                placeholder="Ej: Juan"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Apellido</label>
                            <input
                                required
                                name="apellido"
                                value={newPlayer.apellido}
                                onChange={handleNewPlayerChange}
                                className={inputClass}
                                placeholder="Ej: Perez"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Puntos Iniciales</label>
                            <input
                                required
                                type="number"
                                name="puntos"
                                value={newPlayer.puntos}
                                onChange={handleNewPlayerChange}
                                className={inputClass}
                                placeholder="Ej: 1500"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Estado</label>
                            <select
                                name="estado"
                                value={newPlayer.estado}
                                onChange={handleNewPlayerChange}
                                className={inputClass}
                            >
                                <option value="VIGENTE">VIGENTE</option>
                                <option value="NO VIGENTE">NO VIGENTE</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-brand-dark">
                            <div>
                                <label className={labelClass}>Segmento</label>
                                <select
                                    name="segmento"
                                    value={newPlayer.segmento}
                                    onChange={handleNewPlayerChange}
                                    className={inputClass}
                                >
                                    {segmentos.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Periodo</label>
                                <select
                                    name="periodo"
                                    value={newPlayer.periodo}
                                    onChange={handleNewPlayerChange}
                                    className={inputClass}
                                >
                                    {periodos.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Categoría</label>
                                <select
                                    name="categoria"
                                    value={newPlayer.categoria}
                                    onChange={handleNewPlayerChange}
                                    className={inputClass}
                                >
                                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-6 py-3 text-[11px] font-black tracking-widest text-gray-400 hover:text-brand-dark transition-colors uppercase"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-brand-dark text-white text-[11px] font-black tracking-widest rounded-lg hover:bg-black transition-all shadow-lg shadow-black/10 uppercase"
                        >
                            Guardar Jugador
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RankingManagement;
