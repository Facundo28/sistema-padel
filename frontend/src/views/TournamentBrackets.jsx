import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Trophy, ChevronLeft, Calendar, Clock, Loader2, User, MapPin, Users } from 'lucide-react';

const TournamentBrackets = () => {
    const { id } = useParams();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [torneo, setTorneo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bracketRes, torneosRes] = await Promise.all([
                    axios.get(`/api/torneos/${id}/bracket`),
                    axios.get(`/api/torneos`)
                ]);
                setMatches(bracketRes.data);
                
                const found = torneosRes.data.find(t => t.id === parseInt(id));
                setTorneo(found);
            } catch (error) {
                console.error("Error fetching bracket data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const phases = ['8VOS', '4TOS', 'SEMIFINAL', 'FINAL'];
    const phaseTitles = {
        '8VOS': '8° DE FINAL',
        '4TOS': '4° DE FINAL',
        'SEMIFINAL': 'SEMIFINAL',
        'FINAL': 'FINAL'
    };

    const groupedMatches = phases.reduce((acc, phase) => {
        const phaseMatches = matches.filter(m => m.fase === phase);
        if (phaseMatches.length > 0) {
            acc[phase] = phaseMatches.sort((a, b) => a.orden_fase - b.orden_fase);
        }
        return acc;
    }, {});

    const activePhases = phases.filter(p => groupedMatches[p]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-dark" size={40} />
            </div>
        );
    }

    const MatchCard = ({ match, isLastPhase }) => {
        const isBye = match.p2_player1 === 'Bye' || match.p2_player1 === '-';
        
        return (
            <div className="relative flex items-center group">
                <div className="w-[280px] bg-white border border-gray-400 shadow-md flex flex-col font-sans select-none overflow-hidden transition-all hover:border-blue-500">
                    {/* ID Header */}
                    <div className="text-[10px] text-blue-600 font-bold px-1.5 py-0.5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <span>{match.id || `#${match.orden_fase + 1}`}</span>
                        {match.state === 'JUGADO' && <span className="text-[9px] text-green-600 uppercase italic">JUGADO</span>}
                    </div>
                    
                    {/* Team 1 */}
                    <div className="flex border-b border-gray-300 min-h-[50px]">
                        <div className="w-8 flex items-center justify-center bg-gray-100 border-r border-gray-300 text-[9px] font-black text-brand-dark">
                            {match.p1_code || ''}
                        </div>
                        <div className="flex-1 p-1.5 flex flex-col justify-center">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800 leading-tight">
                                <User size={10} className="text-orange-400 fill-orange-400" /> {match.p1_player1}
                            </div>
                            {match.p1_player2 && (
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800 leading-tight">
                                    <User size={10} className="text-orange-400 fill-orange-400" /> {match.p1_player2}
                                </div>
                            )}
                        </div>
                        <div className="w-14 border-l border-gray-300 grid grid-cols-2">
                            <div className="flex items-center justify-center border-r border-gray-100 font-bold text-sm bg-white">
                                {match.score[0] ? match.score[0].split('-')[0] : ''}
                            </div>
                            <div className="flex items-center justify-center font-bold text-sm bg-white">
                                {match.score[1] ? match.score[1].split('-')[0] : ''}
                            </div>
                        </div>
                    </div>

                    {/* Team 2 */}
                    <div className="flex min-h-[50px]">
                        <div className="w-8 flex items-center justify-center bg-gray-100 border-r border-gray-300 text-[9px] font-black text-brand-dark">
                            {match.p2_code || ''}
                        </div>
                        <div className="flex-1 p-1.5 flex flex-col justify-center">
                            <div className={`flex items-center gap-1.5 text-[11px] font-bold ${isBye ? 'text-orange-600 italic' : 'text-gray-800'} leading-tight`}>
                                {!isBye && <User size={10} className="text-orange-400 fill-orange-400" />} {match.p2_player1 || 'A DEFINIR'}
                            </div>
                            {!isBye && match.p2_player2 && (
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800 leading-tight">
                                    <User size={10} className="text-orange-400 fill-orange-400" /> {match.p2_player2}
                                </div>
                            )}
                        </div>
                        <div className="w-14 border-l border-gray-300 grid grid-cols-2">
                            <div className="flex items-center justify-center border-r border-gray-100 font-bold text-sm bg-white">
                                {match.score[0] ? match.score[0].split('-')[1] : ''}
                            </div>
                            <div className="flex items-center justify-center font-bold text-sm bg-white">
                                {match.score[1] ? match.score[1].split('-')[1] : ''}
                            </div>
                        </div>
                    </div>

                    {/* Footer - Venue/Date */}
                    {(match.fecha_partido) && (
                        <div className="bg-[#f0f0f0] text-red-600 font-bold px-2 py-1 text-[10px] border-t border-gray-300 flex items-center gap-2">
                            <span className="truncate uppercase">{match.p1_localidad || 'Padel Guss'}</span>
                            <span className="whitespace-nowrap ml-auto">
                                {new Date(match.fecha_partido).toLocaleDateString('es-AR')} {new Date(match.fecha_partido).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    )}
                </div>

                {/* Connectors */}
                {!isLastPhase && (
                    <div className={`absolute left-[280px] w-12 h-full flex items-center`}>
                        <div className={`w-full h-full relative`}>
                            {/* Horizontal part from match */}
                            <div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-gray-400"></div>
                            
                            {/* Vertical connector */}
                            <div className={`absolute left-1/2 w-0.5 bg-gray-400 ${
                                match.orden_fase % 2 === 0 
                                    ? 'top-1/2 h-[calc(50%+24px)]' // Even matches go DOWN
                                    : 'bottom-1/2 h-[calc(50%+24px)]' // Odd matches go UP
                            }`}></div>
                            
                            {/* Horizontal part to next match (only for even pods) */}
                            {match.orden_fase % 2 === 0 && (
                                <div className="absolute top-[calc(100%+24px)] left-1/2 w-1/2 h-0.5 bg-gray-400"></div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white flex flex-col animate-in fade-in duration-500">
            <style>{`
                .bracket-grid {
                    display: flex;
                    padding: 60px 40px;
                    min-width: max-content;
                    background: white;
                    justify-content: center;
                }
                .bracket-wrapper {
                    background: white;
                    border: 1px solid rgba(0,0,0,0.05);
                    border-radius: 2rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.03);
                    margin: 40px;
                }
                .round-column {
                    display: flex;
                    flex-direction: column;
                    width: 380px; /* match width 280 + connector 100 approx */
                }
                .round-header {
                    color: #2563eb;
                    font-weight: 800;
                    font-size: 14px;
                    text-align: center;
                    margin-bottom: 40px;
                    letter-spacing: 0.1em;
                }
                .matches-list {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    flex: 1;
                    gap: 48px;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>

            {/* Header Section - Standard Dark Style */}
            {torneo && (
                <div className="bg-brand-dark text-white py-16 overflow-hidden relative">
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 p-10 opacity-5 pointer-events-none">
                        <Trophy size={300} strokeWidth={1} />
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                            <div>
                                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-black tracking-[0.2em] uppercase border border-white/5 mb-4 inline-block">
                                    LLAVE FINAL
                                </span>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-tight mb-4 max-w-3xl">
                                    {torneo.nombre}
                                </h1>
                                <div className="flex flex-wrap gap-6 text-sm text-white/60 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} className="text-white/40" />
                                        {new Date(torneo.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    {torneo.ubicacion && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={18} className="text-white/40" />
                                            {torneo.ubicacion}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Users size={18} className="text-white/40" />
                                        {torneo.categoria}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-x-auto custom-scrollbar">
                <div className="flex justify-center min-w-max">
                    {matches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Trophy className="text-gray-200 mb-6" size={64} />
                            <h2 className="text-xl font-black text-gray-400 uppercase italic">Llaves no generadas</h2>
                        </div>
                    ) : (
                        <div className="bracket-wrapper">
                            <div className="bracket-grid">
                                {activePhases.map((phase, phaseIdx) => (
                                    <div key={phase} className="round-column">
                                        <div className="round-header">{phaseTitles[phase]}</div>
                                        <div className="matches-list">
                                            {groupedMatches[phase].map((match) => (
                                                <MatchCard 
                                                    key={match.id} 
                                                    match={match} 
                                                    isLastPhase={phaseIdx === activePhases.length - 1}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TournamentBrackets;
