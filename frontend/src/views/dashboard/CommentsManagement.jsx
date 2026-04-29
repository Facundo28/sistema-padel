import { useState, useEffect } from 'react';
import { Plus, Trash2, X, MessageSquare, AlertCircle } from 'lucide-react';
import { useHeader } from '../../context/HeaderContext';

const CommentsManagement = () => {
    const { setHeader } = useHeader();
    const [comentarios, setComentarios] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        author_name: '',
        content: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const actionButton = (
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-dark text-white px-5 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-brand-dark/20 hover:-translate-y-0.5"
            >
                <Plus size={16} />
                NUEVO COMENTARIO
            </button>
        );

        setHeader('Gestión de Comentarios', 'Administra los comentarios de la vista principal', actionButton);

        fetchComentarios();
        
        return () => setHeader('', '', null);
    }, [setHeader]);

    const fetchComentarios = async () => {
        try {
            const response = await fetch(`/api/comentarios`);
            if (response.ok) {
                const data = await response.json();
                setComentarios(data);
            }
        } catch (error) {
            console.error('Error fetching comentarios:', error);
            setError('Error al cargar los comentarios');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/comentarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchComentarios();
                setIsModalOpen(false);
                setFormData({ author_name: '', content: '' });
            } else {
                const data = await response.json();
                setError(data.message || 'Error al guardar el comentario');
            }
        } catch (error) {
            console.error('Error saving comentario:', error);
            setError('Error de conexión');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
            try {
                const response = await fetch(`/api/comentarios/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    await fetchComentarios();
                } else {
                    setError('Error al eliminar el comentario');
                }
            } catch (error) {
                console.error('Error deleting comentario:', error);
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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase w-1/4">Autor</th>
                                <th className="p-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase w-2/4">Contenido</th>
                                <th className="p-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase w-1/4">Fecha</th>
                                <th className="p-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase text-right w-16">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {comentarios.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400">
                                        No hay comentarios registrados
                                    </td>
                                </tr>
                            ) : (
                                comentarios.map((comentario) => (
                                    <tr key={comentario.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4">
                                            <span className="text-sm font-bold text-slate-700">{comentario.author_name}</span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-slate-500 line-clamp-2">{comentario.content}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-slate-400">
                                                {new Date(comentario.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(comentario.id)}
                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
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

            {/* Modal de Nuevo Comentario */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3 text-brand-dark">
                                <MessageSquare size={20} />
                                <h3 className="text-sm font-black uppercase tracking-wider">Nuevo Comentario</h3>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-brand-dark hover:bg-white rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
                                    Nombre del Autor
                                </label>
                                <input
                                    type="text"
                                    name="author_name"
                                    value={formData.author_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                                    placeholder="Ej: Juan Pérez"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
                                    Contenido del Comentario
                                </label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all resize-none"
                                    placeholder="Escribe el comentario aquí..."
                                    required
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-xs font-black tracking-wider uppercase text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-brand-dark text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase hover:bg-black transition-all shadow-md shadow-brand-dark/20 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar Comentario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentsManagement;
