import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, X, Save, Image as ImageIcon, Calendar, FileText } from 'lucide-react';
import { useHeader } from '../../context/HeaderContext';

const NewsManagement = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const { setHeader } = useHeader();
    
    const [formData, setFormData] = useState({
        id: null,
        titulo: '',
        fecha: new Date().toISOString().split('T')[0],
        categoria_id: '',
        imagen: '',
        contenido_html: ''
    });

    const [categories, setCategories] = useState([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryData, setNewCategoryData] = useState({ nombre: '', color: '#152336' });



    const fetchNews = async () => {
        try {
            const res = await axios.get(`/api/noticias`);
            setNews(res.data);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`/api/noticias/categorias`);
            setCategories(res.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchNews();
        fetchCategories();
    }, []);

    useEffect(() => {
        const actionButton = !isEditing ? (
            <button
                onClick={() => {
                    resetForm();
                    setIsEditing(true);
                }}
                className="flex items-center gap-2 px-6 py-2 bg-brand-dark text-white rounded-lg hover:bg-black/90 transition-colors text-xs font-black uppercase tracking-widest"
            >
                <Plus size={16} />
                Nueva Noticia
            </button>
        ) : null;

        setHeader('Gestión de Noticias', '', actionButton);
    }, [isEditing, setHeader]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const res = await axios.post(`/api/noticias/categorias`, newCategoryData, config);
            
            // Reload categories
            await fetchCategories();
            
            // Set the newly created category as the selected one
            setFormData(prev => ({ ...prev, categoria_id: res.data.id }));
            
            // Close modal and reset
            setIsCategoryModalOpen(false);
            setNewCategoryData({ nombre: '', color: '#152336' });
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Error al crear la categoría');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (formData.id) {
                // Edit
                await axios.put(`/api/noticias/${formData.id}`, formData, config);
            } else {
                // Create
                await axios.post(`/api/noticias`, formData, config);
            }
            
            fetchNews();
            resetForm();
        } catch (error) {
            console.error('Error saving news:', error);
            alert('Error al guardar la noticia');
        }
    };

    const handleEdit = (n) => {
        // Formatear fecha para el input type="date"
        let formattedDate = '';
        if (n.fecha) {
             const d = new Date(n.fecha);
             formattedDate = d.toISOString().split('T')[0];
        }

        setFormData({
            id: n.id,
            titulo: n.titulo,
            fecha: formattedDate || new Date().toISOString().split('T')[0],
            categoria_id: n.categoria_id || '',
            imagen: n.imagen || '',
            contenido_html: n.contenido_html || ''
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar esta noticia?')) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/api/noticias/${id}`, config);
            fetchNews();
        } catch (error) {
            console.error('Error deleting news:', error);
            alert('Error al eliminar');
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            titulo: '',
            fecha: new Date().toISOString().split('T')[0],
            categoria_id: '',
            imagen: '',
            contenido_html: ''
        });
        setIsEditing(false);
    };

    if (loading) return <div className="p-8 text-center text-brand-dark">Cargando noticias...</div>;

    const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-dark/5 transition-all text-sm";
    const labelClass = "block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2";

    return (
        <div className="space-y-6 relative">
            {/* Modal de Nueva Categoría */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight">Nueva Categoría</h3>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                            <div>
                                <label className={labelClass}>Nombre de la Categoría</label>
                                <input 
                                    type="text" 
                                    value={newCategoryData.nombre} 
                                    onChange={(e) => setNewCategoryData({...newCategoryData, nombre: e.target.value})} 
                                    className={inputClass} 
                                    placeholder="Ej: AFORPA, INTERNACIONAL, etc." 
                                    required 
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Color del Etiqueta</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="color" 
                                        value={newCategoryData.color} 
                                        onChange={(e) => setNewCategoryData({...newCategoryData, color: e.target.value})} 
                                        className="h-10 w-20 cursor-pointer rounded border border-gray-200" 
                                    />
                                    <span className="text-sm font-medium text-gray-600 uppercase">{newCategoryData.color}</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 text-xs uppercase">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-brand-dark text-white font-bold rounded-lg hover:bg-black/90 text-xs uppercase">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditing ? (
                /* Formulario de Noticia (Crear/Editar) */
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-brand-dark uppercase tracking-tight">
                            {formData.id ? 'Editar Noticia' : 'Crear Nueva Noticia'}
                        </h2>
                        <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Título de la Noticia</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <FileText size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="titulo" 
                                        value={formData.titulo} 
                                        onChange={handleChange} 
                                        className={`${inputClass} pl-11`} 
                                        placeholder="Escribe el título" 
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className={labelClass}>Fecha de Publicación</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Calendar size={18} />
                                    </div>
                                    <input 
                                        type="date" 
                                        name="fecha" 
                                        value={formData.fecha} 
                                        onChange={handleChange} 
                                        className={`${inputClass} pl-11 shadow-sm`}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className={labelClass + ' mb-0'}>Categoría</label>
                                        <button 
                                            type="button" 
                                            onClick={() => setIsCategoryModalOpen(true)}
                                            className="text-[10px] font-bold text-brand-light uppercase tracking-wider hover:text-brand-light/80 flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Añadir Nueva
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            name="categoria_id" 
                                            value={formData.categoria_id} 
                                            onChange={handleChange} 
                                            className={inputClass}
                                        >
                                            <option value="">Selecciona una categoría (Opcional)</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>URL de la Imagen (Portada)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <ImageIcon size={18} />
                                        </div>
                                        <input 
                                            type="text" 
                                            name="imagen" 
                                            value={formData.imagen} 
                                            onChange={handleChange} 
                                            className={`${inputClass} pl-11`}
                                            placeholder="/images/noticias/imagen1.png u http://..." 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClass}>Contenido de la Noticia</label>
                                <div className="bg-white border-gray-200">
                                    <textarea 
                                        name="contenido_html"
                                        value={formData.contenido_html} 
                                        onChange={handleChange} 
                                        className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-dark/5 transition-all text-sm resize-y"
                                        placeholder="Redacta el cuerpo de la noticia aquí. Puedes usar etiquetas HTML básicas como <b>texto negrita</b>, <i>cursiva</i>, o <br> para saltos de línea."
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors uppercase tracking-wider text-xs"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 bg-brand-dark text-white font-bold rounded-lg hover:bg-black/90 transition-colors uppercase tracking-wider text-xs"
                            >
                                <Save size={16} />
                                Guardar Noticia
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                /* Lista de Noticias */
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Noticia</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Categoría</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Fecha</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {news.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-400 text-sm">
                                            No hay noticias creadas. ¡Comienza creando la primera!
                                        </td>
                                    </tr>
                                ) : (
                                    news.map((item) => {
                                        let displayDate = item.fecha;
                                        if (item.fecha) {
                                            const d = new Date(item.fecha);
                                            displayDate = d.toLocaleDateString('es-AR');
                                        }

                                        return (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {item.imagen ? (
                                                        <img src={item.imagen} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                            <ImageIcon size={20} className="text-gray-300" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-bold text-brand-dark line-clamp-1">{item.titulo}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.categoria_nombre ? (
                                                    <span 
                                                        className="text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider text-white"
                                                        style={{ backgroundColor: item.categoria_color || '#152336' }}
                                                    >
                                                        {item.categoria_nombre}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Sin asignar</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{displayDate}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsManagement;
