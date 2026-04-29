import { useState, useEffect } from 'react';
import { Filter, ChevronDown, Trophy, Medal, Star } from 'lucide-react';
import axios from 'axios';

const Ranking = () => {
    // Filter states
    const [segmento, setSegmento] = useState('LIBRES');
    const [periodo, setPeriodo] = useState('CIRCUITO 2024');
    const [estado, setEstado] = useState('VIGENTES');
    const [categoria, setCategoria] = useState('Caballeros Primera (1ra C)');

    const categorias = [
        'Caballeros Primera (1ra C)',
        'Caballeros Segunda (2da C)',
        'Caballeros Tercera (3ra C)',
        'Caballeros Cuarta (4ta C)',
        'Caballeros Quinta (5ta C)',
        'Caballeros Sexta (6ta C)',
        'Caballeros Septima (7ma C)',
        'Caballeros Octava (8va C)',
        'Caballeros SIN Categorizar (Cab_SC)',
        'Damas Primera (1ra D)',
        'Damas Segunda (2da D)',
        'Damas Tercera (3ra D)',
        'Damas Cuarta (4ta D)',
        'Damas Quinta (5ta D)',
        'Damas Sexta (6ta D)',
        'Damas Septima (7ma D)',
        'Damas Octava (8va D)',
        'Damas SIN Categorizar (Dam_SC)'
    ];

    const segmentos = ['LIBRES', 'MENORES', 'VETERANOS'];
    const periodos = ['CIRCUITO 2023', 'CIRCUITO 2024', 'CIRCUITO 2025', 'CIRCUITO 2026'];
    const estados = ['VIGENTES', 'TODAS', 'NO VIGENTES'];

    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const params = new URLSearchParams();
                params.append('segmento', segmento);
                params.append('periodo', periodo);
                params.append('estado', estado);
                params.append('categoria', categoria);

                const res = await axios.get(`/api/ranking?${params.toString()}`);
                setRankingData(res.data);
            } catch (err) {
                console.error('Error fetching ranking:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, [segmento, periodo, estado, categoria]);

    const FilterItem = ({ label, value, options, onChange }) => (
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-1">
                {label}
            </label>
            <div className="relative group">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-100 px-4 py-3 rounded-lg text-xs font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/5 transition-all cursor-pointer uppercase tracking-wider"
                >
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-brand-dark transition-colors" size={14} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 pb-20 animate-in fade-in duration-500">
            {/* Header section - Standard Dark Style */}
            <div className="bg-brand-dark text-white py-16 overflow-hidden relative">
                <div className="absolute top-1/2 right-0 -translate-y-1/2 p-10 opacity-5 pointer-events-none">
                    <Trophy size={300} strokeWidth={1} />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-black tracking-[0.2em] uppercase border border-white/5 mb-4 inline-block">
                                TEMPORADA 2024
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight mb-4">
                                Ranking <span className="text-white/20 uppercase font-black tracking-tighter">Oficial</span>
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm text-white/60 font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-yellow-400 rounded-md shadow-lg shadow-yellow-400/20">
                                        <Medal size={14} className="text-brand-dark" />
                                    </div>
                                    <span>Puntos Actualizados: Marzo 2024</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/40">
                                    <Star size={14} />
                                    <span>Circuito Federado</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                {/* Filters Bar */}
                <div className="bg-white p-6 rounded-lg shadow-xl shadow-black/[0.03] border border-gray-100 mb-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
                        <Filter size={14} className="text-brand-dark" />
                        <span className="text-[11px] font-black tracking-widest text-brand-dark uppercase">Filtros de Búsqueda</span>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <FilterItem label="Segmento" value={segmento} options={segmentos} onChange={setSegmento} />
                        <FilterItem label="Periodo" value={periodo} options={periodos} onChange={setPeriodo} />
                        <FilterItem label="Estado" value={estado} options={estados} onChange={setEstado} />
                        <FilterItem label="Categoría" value={categoria} options={categorias} onChange={setCategoria} />
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-lg shadow-xl shadow-black/[0.03] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase w-24">Posición</th>
                                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Jugador</th>
                                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase text-center">Categoría</th>
                                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase text-center">Puntos</th>
                                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase text-center">Estado</th>
                                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rankingData.length > 0 ? rankingData.map((row, index) => (
                                    <tr key={row.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black shadow-sm ${index === 0 ? 'bg-yellow-400 text-white' :
                                                    index === 1 ? 'bg-gray-300 text-white' :
                                                        index === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-dark/5 flex items-center justify-center border border-brand-dark/10">
                                                    <span className="text-[10px] font-black text-brand-dark opacity-40 uppercase">
                                                        {row.apellido?.charAt(0)}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-black text-brand-dark uppercase tracking-tight">{row.apellido}, {row.nombre}</span>
                                                {index <= 2 && <Star size={14} className="text-yellow-400 fill-yellow-400" />}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 bg-gray-100 text-[10px] font-black text-gray-500 rounded-md border border-gray-200/50">
                                                {row.categoria?.split('(')[1]?.replace(')', '') || row.categoria}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-sm font-black text-brand-dark tabular-nums tracking-tighter">
                                                {row.puntos?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex justify-center">
                                                <span className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black rounded-lg border uppercase tracking-widest ${
                                                    row.estado === 'VIGENTE' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'
                                                }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${row.estado === 'VIGENTE' ? 'bg-green-500' : 'bg-red-400'} animate-pulse`} />
                                                    {row.estado}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button className="text-[10px] font-black tracking-widest text-gray-400 hover:text-brand-dark transition-colors uppercase border-b border-transparent hover:border-brand-dark">
                                                Ver Perfil
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-12 text-center text-brand-gray">
                                            No se encontraron jugadores en esta categoría.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Placeholder */}
                    <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mostrando {rankingData.length} jugadores</span>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-400 hover:text-brand-dark transition-all uppercase">Anterior</button>
                            <button className="px-4 py-2 bg-brand-dark border border-brand-dark rounded-lg text-[10px] font-black text-white shadow-lg shadow-black/10 hover:bg-black transition-all uppercase">Siguiente</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ranking;
