import { useState, useEffect } from 'react';
import { Star, Plus, Trash2, Link as LinkIcon, Edit, X } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { useHeader } from '../../context/HeaderContext';
import axios from 'axios';

const SponsorsManagement = () => {
    const { setHeader } = useHeader();
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [newSponsorName, setNewSponsorName] = useState('');
    const [newSponsorWebUrl, setNewSponsorWebUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchSponsors = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/sponsors`);
            setSponsors(res.data);
        } catch (err) {
            console.error('Error fetching sponsors:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setLogoPreview(null);
        setLogoFile(null);
        setNewSponsorName('');
        setNewSponsorWebUrl('');
    };

    const handleSaveSponsor = async () => {
        if (!newSponsorName.trim() || !logoFile) return;
        
        try {
            setIsSaving(true);
            const formData = new FormData();
            formData.append('name', newSponsorName.toUpperCase());
            formData.append('logo', logoFile);
            if (newSponsorWebUrl.trim()) {
                formData.append('web_url', newSponsorWebUrl.trim());
            }

            await axios.post(`/api/sponsors`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            fetchSponsors();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving sponsor:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/sponsors/${id}`);
            fetchSponsors();
        } catch (err) {
            console.error('Error deleting sponsor:', err);
        }
    };

    useEffect(() => {
        fetchSponsors();
        const actionButton = (
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg font-black hover:bg-black transition-colors shadow-sm text-[11px] uppercase tracking-widest"
            >
                <Plus size={16} />
                NUEVO SPONSOR
            </button>
        );
        setHeader('Gestión de Sponsors', '', actionButton);
        return () => setHeader('', '', null);
    }, []);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 gap-8">
                {/* Existing Sponsors List */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-black text-brand-dark uppercase tracking-widest">Marcas Registradas</h3>
                            <span className="text-xs font-bold bg-brand-dark text-white px-3 py-1.5 rounded-full shadow-inner">{sponsors.length} totales</span>
                        </div>
                        
                        {sponsors.length > 0 ? (
                            <div className="divide-y divide-slate-100/50">
                                {sponsors.map((sponsor, idx) => (
                                    <Reveal key={sponsor.id} delay={idx * 50}>
                                        <div className="p-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 bg-white border border-slate-100 rounded-xl flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                    {sponsor.logo_path ? (
                                                        <img src={`${sponsor.logo_path}`} alt={sponsor.name} className="max-w-full max-h-full object-contain" />
                                                    ) : (
                                                        <span className="text-2xl font-black text-slate-200">{sponsor.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-lg text-brand-dark flex items-center gap-2 uppercase">
                                                        {sponsor.name}
                                                    </h4>
                                                    {sponsor.web_url && (
                                                        <a href={sponsor.web_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                                            <LinkIcon size={12} /> {sponsor.web_url.replace(/^https?:\/\//, '')}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 text-slate-400 hover:text-brand-dark hover:bg-slate-200 rounded-lg transition-colors">
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(sponsor.id)}
                                                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-slate-50/30">
                                <Star size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold text-gray-500">No hay sponsors registrados</h3>
                                <p className="text-sm text-gray-400 mt-1">Usa el botón "Nuevo Sponsor" para agregar tu primera marca asociada.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Add Sponsor */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseModal}
                    />
                    
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-black text-brand-dark uppercase tracking-wide flex items-center gap-2">
                                    <Star size={18} className="text-brand-dark" />
                                    Agregar Sponsor
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Nueva marca patrocinadora</p>
                            </div>
                            <button 
                                onClick={handleCloseModal}
                                className="p-2 text-gray-400 hover:text-brand-dark hover:bg-white rounded-lg transition-colors shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row">
                            {/* Left Side: Form */}
                            <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-100">
                                <form className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre de la Marca</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all outline-none text-brand-dark font-medium"
                                            placeholder="Ej: Bullpadel"
                                            value={newSponsorName}
                                            onChange={(e) => setNewSponsorName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Logo (PNG transparente recomendable)</label>
                                        <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center hover:bg-gray-100 hover:border-brand-dark/50 transition-colors cursor-pointer group relative overflow-hidden">
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/png, image/jpeg, image/webp" 
                                                onChange={handleLogoChange}
                                            />
                                            <Plus size={24} className="text-gray-400 group-hover:scale-110 group-hover:text-brand-dark transition-all mb-2" />
                                            <span className="text-sm font-bold text-brand-dark">Seleccionar Archivo</span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Enlace Web (Opcional)</label>
                                        <div className="relative">
                                            <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input 
                                                type="url" 
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all outline-none text-brand-dark font-medium"
                                                placeholder="https://"
                                                value={newSponsorWebUrl}
                                                onChange={(e) => setNewSponsorWebUrl(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button 
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={handleSaveSponsor}
                                            disabled={!newSponsorName.trim() || !logoFile || isSaving}
                                            className="flex-1 py-3 bg-brand-dark text-white rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Right Side: Preview */}
                            <div className="p-6 md:w-1/2 bg-slate-50 flex flex-col">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Vista Previa del Logo</label>
                                <div className="flex-1 w-full flex items-center justify-center bg-white border border-gray-200 rounded-xl overflow-hidden relative shadow-sm min-h-[200px]">
                                    {logoPreview ? (
                                        <div className="absolute inset-0 p-6 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm">
                                            <img 
                                                src={logoPreview} 
                                                alt="Preview" 
                                                className="max-w-full max-h-[70%] object-contain drop-shadow-md animate-in fade-in zoom-in duration-300 mb-4" 
                                            />
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1 shadow-sm mt-auto">
                                                ✓ Imagen seleccionada
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <Star size={24} className="text-gray-300" />
                                            </div>
                                            <p className="text-sm font-medium">Sube una imagen para previsualizar el logo del sponsor</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SponsorsManagement;
