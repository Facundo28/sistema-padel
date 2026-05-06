import { useState, useEffect } from 'react';
import { Swords, Plus, Search, Edit2, Trash2, X, Image, LayoutGrid } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import { useHeader } from '../../context/HeaderContext';

const TorneosManagement = () => {
    const [torneos, setTorneos] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

    const estados = ['INSCRIPCIONES', 'EN CURSO', 'FINALIZADO'];

    const [newTorneo, setNewTorneo] = useState({
        nombre: '',
        descripcion: '',
        imagen: '',
        categoria: 'Caballeros Primera (1ra C)',
        fecha: '',
        ubicacion: '',
        sede_ids: [],
        estado: 'INSCRIPCIONES',
        cupo: 32,
        costo_inscripcion: '',
        localidad: '',
        modalidad: '',
        sistema_competencia: ''
    });

    const [editingId, setEditingId] = useState(null);

    const fetchTorneos = async () => {
        try {
            const [torneosRes, sedesRes] = await Promise.all([
                axios.get(`/api/torneos`),
                axios.get(`/api/sedes`)
            ]);
            setTorneos(torneosRes.data);
            setSedes(sedesRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
            setToast({ type: 'error', message: 'Error al cargar los datos' });
        } finally {
            setLoading(false);
        }
    };

    const { setHeader } = useHeader();

    useEffect(() => {
        fetchTorneos();
        const actionButton = (
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg font-black hover:bg-black transition-colors shadow-sm text-[11px] uppercase tracking-widest"
            >
                <Plus size={16} />
                NUEVO TORNEO
            </button>
        );
        setHeader('Gestión de Torneos', 'Crea y administra los torneos y eventos.', actionButton);
        return () => setHeader('', '', null);
    }, []);

    const handleChange = (e) => {
        setNewTorneo({ ...newTorneo, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/torneos/${editingId}`, newTorneo);
                setToast({ type: 'success', message: '¡Torneo actualizado exitosamente!' });
            } else {
                await axios.post(`/api/torneos`, newTorneo);
                setToast({ type: 'success', message: '¡Torneo creado exitosamente!' });
            }
            setIsAddModalOpen(false);
            setEditingId(null);
            setNewTorneo({
                nombre: '', descripcion: '', imagen: '',
                categoria: 'Caballeros Primera (1ra C)',
                fecha: '', ubicacion: '', sede_ids: [], estado: 'INSCRIPCIONES', cupo: 32,
                costo_inscripcion: '', localidad: '', modalidad: '', sistema_competencia: ''
            });
            fetchTorneos();
        } catch (err) {
            setToast({ type: 'error', message: editingId ? 'Error al actualizar el torneo' : 'Error al crear el torneo' });
        }
    };

    const handleEdit = (torneo) => {
        const formattedFecha = torneo.fecha ? new Date(torneo.fecha).toISOString().split('T')[0] : '';
        
        // Parse sede_ids_raw from backend (e.g., "1,2,3") into [1, 2, 3]
        const parsedSedeIds = torneo.sede_ids_raw 
            ? torneo.sede_ids_raw.split(',').map(id => parseInt(id)) 
            : [];
        
        setEditingId(torneo.id);
        setNewTorneo({
            ...torneo,
            fecha: formattedFecha,
            sede_ids: parsedSedeIds
        });
        setIsAddModalOpen(true);
    };

    const handleEstadoChange = async (id, nuevoEstado) => {
        try {
            const torneo = torneos.find(t => t.id === id);
            await axios.put(`/api/torneos/${id}`, {
                ...torneo,
                estado: nuevoEstado
            });
            setToast({ type: 'success', message: `Estado actualizado a ${nuevoEstado}` });
            fetchTorneos();
        } catch (err) {
            setToast({ type: 'error', message: 'Error al actualizar el estado' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/torneos/${id}`);
            setToast({ type: 'success', message: 'Torneo eliminado' });
            fetchTorneos();
        } catch (err) {
            setToast({ type: 'error', message: 'Error al eliminar el torneo' });
        }
    };

    const filteredTorneos = torneos.filter(t =>
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getEstadoBadge = (estado) => {
        const styles = {
            'INSCRIPCIONES': 'bg-blue-50 text-blue-600 border-blue-100',
            'EN CURSO': 'bg-amber-50 text-amber-600 border-amber-100',
            'FINALIZADO': 'bg-gray-100 text-gray-500 border-gray-200'
        };
        return styles[estado] || 'bg-gray-100 text-gray-500 border-gray-200';
    };

    const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-dark/5 text-sm font-medium transition-all text-brand-dark";
    const labelClass = "block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 ml-1";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Search */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/20">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-dark transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar torneo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 bg-white border border-gray-100 rounded-lg focus:border-brand-dark/20 focus:outline-none focus:ring-4 focus:ring-brand-dark/5 text-sm font-bold transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-brand-dark/5 border border-brand-dark/10 rounded-md">
                            <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">{filteredTorneos.length} TORNEOS</span>
                        </div>
                    </div>
                </div>

                {/* Tournament Cards Grid */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredTorneos.length > 0 ? filteredTorneos.map(torneo => (
                        <div key={torneo.id} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            {/* Image */}
                            <div className="relative h-40 overflow-hidden bg-gray-100">
                                {torneo.imagen ? (
                                    <img
                                        src={torneo.imagen}
                                        alt={torneo.nombre}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Image size={32} className="text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span className={`px-3 py-1 text-[10px] font-black tracking-widest rounded-md border backdrop-blur-md ${getEstadoBadge(torneo.estado)}`}>
                                        {torneo.estado}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-3">
                                <div>
                                    <h3 className="text-lg font-black text-brand-dark tracking-tight uppercase">{torneo.nombre}</h3>
                                    <p className="text-gray-500 text-xs font-medium mt-1 line-clamp-2">{torneo.descripcion || 'Sin descripción'}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                    <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded">
                                        {torneo.categoria?.split('(')[1]?.replace(')', '') || torneo.categoria}
                                    </span>
                                    <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded">
                                        {new Date(torneo.fecha).toLocaleDateString('es-AR')}
                                    </span>
                                    {torneo.sedes_nombres && (
                                        <span className="px-2 py-0.5 bg-gray-50 border border-brand-dark/20 text-brand-dark rounded flex items-center gap-1">
                                            <span>🏟️</span> {torneo.sedes_nombres}
                                        </span>
                                    )}
                                    {torneo.ubicacion && !torneo.sedes_nombres && (
                                        <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded">
                                            {torneo.ubicacion}
                                        </span>
                                    )}
                                    <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded">
                                        {torneo.inscriptos || 0}/{torneo.cupo} inscriptos
                                    </span>
                                </div>

                                {/* Estado Selector & Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                    <select
                                        value={torneo.estado}
                                        onChange={(e) => handleEstadoChange(torneo.id, e.target.value)}
                                        className="px-3 py-1.5 text-[10px] font-black tracking-wider text-brand-dark bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark/5 cursor-pointer uppercase"
                                    >
                                        {estados.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(torneo)}
                                            className="p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-50 rounded-md transition-all border border-gray-100"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(torneo.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all border border-gray-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-12 text-brand-gray">
                            No se encontraron torneos.
                        </div>
                    )}
                </div>
            </div>

            {/* Add Tournament Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Nuevo Torneo"
            >
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label className={labelClass}>Nombre del Torneo</label>
                            <input required name="nombre" value={newTorneo.nombre} onChange={handleChange} className={inputClass} placeholder="Ej: Open Primavera 2026" />
                        </div>
                        <div className="col-span-full">
                            <label className={labelClass}>Descripción</label>
                            <textarea name="descripcion" value={newTorneo.descripcion} onChange={handleChange} className={`${inputClass} resize-none h-20`} placeholder="Descripción del torneo..." />
                        </div>
                        <div className="col-span-full">
                            <label className={labelClass}>URL de Imagen</label>
                            <input name="imagen" value={newTorneo.imagen} onChange={handleChange} className={inputClass} placeholder="https://ejemplo.com/imagen.jpg" />
                        </div>
                        <div>
                            <label className={labelClass}>Categoría</label>
                            <select name="categoria" value={newTorneo.categoria} onChange={handleChange} className={inputClass}>
                                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Fecha</label>
                            <input required type="date" name="fecha" value={newTorneo.fecha} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="col-span-full">
                            <label className={labelClass}>Sedes del Torneo (Selecciona una o más)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                                {sedes.map(s => (
                                    <div 
                                        key={s.id} 
                                        onClick={() => {
                                            const current = newTorneo.sede_ids || [];
                                            const updated = current.includes(s.id) 
                                                ? current.filter(id => id !== s.id)
                                                : [...current, s.id];
                                            setNewTorneo({ ...newTorneo, sede_ids: updated });
                                        }}
                                        className={`cursor-pointer px-4 py-3 rounded-lg border text-xs font-bold transition-all flex items-center gap-3 ${
                                            (newTorneo.sede_ids || []).includes(s.id)
                                                ? 'bg-brand-dark text-white border-brand-dark shadow-md'
                                                : 'bg-white text-gray-500 border-gray-100 hover:border-brand-dark/20'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                            (newTorneo.sede_ids || []).includes(s.id) ? 'bg-white border-white' : 'border-gray-200'
                                        }`}>
                                            {(newTorneo.sede_ids || []).includes(s.id) && <div className="w-2 h-2 bg-brand-dark rounded-full" />}
                                        </div>
                                        {s.nombre}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Ubicación Detallada (Opcional)</label>
                            <input name="ubicacion" value={newTorneo.ubicacion} onChange={handleChange} className={inputClass} placeholder="Ej: Club El Colorado, Cancha 1" />
                        </div>
                        <div>
                            <label className={labelClass}>Cupo</label>
                            <input type="number" name="cupo" value={newTorneo.cupo} onChange={handleChange} className={inputClass} placeholder="32" />
                        </div>
                        <div>
                            <label className={labelClass}>Estado Inicial</label>
                            <select name="estado" value={newTorneo.estado} onChange={handleChange} className={inputClass}>
                                {estados.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <div className="border-t border-gray-100 pt-4 col-span-full">
                            <h4 className="text-[10px] font-black tracking-widest text-brand-dark uppercase mb-4">Información Adicional</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Costo de Inscripción</label>
                                    <input name="costo_inscripcion" value={newTorneo.costo_inscripcion} onChange={handleChange} className={inputClass} placeholder="Ej: $15.000 / $25.000 pareja" />
                                </div>
                                <div>
                                    <label className={labelClass}>Localidad</label>
                                    <input name="localidad" value={newTorneo.localidad} onChange={handleChange} className={inputClass} placeholder="Ej: Pirané, Formosa" />
                                </div>
                                <div>
                                    <label className={labelClass}>Modalidad</label>
                                    <input name="modalidad" value={newTorneo.modalidad} onChange={handleChange} className={inputClass} placeholder="Ej: Dobles Eliminación Directa" />
                                </div>
                                <div>
                                    <label className={labelClass}>Sistema de Competencia</label>
                                    <input name="sistema_competencia" value={newTorneo.sistema_competencia} onChange={handleChange} className={inputClass} placeholder="Ej: Zonas y Cuaves" />
                                </div>
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
                            {editingId ? 'Guardar Cambios' : 'Crear Torneo'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TorneosManagement;
