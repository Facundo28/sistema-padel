import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HeroCarousel = () => {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await axios.get('/api/carteles');
                setConfig(res.data);
            } catch (err) {
                console.error("Error fetching carteles:", err);
            }
        };
        fetchConfig();
    }, []);

    const heroType = config?.hero_type || 'video';
    const heroMedia = config?.hero_media || '/videos/YTDown.com_YouTube_Adidas-Padel-promo-video-short_Media_Px1NaszfPU4_001_1080p.mp4';

    return (
        <div className="relative h-[600px] w-full overflow-hidden bg-brand-dark">
            {/* Background Media */}
            <div className="absolute inset-0 z-0">
                {heroType === 'video' ? (
                    <video
                        key={heroMedia}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src={heroMedia} type="video/mp4" />
                    </video>
                ) : (
                    <img 
                        key={heroMedia}
                        src={heroMedia} 
                        alt="Hero Background" 
                        className="w-full h-full object-cover" 
                    />
                )}
                {/* Overlay gradient to ensure text readability */}
                <div className="absolute inset-0 bg-black/50 z-10" />
            </div>

            {/* Static Content Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-4 text-center">
                <span className="text-[10px] font-black tracking-[0.4em] text-gray-300 mb-4 block uppercase animate-in fade-in slide-in-from-bottom-4 duration-700">
                    SISTEMA PROFESIONAL DE PÁDEL
                </span>
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic uppercase animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    Domina la Pista
                </h1>
                <p className="text-lg md:text-xl font-medium mb-10 max-w-2xl text-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                    Vive la pasión del pádel con la plataforma más avanzada para la gestión de torneos, rankings y jugadores.
                </p>
                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
                    <button className="px-8 py-4 bg-brand-primary text-white font-black tracking-widest text-[11px] rounded hover:bg-orange-600 transition-all shadow-xl uppercase">
                        VER TORNEOS
                    </button>
                    <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-black tracking-widest text-[11px] rounded hover:bg-white/20 transition-all uppercase">
                        REGISTRARME
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroCarousel;
