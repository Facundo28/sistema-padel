import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Plus, Trash2, Edit2, Phone, X, Save, Type, Globe } from 'lucide-react';
import { useHeader } from '../../context/HeaderContext';
import Toast from '../../components/Toast';

const VenuesManagement = () => {
    const { setHeader } = useHeader();
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVenue, setEditingVenue] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        localidad: '',
        telefono: '',
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
                AGREGAR SEDE
            </button>
        );
        setHeader('Gestión de Sedes', 'Administra los clubes y centros donde se juega el circuito', actionButton);
        fetchVenues();
        return () => setHeader('', '', null);
    }, []);

    const fetchVenues = async () => {
        try {
            const res = await axios.get(`/api/sedes`);
            setVenues(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching venues:', error);
            showToast('Error al cargar sedes', 'error');
            setLoading(false);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ open: true, msg, type });
    };

    const handleOpenModal = (venue = null) => {
        if (venue) {
            setEditingVenue(venue);
            setFormData({
                nombre: venue.nombre,
                direccion: venue.direccion,
                localidad: venue.localidad,
                telefono: venue.telefono || '',
                imagen: venue.imagen || ''
            });
        } else {
            setEditingVenue(null);
            setFormData({
                nombre: '',
                direccion: '',
                localidad: '',
                telefono: '',
                imagen: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingVenue) {
                await axios.put(`/api/sedes/${editingVenue.id}`, formData);
                showToast('Sede actualizada correctamente');
            } else {
                await axios.post(`/api/sedes`, formData);
                showToast('Sede creada correctamente');
            }
            setIsModalOpen(false);
            fetchVenues();
        } catch (error) {
            console.error('Error saving venue:', error);
            showToast('Error al guardar la sede', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta sede?')) {
            try {
                await axios.delete(`/api/sedes/${id}`);
                showToast('Sede eliminada');
                fetchVenues();
            } catch (error) {
                console.error('Error deleting venue:', error);
                showToast('Error al eliminar', 'error');
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 mt-2">

            {loading ? (
                <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-gray-100 font-medium text-gray-400">
                    Cargando sedes...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {venues.map((venue) => (
                        <div key={venue.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-black/[0.02] hover:shadow-black/[0.05] transition-all group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-brand-dark">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleOpenModal(venue)}
                                            className="p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(venue.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight leading-tight mb-2">
                                    {venue.nombre}
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MapPin size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                            {venue.direccion}, {venue.localidad}
                                        </span>
                                    </div>
                                    {venue.telefono && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Phone size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                                {venue.telefono}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {venues.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <MapPin size={40} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No hay sedes registradas aún</p>
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
                            <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">
                                {editingVenue ? 'Editar Sede' : 'Nueva Sede'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Type size={12} /> Nombre del Club
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-dark/10 focus:bg-white transition-all outline-none"
                                    placeholder="Ej: Central Padel"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <MapPin size={12} /> Dirección
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-dark/10 focus:bg-white transition-all outline-none"
                                    placeholder="Calle y número"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Globe size={12} /> Localidad
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.localidad}
                                        onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-dark/10 focus:bg-white transition-all outline-none"
                                        placeholder="Ciudad"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Phone size={12} /> Teléfono
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-dark/10 focus:bg-white transition-all outline-none"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-brand-dark text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95"
                                >
                                    {editingVenue ? 'Guardar Cambios' : 'Crear Sede'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-1/3 border border-gray-100 text-gray-400 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                            </div>

                            {/* Preview Map Section */}
                            {(formData.direccion && formData.localidad) && (
                                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Vista Previa del Mapa</label>
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${formData.direccion}, ${formData.localidad}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-black text-brand-dark uppercase tracking-widest hover:underline flex items-center gap-1"
                                        >
                                            <Globe size={10} /> Buscar ubicación oficial
                                        </a>
                                    </div>
                                    <div className="rounded-2xl overflow-hidden h-40 bg-gray-100 border border-gray-100 italic text-[10px] text-gray-400 flex items-center justify-center relative">
                                        <iframe
                                            key={`${formData.direccion}-${formData.localidad}`}
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight="0"
                                            marginWidth="0"
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${formData.direccion}, ${formData.localidad}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                            style={{ filter: 'grayscale(0.4)' }}
                                        ></iframe>
                                        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-2xl"></div>
                                    </div>
                                    <p className="text-[9px] font-medium text-gray-400 italic">
                                        * Asegúrate de que el mapa muestre el pin en el lugar correcto antes de guardar.
                                    </p>
                                </div>
                            )}
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

export default VenuesManagement;
