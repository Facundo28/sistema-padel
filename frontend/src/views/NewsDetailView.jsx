import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, ChevronLeft } from 'lucide-react';
// Custom styles are applied via Tailwind Typography (prose) instead of Quill.

const NewsDetailView = () => {
    const { id } = useParams();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                const res = await axios.get(`/api/noticias/${id}`);
                setNews(res.data);
            } catch (error) {
                console.error('Error fetching news details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNewsDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="pt-32 pb-24 min-h-screen bg-white flex justify-center items-center">
                <p className="text-gray-400 font-medium">Cargando noticia...</p>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="pt-32 pb-24 min-h-screen bg-white flex flex-col justify-center items-center">
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">Noticia no encontrada</h2>
                <Link to="/" className="text-blue-600 hover:underline flex items-center gap-2">
                    <ChevronLeft size={16} /> Volver al Inicio
                </Link>
            </div>
        );
    }

    // Format date carefully
    let displayDate = news.fecha;
    if (news.fecha) {
        const d = new Date(news.fecha);
        // Add one day or use timezone offset to ensure consistency, but simple formatting is usually fine
        displayDate = d.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    return (
        <div className="bg-white min-h-screen pt-16 md:pt-20 pb-16 md:pb-24">
            <div className="max-w-4xl mx-auto px-6">
                
                {/* Title and Metadata */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-5xl font-black text-brand-dark uppercase tracking-tighter leading-[1.1] mb-6">
                        {news.titulo}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-gray-500">
                        {news.categoria_nombre && (
                            <span 
                                className="px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase text-white rounded-sm shadow-sm"
                                style={{ backgroundColor: news.categoria_color || '#152336' }}
                            >
                                {news.categoria_nombre}
                            </span>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span className="text-sm font-bold uppercase">{displayDate}</span>
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                {news.imagen && (
                    <div className="mb-10 w-full bg-gray-50">
                        <img 
                            src={news.imagen} 
                            alt={news.titulo}
                            className="w-full h-auto max-h-[600px] object-cover rounded-sm shadow-sm"
                        />
                    </div>
                )}

                {/* Article Content Area */}
                <div 
                    className="ql-editor prose prose-lg prose-slate max-w-none 
                               prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-brand-dark
                               prose-p:text-gray-700 prose-p:leading-relaxed
                               prose-a:text-brand-light prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                               prose-img:rounded-sm prose-img:shadow-md"
                    dangerouslySetInnerHTML={{ __html: news.contenido_html }} 
                />
            </div>
        </div>
    );
};

export default NewsDetailView;
