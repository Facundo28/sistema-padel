import { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { useHeader } from '../../context/HeaderContext';
import axios from 'axios';

const GalleryManagement = () => {
    const { setHeader } = useHeader();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/galeria`);
            setImages(res.data);
        } catch (err) {
            console.error('Error fetching gallery images:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const handleRemovePreview = (indexToRemove) => {
        setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
        setImageFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleCloseModal = () => {
        setIsUploadModalOpen(false);
        setImagePreviews([]);
        setImageFiles([]);
    };

    const handleSaveImages = async () => {
        if (imageFiles.length === 0) return;
        
        try {
            setIsSaving(true);
            const formData = new FormData();
            imageFiles.forEach(file => {
                formData.append('images', file);
            });

            await axios.post(`/api/galeria`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            fetchImages();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving images:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/galeria/${id}`);
            fetchImages();
        } catch (err) {
            console.error('Error deleting image:', err);
        }
    };

    useEffect(() => {
        fetchImages();
        const actionButton = (
            <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg font-black hover:bg-black transition-colors shadow-sm text-[11px] uppercase tracking-widest"
            >
                <Plus size={16} />
                NUEVA FOTO
            </button>
        );
        setHeader('Gestión de Galería', '', actionButton);
        return () => setHeader('', '', null);
    }, []);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Existing Images Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image, idx) => (
                    <Reveal key={image.id} delay={idx * 50}>
                        <div className="group relative bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                                <img 
                                    src={`${image.image_path}`} 
                                    alt={image.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => handleDelete(image.id)}
                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all font-bold tooltip"
                                        title="Eliminar Foto"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-50">
                                <h3 className="font-bold text-sm text-brand-dark truncate">{image.title || 'Sin Título'}</h3>
                                <p className="text-xs text-slate-400 mt-1">Subida recientemente</p>
                            </div>
                        </div>
                    </Reveal>
                ))}

                {images.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                        <ImageIcon size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-500">No hay imágenes en la galería</h3>
                        <p className="text-sm text-slate-400 mt-1">Usa el botón "Nueva Foto" para comenzar subiendo algunas fotos destacadas.</p>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseModal}
                    />
                    
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-black text-brand-dark uppercase tracking-wide flex items-center gap-2">
                                    <Camera size={18} className="text-brand-dark" />
                                    Subir Imágenes
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Agrega nuevas fotos a la galería</p>
                            </div>
                            <button 
                                onClick={handleCloseModal}
                                className="p-2 text-gray-400 hover:text-brand-dark hover:bg-white rounded-lg transition-colors shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <label className="p-8 border-2 border-dashed border-slate-200/80 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer group shadow-sm block w-full relative">
                                <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" multiple onChange={handleImageChange} />
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                                    <Camera size={28} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-brand-dark">Arrastra tus fotos aquí</h3>
                                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">Formatos aceptados: JPG, PNG, WEBP. Tamaño máximo por foto: 5MB.</p>
                                <span className="mt-6 inline-block px-5 py-2.5 bg-white border border-gray-200 text-brand-dark font-bold rounded-lg hover:border-gray-300 transition-colors shadow-sm cursor-pointer">
                                    Seleccionar Archivos
                                </span>
                            </label>

                            {imagePreviews.length > 0 && (
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Imágenes Seleccionadas ({imagePreviews.length})</h4>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                                            Listas para guardar
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[240px] overflow-y-auto p-1">
                                        {imagePreviews.map((preview, idx) => (
                                            <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative group/preview shadow-sm">
                                                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemovePreview(idx)}
                                                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover/preview:opacity-100 shadow-sm"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button 
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleSaveImages}
                                    disabled={imagePreviews.length === 0 || isSaving}
                                    className="flex-1 py-3 bg-brand-dark text-white rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSaving ? 'Guardando...' : `Guardar ${imagePreviews.length} ${imagePreviews.length === 1 ? 'foto' : 'fotos'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryManagement;
