import { useState, useEffect } from 'react';
import { MonitorPlay, Image as ImageIcon, Video, Upload, Save, Clock } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { useHeader } from '../../context/HeaderContext';
import axios from 'axios';

const CartelesManagement = () => {
    const { setHeader } = useHeader();
    const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'cards'
    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(true);

    // Hero states
    const [heroType, setHeroType] = useState('video');
    const [heroFile, setHeroFile] = useState(null);
    const [heroPreview, setHeroPreview] = useState(null);
    const [heroSaving, setHeroSaving] = useState(false);

    // Cards states
    const [cardFiles, setCardFiles] = useState({});
    const [cardPreviews, setCardPreviews] = useState({});
    const [cardSaving, setCardSaving] = useState({});

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/carteles`);
            setConfig(res.data);
            if (res.data.hero_type) setHeroType(res.data.hero_type);
        } catch (err) {
            console.error('Error fetching carteles config:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
        setHeader('Gestión de Carteles', 'Banners y Promociones');
        return () => setHeader('', '');
    }, []);

    const handleHeroFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setHeroFile(file);
            setHeroPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveHero = async () => {
        try {
            setHeroSaving(true);
            const formData = new FormData();
            formData.append('type', heroType);
            if (heroFile) {
                formData.append('media', heroFile);
            } else if (config.hero_media) {
                formData.append('media_path', config.hero_media);
            }

            await axios.post(`/api/carteles/hero`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            await fetchConfig();
            setHeroFile(null);
            setHeroPreview(null);
        } catch (err) {
            console.error('Error saving hero:', err);
        } finally {
            setHeroSaving(false);
        }
    };

    const handleCardFileChange = (e, cardId) => {
        const file = e.target.files[0];
        if (file) {
            setCardFiles(prev => ({ ...prev, [cardId]: file }));
            setCardPreviews(prev => ({ ...prev, [cardId]: URL.createObjectURL(file) }));
        }
    };

    const handleSaveCard = async (cardId) => {
        const file = cardFiles[cardId];
        if (!file) return;

        try {
            setCardSaving(prev => ({ ...prev, [cardId]: true }));
            const formData = new FormData();
            formData.append('card_id', cardId);
            formData.append('media', file);

            await axios.post(`/api/carteles/card`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            await fetchConfig();
            
            // Clear local temporary state for this card
            setCardFiles(prev => { const n = {...prev}; delete n[cardId]; return n; });
            setCardPreviews(prev => { const n = {...prev}; delete n[cardId]; return n; });

        } catch (err) {
            console.error(`Error saving card ${cardId}:`, err);
        } finally {
            setCardSaving(prev => ({ ...prev, [cardId]: false }));
        }
    };

    const tabs = [
        { id: 'hero', label: 'Hero Principal', icon: MonitorPlay },
        { id: 'cards', label: 'Tarjetas Promocionales', icon: ImageIcon }
    ];

    const cardGroups = [
        { id: 'card_circuito1', label: 'Circuito 2026 - Foto 1' },
        { id: 'card_circuito2', label: 'Circuito 2026 - Foto 2' },
        { id: 'card_sedes1', label: 'Sedes - Foto 1' },
        { id: 'card_sedes2', label: 'Sedes - Foto 2' },
        { id: 'card_fotos1', label: 'Fotos - Foto 1' },
        { id: 'card_fotos2', label: 'Fotos - Foto 2' },
        { id: 'card_sponsor1', label: 'Sponsor - Foto 1' },
        { id: 'card_sponsor2', label: 'Sponsor - Foto 2' }
    ];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Tabs */}
            <div className="flex space-x-2 bg-white p-2 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all duration-300 ${
                                isActive 
                                    ? 'bg-brand-dark text-white shadow-md shadow-brand-dark/20' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-brand-dark'
                            }`}
                        >
                            <Icon size={18} />
                            <span className="text-[11px] uppercase tracking-wider">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Clock className="animate-spin text-brand-dark opacity-50" size={32} />
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                    {activeTab === 'hero' && (
                        <Reveal>
                            <div className="space-y-8 max-w-3xl mx-auto">
                                <div className="text-center">
                                    <h3 className="font-black text-xl text-brand-dark uppercase tracking-widest mb-2">Banner Principal</h3>
                                    <p className="text-sm font-medium text-slate-500">Configura el fondo que aparece en el inicio del sitio web.</p>
                                </div>

                                {/* Tipo Selector */}
                                <div className="flex bg-slate-100 rounded-xl p-1 gap-1 w-full max-w-md mx-auto">
                                    <button 
                                        onClick={() => setHeroType('video')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all text-[11px] uppercase tracking-wider ${heroType === 'video' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-brand-dark'}`}
                                    >
                                        <Video size={16} /> Video (.mp4)
                                    </button>
                                    <button 
                                        onClick={() => setHeroType('foto')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all text-[11px] uppercase tracking-wider ${heroType === 'foto' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-brand-dark'}`}
                                    >
                                        <ImageIcon size={16} /> Foto Estática
                                    </button>
                                </div>

                                {/* Uploader */}
                                <div className="space-y-4">
                                    <label className="w-full text-center h-64 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer group relative overflow-hidden">
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept={heroType === 'video' ? "video/mp4,video/webm" : "image/*"} 
                                            onChange={handleHeroFileChange}
                                        />
                                        
                                        {heroPreview ? (
                                            heroType === 'video' ? (
                                                <video src={heroPreview} className="w-full h-full object-cover opacity-80" autoPlay muted loop />
                                            ) : (
                                                <img src={heroPreview} className="w-full h-full object-cover opacity-80" />
                                            )
                                        ) : config.hero_media ? (
                                            config.hero_type === 'video' ? (
                                                <video src={config.hero_media} className="w-full h-full object-cover opacity-60" autoPlay muted loop />
                                            ) : (
                                                <img src={config.hero_media} className="w-full h-full object-cover opacity-60" />
                                            )
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <Upload size={32} className="text-brand-primary group-hover:scale-110 transition-transform mb-3 drop-shadow-md" />
                                                <span className="text-sm font-bold text-brand-dark bg-white/80 px-4 py-1.5 rounded-full shadow-sm">
                                                    Subir {heroType === 'video' ? 'Video' : 'Foto'}
                                                </span>
                                            </div>
                                        )}

                                        {(heroPreview || config.hero_media) && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <Upload size={32} className="text-white mb-2" />
                                                 <span className="text-white font-black text-sm uppercase tracking-widest drop-shadow-md">Cambiar Archivo</span>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                    <button 
                                        onClick={handleSaveHero}
                                        disabled={heroSaving}
                                        className="py-4 px-10 bg-brand-dark text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Save size={16} />
                                        {heroSaving ? 'Guardando...' : 'Guardar Hero'}
                                    </button>
                                </div>
                            </div>
                        </Reveal>
                    )}

                    {activeTab === 'cards' && (
                        <Reveal>
                            <div className="space-y-8">
                                <div className="text-center mb-8">
                                    <h3 className="font-black text-xl text-brand-dark uppercase tracking-widest mb-2">Tarjetas Destacadas</h3>
                                    <p className="text-sm font-medium text-slate-500">Reemplaza las imágenes que se muestran en los 4 cuadros de la página principal (Cada cuadro alterna entre 2 imágenes).</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {cardGroups.map((card) => {
                                        const preview = cardPreviews[card.id];
                                        const serverMedia = config[card.id];
                                        const isSaving = cardSaving[card.id];
                                        const hasPendingChanges = !!cardFiles[card.id];

                                        return (
                                            <div key={card.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col">
                                                <h4 className="text-xs font-black text-brand-dark uppercase tracking-widest mb-3 text-center">{card.label}</h4>
                                                
                                                <label className="w-full aspect-[4/5] bg-white border-2 border-dashed border-slate-200 rounded-xl overflow-hidden cursor-pointer group relative mb-4 flex items-center justify-center">
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={(e) => handleCardFileChange(e, card.id)}
                                                    />
                                                    
                                                    {preview ? (
                                                        <img src={preview} className="w-full h-full object-cover" />
                                                    ) : serverMedia ? (
                                                        <img src={serverMedia} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="text-slate-300 w-12 h-12 group-hover:text-brand-primary group-hover:scale-110 transition-all" />
                                                    )}

                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="bg-white font-bold text-xs uppercase px-3 py-1.5 rounded-full text-brand-dark">Cambiar</span>
                                                    </div>
                                                </label>

                                                <button 
                                                    onClick={() => handleSaveCard(card.id)}
                                                    disabled={!hasPendingChanges || isSaving}
                                                    className={`w-full py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                                        hasPendingChanges 
                                                            ? 'bg-brand-primary text-white hover:bg-orange-600 shadow-md transform hover:-translate-y-0.5' 
                                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <Save size={14} />
                                                    {isSaving ? 'Guardando...' : 'Guardar'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Reveal>
                    )}
                </div>
            )}
        </div>
    );
};

export default CartelesManagement;
