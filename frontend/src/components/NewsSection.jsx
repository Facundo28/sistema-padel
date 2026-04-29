import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Reveal from './Reveal';
import { Calendar } from 'lucide-react';

const NewsCard = ({ news, isLarge = false }) => {
    const navigate = useNavigate();

    let displayDate = news.fecha;
    if (news.fecha) {
        const d = new Date(news.fecha);
        displayDate = d.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    return (
        <div
            onClick={() => navigate(`/noticias/${news.id}`)}
            className="group relative w-full h-full overflow-hidden cursor-pointer select-none"
        >
            {news.imagen ? (
                <img
                    src={news.imagen}
                    alt={news.titulo}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full bg-brand-dark flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                    <span className="text-gray-600 font-bold uppercase tracking-widest text-xs">Sin Portada</span>
                </div>
            )}

            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#152336] via-[#152336]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Hover overlay specific for FIP style (subtle blueish tint) */}
            <div className="absolute inset-0 bg-[#0e192c]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Top Badge (Dynamically colored based on category) */}
            <div
                className={`absolute top-0 left-0 px-3 py-1 ${isLarge ? 'text-sm px-4 py-2' : 'text-[10px] md:text-xs'} font-black uppercase tracking-wider text-white shadow-md`}
                style={{ backgroundColor: news.categoria_color || '#152336' }}
            >
                {news.categoria_nombre || 'AFORPA'}
            </div>

            {/* Bottom Content */}
            <div className={`absolute bottom-0 left-0 right-0 ${isLarge ? 'p-6 md:p-8 md:pb-8' : 'p-4 md:p-5 md:pb-6'} flex flex-col justify-end`}>
                <h3 className={`text-white font-black uppercase tracking-tight mb-2 group-hover:text-gray-200 transition-colors leading-tight ${isLarge ? 'text-xl md:text-3xl' : 'text-xs md:text-sm line-clamp-2'
                    }`}>
                    {news.titulo}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-300">
                    <Calendar size={isLarge ? 14 : 12} />
                    <span className={`${isLarge ? 'text-xs md:text-sm' : 'text-[9px] md:text-[10px]'} font-bold`}>{displayDate}</span>
                </div>
            </div>
        </div>
    );
};

const NewsSection = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await axios.get(`/api/noticias`);
                if (Array.isArray(res.data)) {
                    setNews(res.data);
                } else {
                    setNews([]);
                }
            } catch (error) {
                console.error("Error fetching news:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading || news.length === 0) {
        return null; // Don't show the section if there's no news
    }

    return (
        <section className="py-10 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section as in existing design, keeping it consistent with the overall site while making the grid custom */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 mb-2 block uppercase">Actualidad</span>
                        <h2 className="text-4xl md:text-5xl font-black text-brand-dark tracking-tighter italic uppercase">Últimas Noticias</h2>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 lg:h-[400px]">
                    {/* Left Column (Main Article) */}
                    <Reveal delay={0} threshold={0.1} className="w-full lg:w-1/2 h-[300px] lg:h-full">
                        <NewsCard news={news[0]} isLarge={true} />
                    </Reveal>

                    {/* Right Column (Focusing on next 4 articles if they exist) */}
                    {news.length > 1 && (
                        <div className="w-full lg:w-1/2 grid grid-cols-2 grid-rows-2 gap-4 h-[400px] lg:h-full">
                            {news.slice(1, 5).map((n, index) => (
                                <Reveal key={n.id} delay={(index + 1) * 150} threshold={0.1} className="h-full">
                                    <NewsCard news={n} />
                                </Reveal>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default NewsSection;
