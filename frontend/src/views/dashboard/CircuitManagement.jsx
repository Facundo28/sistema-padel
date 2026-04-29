import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Plus, Trash2, Edit2, Info, Check, X, Trophy, MapPin, Type } from 'lucide-react';
import { useHeader } from '../../context/HeaderContext';
import Toast from '../../components/Toast';

const CircuitManagement = () => {
    const { setHeader } = useHeader();
    const [events, setEvents] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fecha: '',
        tipo: 'TORNEO',
        torneo_id: '',
        imagen: ''
    });
    const [toast, setToast] = useState({ open: false, msg: '', type: 'success' });

    useEffect(() => {
        const actionButton = (
            <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg font-black hover:bg-black transition-colors shadow-sm text-[11px] uppercase tracking-widest"
            >
                <Plus size={16} />
                AGREGAR EVENTO
            </button>
        );
        setHeader(
            'Gestión del Calendario',
            'Administra los eventos del circuito 2026',
            actionButton
        );
        fetchData();
        return () => setHeader('', '', null);
    }, []);

    const fetchData = async () => {
        try {
            const [eventsRes, tournamentsRes] = await Promise.all([
                axios.get(`/api/circuito`),
                axios.get(`/api/torneos`)
            ]);
            setEvents(eventsRes.data);
            setTournaments(tournamentsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('Error al cargar datos', 'error');
            setLoading(false);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ open: true, msg, type });
    };

    const handleOpenModal = (event = null) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                titulo: event.titulo,
                descripcion: event.descripcion || '',
                fecha: event.fecha.split('T')[0],
                tipo: event.tipo,
                torneo_id: event.torneo_id || '',
                imagen: event.imagen || ''
            });
        } else {
            setEditingEvent(null);
            setFormData({
                titulo: '',
                descripcion: '',
                fecha: '',
                tipo: 'TORNEO',
                torneo_id: '',
                imagen: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                await axios.put(`/api/circuito/${editingEvent.id}`, formData);
                showToast('Evento actualizado correctamente');
            } else {
                await axios.post(`/api/circuito`, formData);
                showToast('Evento creado correctamente');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving event:', error);
            showToast('Error al guardar el evento', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
            try {
                await axios.delete(`/api/circuito/${id}`);
                showToast('Evento eliminado');
                fetchData();
            } catch (error) {
                console.error('Error deleting event:', error);
                showToast('Error al eliminar', 'error');
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 mt-2">

            {loading ? (
                <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-gray-100 font-medium text-gray-400">
                    Cargando calendario...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-black/[0.02] hover:shadow-black/[0.05] transition-all group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                                        event.tipo === 'TORNEO' ? 'bg-brand-dark text-white' : 
                                        event.tipo === 'CLINICA' ? 'bg-blue-500 text-white' : 
                                        'bg-amber-500 text-white'
                                    }`}>
                                        {event.tipo}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleOpenModal(event)}
                                            className="p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(event.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight leading-tight mb-2">
                                    {event.titulo}
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <CalendarIcon size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                            {new Date(event.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    {event.torneo_nombre && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Trophy size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark">
                                                Link: {event.torneo_nombre}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[11px] font-medium text-gray-500 mt-4 line-clamp-2">
                                    {event.descripcion || 'Sin descripción.'}
                                </p>
                            </div>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <CalendarIcon size={40} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No hay eventos programados aún</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Creación/Edición */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                        <div className="p-8 pb-0 flex justify-between items-center">
                            <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight italic">
                                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Type size={12} /> Título
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-dark/10 focus:bg-white transition-all outline-none"
                                    placeholder="Ej: 1° Torneo Master 2026"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <CalendarIcon size={12} /> Fecha
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-dark/10 focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Info size={12} /> Tipo
                                    </label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-dark/10 focus:bg-white transition-all outline-none appearance-none"
                                    >
                                        <option value="TORNEO">Torneo</option>
                                        <option value="CLINICA">Clínica</option>
                                        <option value="OTRO">Social / Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Trophy size={12} /> Vincular Torneo (Opcional)
                                </label>
                                <select
                                    value={formData.torneo_id}
                                    onChange={(e) => setFormData({ ...formData, torneo_id: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-dark/10 focus:bg-white transition-all outline-none appearance-none"
                                >
                                    <option value="">Ninguno</option>
                                    {tournaments.map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    Descripción
                                </label>
                                <textarea
                                    rows="3"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-dark/10 focus:bg-white transition-all outline-none resize-none"
                                    placeholder="Detalles del evento..."
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-brand-dark text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95"
                                >
                                    {editingEvent ? 'Guardar Cambios' : 'Crear Evento'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-1/3 border border-gray-100 text-gray-400 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast.open && (
                <Toast
                    message={toast.msg}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, open: false })}
                />
            )}
        </div>
    );
};

export default CircuitManagement;
