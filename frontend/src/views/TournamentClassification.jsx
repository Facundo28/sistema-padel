import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, ChevronLeft, Calendar, MapPin, Users, Swords, Clock } from 'lucide-react';
import axios from 'axios';

const TournamentClassification = () => {
    const { id } = useParams();
    const [torneo, setTorneo] = useState(null);
    const [zones, setZones] = useState([]);
    const [inscriptos, setInscriptos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch tournament info
                const resT = await axios.get(`/api/torneos`);
                const found = resT.data.find(t => t.id === parseInt(id));
                setTorneo(found);

                // Fetch classification (zones, participants, matches)
                const resC = await axios.get(`/api/torneos/${id}/clasificacion`);
                setZones(resC.data.zonas || []);

                // Fetch all participants (inscriptions)
                const resI = await axios.get(`/api/torneos/${id}/inscriptos`);
                setInscriptos(resI.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!torneo) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-black text-brand-dark mb-4">Torneo no encontrado</h1>
                <Link to="/eventos" className="text-brand-gray hover:text-brand-dark font-bold underline transition-colors">
                    Volver a Eventos
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-brand-dark text-white py-16 overflow-hidden relative">
                <div className="absolute top-1/2 right-0 -translate-y-1/2 p-10 opacity-5 pointer-events-none">
                    <Trophy size={300} strokeWidth={1} />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div>
                            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-black tracking-[0.2em] uppercase border border-white/5 mb-4 inline-block">
                                CLASIFICACIÓN
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

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="space-y-8">
                    {zones.length > 0 ? (
                        zones.map((zone) => (
                        <div key={zone.id} className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                            {/* Table Column */}
                            <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h2 className="text-lg font-black text-brand-dark tracking-tighter uppercase italic flex items-center gap-2">
                                        <div className="w-6 h-6 bg-brand-dark text-white rounded flex items-center justify-center text-[10px] not-italic">
                                            {zone.id}
                                        </div>
                                        {zone.nombre}
                                    </h2>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest border border-gray-100 px-2 py-0.5 rounded-full">ESTADÍSTICAS</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-white">
                                                <th className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[150px]">Pareja</th>
                                                <th className="px-1 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">PJ</th>
                                                <th className="px-1 py-4 text-center text-[10px] font-black text-red-500 uppercase tracking-widest">PG</th>
                                                <th className="px-1 py-4 text-center text-[10px] font-black text-red-500 uppercase tracking-widest">PP</th>
                                                <th className="px-1 py-4 text-center text-[10px] font-black text-green-600 uppercase tracking-widest">SF</th>
                                                <th className="px-1 py-4 text-center text-[10px] font-black text-amber-500 uppercase tracking-widest">SC</th>
                                                <th className="px-1 py-4 text-center text-[10px] font-black text-green-600 uppercase tracking-widest">DS</th>
                                                <th className="px-1 py-4 text-center text-[10px] font-black text-blue-600 uppercase tracking-widest">GF</th>
                                                <th className="px-1 py-4 text-center text-[10px] font-black text-purple-600 uppercase tracking-widest">GC</th>
                                                <th className="px-1 py-4 text-center text-[10px] font-black text-blue-600 uppercase tracking-widest">DG</th>
                                                <th className="px-1 py-4 text-center text-[10px] font-black text-red-800 uppercase tracking-widest">STB</th>
                                                <th className="px-4 py-4 text-center text-[10px] font-black text-brand-dark uppercase tracking-widest">PTS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {zone.equipos.map((equipo, idx) => (
                                                <tr key={equipo.id} className="group hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-3 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded text-[10px] font-black transition-all ${
                                                                idx === 0 ? 'bg-amber-100 text-amber-600' :
                                                                idx === 1 ? 'bg-blue-100 text-blue-600' :
                                                                'bg-gray-100 text-gray-400'
                                                            }`}>
                                                                {idx + 1}
                                                            </span>
                                                            <div className="flex flex-col relative ml-7">
                                                                <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-brand-dark/5 border border-brand-dark/10 flex items-center justify-center text-[8px] font-black text-brand-dark">
                                                                    {equipo.code}
                                                                </div>
                                                                <p className="text-[10px] font-black text-brand-dark uppercase leading-tight group-hover:text-black transition-colors whitespace-nowrap">
                                                                    {equipo.player1}
                                                                </p>
                                                                <p className="text-[10px] font-black text-brand-dark uppercase leading-tight group-hover:text-black transition-colors whitespace-nowrap">
                                                                    {equipo.player2}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-4 text-center text-[10px] font-bold text-gray-600">{equipo.pj}</td>
                                                    <td className="px-1 py-4 text-center text-[10px] font-bold text-red-500">{equipo.pg}</td>
                                                    <td className="px-1 py-4 text-center text-[10px] font-bold text-red-500">{equipo.pp}</td>
                                                    <td className="px-1 py-4 text-center text-[10px] font-bold text-green-600">{equipo.sf}</td>
                                                    <td className="px-1 py-4 text-center text-[10px] font-bold text-amber-500">{equipo.sc}</td>
                                                    <td className="px-1 py-4 text-center text-[10px] font-bold text-green-600">{equipo.ds}</td>
                                                    <td className="px-1 py-4 text-center text-[10px] font-bold text-blue-600">{equipo.gf}</td>
                                                    <td className="px-1 py-4 text-center text-[10px] font-bold text-purple-600">{equipo.gc}</td>
                                                    <td className="px-1 py-4 text-center text-[10px] font-bold text-blue-600">{equipo.dg}</td>
                                                    <td className="px-1 py-4 text-center text-[10px] font-bold text-red-800">{equipo.stb}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="inline-block px-2 py-1 bg-gray-900 text-white rounded text-[10px] font-black tracking-tight shadow-md">
                                                            {equipo.pts}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Matches Column */}
                            <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden flex flex-col">
                                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="text-lg font-black text-brand-dark tracking-tighter uppercase italic flex items-center gap-2">
                                        <Swords size={20} className="text-brand-dark" />
                                        Detalle de Partidos
                                    </h3>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest border border-gray-100 px-2 py-0.5 rounded-full">ENFRENTAMIENTOS</span>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    {zone.partidos.map((match) => (
                                        <div key={match.id} className="bg-white border border-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-brand-dark/20 transition-all group">
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                                <div className="flex-1 text-center sm:text-right flex flex-col items-center sm:items-end">
                                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 italic">
                                                        {match.p1_localidad} {match.t1_code && <span className="text-gray-300 not-italic ml-1">[{match.t1_code}]</span>}
                                                    </p>
                                                    <div className="flex flex-col items-center sm:items-end gap-1">
                                                        <p className="text-[11px] font-black text-brand-dark uppercase leading-tight">{match.p1_player1}</p>
                                                        <p className="text-[11px] font-black text-brand-dark uppercase leading-tight">{match.p1_player2}</p>
                                                        {match.p1_status && (
                                                            <span className={`mt-1 text-[8px] font-black px-2 py-0.5 rounded-full ${
                                                                match.p1_status === 'GANADOR' ? 'bg-green-500 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm'
                                                            }`}>
                                                                {match.p1_status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col items-center gap-2 text-center">
                                                    <div className="px-3 py-2 bg-brand-dark rounded-lg border border-white/10 shadow-lg group-hover:scale-110 transition-transform flex flex-col items-center gap-1 min-w-[60px]">
                                                        {match.state === 'JUGADO' ? (
                                                            match.score.split(' / ').map((set, i) => (
                                                                <p key={i} className="text-sm font-black tracking-tighter italic text-white leading-none">
                                                                    {set}
                                                                </p>
                                                            ))
                                                        ) : (
                                                            <p className="text-sm font-black tracking-tighter italic text-white/40">VS</p>
                                                        )}
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                                                        match.state === 'JUGADO' ? 'text-green-500' : 'text-blue-500'
                                                    }`}>
                                                        {match.state}
                                                    </span>
                                                </div>

                                                <div className="flex-1 text-center sm:text-left flex flex-col items-center sm:items-start">
                                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 italic">
                                                        {match.p2_localidad} {match.t2_code && <span className="text-gray-300 not-italic ml-1">[{match.t2_code}]</span>}
                                                    </p>
                                                    <div className="flex flex-col items-center sm:items-start gap-1">
                                                        <p className="text-[11px] font-black text-brand-dark uppercase leading-tight">{match.p2_player1}</p>
                                                        <p className="text-[11px] font-black text-brand-dark uppercase leading-tight">{match.p2_player2}</p>
                                                        {match.p2_status && (
                                                            <span className={`mt-1 text-[8px] font-black px-2 py-0.5 rounded-full ${
                                                                match.p2_status === 'GANADOR' ? 'bg-green-500 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm'
                                                            }`}>
                                                                {match.p2_status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {match.fecha_original && (
                                                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-center gap-3">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-brand-gray uppercase tracking-widest">
                                                        <Calendar size={14} className="text-brand-dark/20" />
                                                        {new Date(match.fecha_original).toLocaleDateString('es-AR')}
                                                    </div>
                                                    <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-brand-gray uppercase tracking-widest">
                                                        <Clock size={14} className="text-brand-dark/20" />
                                                        {new Date(match.fecha_original).toTimeString().substring(0, 5)} HS
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <Users size={64} className="mx-auto text-gray-200 mb-6" />
                        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter mb-2">Aún no hay zonas definidas</h2>
                        <p className="text-brand-gray max-w-md mx-auto mb-10">El administrador está organizando los grupos. A continuación podés ver los jugadores confirmados.</p>
                        
                        {inscriptos.length > 0 && (
                            <div className="max-w-2xl mx-auto space-y-4 text-left">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Jugadores Confirmados ({inscriptos.length})</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {inscriptos.map((inc) => (
                                        <div key={inc.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-black text-brand-dark uppercase">{inc.apellido}, {inc.nombre}</p>
                                                <p className="text-[10px] font-bold text-brand-gray uppercase">{inc.nivel}</p>
                                            </div>
                                            {inc.pareja_apellido && (
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Pareja</p>
                                                    <p className="text-[11px] font-black text-brand-dark uppercase">{inc.pareja_apellido}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                </div>

                <div className="mt-20 pt-10 border-t border-gray-200 text-center">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] italic">
                        Los dos mejores equipos de cada zona pasan automáticamente a los Cuartos de Final
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TournamentClassification;
