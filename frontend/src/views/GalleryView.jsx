import { useState, useEffect } from 'react';
import { X, ZoomIn, ChevronRight, Maximize2 } from 'lucide-react';
import Reveal from '../components/Reveal';
import axios from 'axios';

const GalleryView = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await axios.get(`/api/galeria`);
                // Asignamos spans variados para mantener el estilo mampostería (masonry) según el índice
                const formattedImages = res.data.map((img, idx) => {
                    let span = "col-span-1 row-span-1";
                    if (idx % 8 === 0) span = "md:col-span-2 md:row-span-2";
                    else if (idx % 8 === 3) span = "col-span-1 row-span-2";
                    else if (idx % 8 === 4) span = "md:col-span-2 row-span-1";
                    else if (idx % 8 === 7) span = "md:col-span-3 row-span-2";
                    
                    return {
                        id: img.id,
                        url: `${img.image_path}`,
                        title: img.title || "Foto de Galería",
                        span
                    };
                });
                setImages(formattedImages);
            } catch (err) {
                console.error("Error fetching gallery:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    const openLightbox = (img) => {
        setSelectedImage(img);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <div className="min-h-screen bg-brand-dark pb-24 animate-in fade-in duration-500">
            {/* Elegant Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/95 to-brand-dark z-10"></div>
                <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
                     <span className="text-[200px] font-black italic uppercase leading-none">Padel</span>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 relative z-20 text-center">
                    <Reveal>
                        <span className="text-[10px] font-black tracking-[0.4em] text-gray-500 mb-6 block uppercase">Capturando momentos</span>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase text-shadow-lg">
                            GALERÍA <span className="text-gray-500">EXCLUSIVA</span>
                        </h1>
                        <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-medium">
                            Reviví los mejores momentos de nuestros torneos, clínicas y eventos sociales. Nuestra pasión por el pádel reflejada en cada imagen.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Asymmetrical Masonry Grid */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px]">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="col-span-1 row-span-1 bg-gray-800 animate-pulse rounded-2xl"></div>
                        ))
                    ) : (
                        images.map((img, index) => (
                            <Reveal 
                                key={img.id} 
                            className={`group relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 cursor-pointer ${img.span}`}
                            delay={index % 4 * 100}
                        >
                            <div className="absolute inset-0 w-full h-full" onClick={() => openLightbox(img)}>
                                <img 
                                    src={img.url} 
                                    alt={img.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100 mix-blend-luminosity hover:mix-blend-normal"
                                />
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                                
                                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Click para ver</p>
                                            <h3 className="text-white font-black text-xl italic uppercase tracking-tight drop-shadow-md">{img.title}</h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                                            <Maximize2 size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    )))}
                </div>
            </section>

            {/* Lightbox / Fullscreen Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <button 
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 z-50 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors border border-white/10 backdrop-blur-md"
                    >
                        <X size={24} />
                    </button>
                    
                    <div className="relative w-full max-w-6xl max-h-[90vh] px-4 md:px-12 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                        <img 
                            src={selectedImage.url} 
                            alt={selectedImage.title}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
                        />
                        <div className="mt-8 text-center">
                            <span className="text-[10px] font-black text-gray-500 tracking-[0.4em] uppercase mb-2 block">Visualización</span>
                            <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tight">
                                {selectedImage.title}
                            </h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryView;
