import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';

const CardCarousel = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [images.length]);

    return (
        <div className="relative w-full h-full overflow-hidden rounded-xl group">
            <div 
                className="flex transition-transform duration-1000 ease-in-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((img, i) => (
                    <div key={i} className="min-w-full h-full">
                        <img 
                            src={img} 
                            alt="" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                    </div>
                ))}
            </div>
            
            {/* Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-300 ${
                            currentIndex === i ? 'w-4 bg-white' : 'w-1 bg-white/40'
                        }`}
                    />
                ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    );
};

const FeaturedSections = () => {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // If it's already fetching somewhere else, this is fine, it caches or is fast.
                // Normally it's better to share state but this works perfect for this scale.
                const res = await (await fetch('/api/carteles')).json();
                setConfig(res);
            } catch (err) {
                console.error("Error fetching carteles:", err);
            }
        };
        fetchConfig();
    }, []);

    const sections = [
        {
            title: "CIRCUITO 2026",
            images: [
                config?.card_circuito1 || "/images/home/circuito1.png", 
                config?.card_circuito2 || "/images/home/circuito2.png"
            ],
            delay: 0
        },
        {
            title: "SEDES",
            images: [
                config?.card_sedes1 || "/images/home/sedes1.png", 
                config?.card_sedes2 || "/images/home/sedes2.png"
            ],
            delay: 200
        },
        {
            title: "FOTOS",
            images: [
                config?.card_fotos1 || "/images/home/fotos1.png", 
                config?.card_fotos2 || "/images/home/fotos2.png"
            ],
            delay: 400
        },
        {
            title: "SPONSOR",
            images: [
                config?.card_sponsor1 || "/images/home/sponsors1.png", 
                config?.card_sponsor2 || "/images/home/sponsors2.png"
            ],
            delay: 600
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {sections.map((section, index) => {
                        const isLinkable = section.title === "CIRCUITO 2026" || section.title === "SEDES" || section.title === "FOTOS";
                        const CardWrapper = isLinkable ? Link : 'div';
                        
                        let toProp = "";
                        if (section.title === "CIRCUITO 2026") toProp = "/circuito";
                        if (section.title === "SEDES") toProp = "/sedes";
                        if (section.title === "FOTOS") toProp = "/fotos";

                        const wrapperProps = isLinkable ? { to: toProp } : {};

                        return (
                            <Reveal key={index} delay={section.delay} threshold={0.1}>
                                <CardWrapper {...wrapperProps} className="group cursor-pointer block relative rounded-xl overflow-hidden shadow-2xl shadow-black/5 aspect-[4/5]">
                                    <CardCarousel images={section.images} />
                                    
                                    {/* Always-on Gradient Overlay for text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                                    
                                    {/* Hover extra darkening effect */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

                                    {/* Text Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col justify-end h-full">
                                        <h3 className="text-xl font-black text-white tracking-[0.2em] uppercase italic group-hover:scale-105 transition-transform duration-500 drop-shadow-md">
                                            {section.title}
                                        </h3>
                                        <div className="w-8 h-1 bg-brand-dark mt-4 group-hover:w-16 transition-all duration-500"></div>
                                    </div>
                                </CardWrapper>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FeaturedSections;
