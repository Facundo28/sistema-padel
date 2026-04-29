import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote, X } from 'lucide-react';
import Reveal from './Reveal';

const CommentsSlider = () => {
    const [comentarios, setComentarios] = useState([]);
    const [selectedComment, setSelectedComment] = useState(null);
    
    // Configuración
    const itemsToShow = 4; // Número de comentarios base relativos al diseño 

    useEffect(() => {
        const fetchComentarios = async () => {
            try {
                const response = await fetch(`/api/comentarios`);
                if (response.ok) {
                    const data = await response.json();
                    setComentarios(data);
                }
            } catch (error) {
                console.error('Error fetching comentarios:', error);
            }
        };

        fetchComentarios();
    }, []);

    if (comentarios.length === 0) {
        return null;
    }

    // Duplicate comments for infinite scroll if necessary to fill the CSS ticker
    // Make sure we have enough duplicates so the ticker doesn't run empty.
    let displayComments = [...comentarios];
    if (comentarios.length > 0) {
        // Multiplicamos por varios sets para asegurar smooth scroll
        displayComments = [...comentarios, ...comentarios, ...comentarios, ...comentarios]; 
    }

    return (
        <section className="py-24 bg-slate-50 border-t border-slate-200 overflow-hidden relative">
            <div className="max-w-[1400px] mx-auto px-4">
                <Reveal>
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-black tracking-[0.2em] text-brand-dark mb-4 block uppercase font-inter">Voces de la Comunidad</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter mb-6 uppercase">
                            LO QUE DICEN <span className="text-brand-dark italic">NUESTROS JUGADORES</span>
                        </h2>
                    </div>
                </Reveal>

                <div className="relative flex flex-col gap-8 w-full overflow-hidden">
                    {/* Slider Container - Ticker Style */}
                    <div className="relative overflow-hidden w-full">
                        {/* Overlay fade edges para efecto smooth infinito */}
                        <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

                        <div className="flex w-fit animate-scroll-left hover:[animation-play-state:paused] py-4">
                            {displayComments.map((comentario, index) => (
                                <div 
                                    key={`${comentario.id}-${index}`} 
                                    className="w-[280px] md:w-[320px] flex-shrink-0 mx-4 cursor-pointer transform hover:-translate-y-2 transition-transform duration-300"
                                    onClick={() => setSelectedComment(comentario)}
                                >
                                    <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] h-[320px] flex flex-col border border-slate-100/50 hover:border-brand-dark/30 hover:shadow-xl hover:shadow-brand-dark/5 transition-all relative group overflow-hidden">
                                        <div className="absolute top-[-10px] right-2 text-slate-50 group-hover:text-slate-100 transition-colors pointer-events-none rotate-6">
                                            <Quote size={100} strokeWidth={1} />
                                        </div>
                                        <div className="flex-grow z-10 mt-4 relative">
                                            <p className="text-slate-600 italic text-sm leading-relaxed line-clamp-6 font-medium">
                                                "{comentario.content}"
                                            </p>
                                            <span className="text-[10px] text-brand-dark font-black tracking-widest mt-4 inline-block uppercase group-hover:translate-x-1 transition-transform">
                                                Leer más...
                                            </span>
                                        </div>
                                        <div className="mt-auto pt-6 border-t border-slate-50 z-10 relative bg-white">
                                            <h4 className="font-black text-brand-dark uppercase tracking-wide text-sm">{comentario.author_name}</h4>
                                            <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 block">
                                                Jugador AFORPA
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para comentario completo */}
            {selectedComment && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedComment(null)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col relative animate-in zoom-in-95 duration-200 max-h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedComment(null)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-brand-dark hover:bg-slate-50 rounded-lg transition-colors z-20"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="absolute top-2 right-12 text-slate-100 pointer-events-none opacity-50 z-0">
                            <Quote size={80} strokeWidth={1} />
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="p-8 overflow-y-auto custom-scrollbar relative z-10 flex-1">
                            <p className="text-slate-700 italic text-base md:text-lg leading-relaxed mb-8 pr-4">
                                "{selectedComment.content}"
                            </p>
                        </div>
                        
                        {/* Fixed Footer Area */}
                        <div className="p-8 pt-0 border-t border-slate-100 bg-white rounded-b-2xl z-10 shrink-0">
                            <div className="mt-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-brand-dark font-black text-lg">
                                    {selectedComment.author_name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-black text-brand-dark uppercase tracking-wide text-base">{selectedComment.author_name}</h4>
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 block">
                                        Jugador AFORPA
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
};

export default CommentsSlider;
