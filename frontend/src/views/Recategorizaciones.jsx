import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import axios from 'axios';

const CATEGORIAS = [
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

const getCategoryChange = (actual, anterior) => {
    if (!anterior) return null;
    const iActual = CATEGORIAS.indexOf(actual);
    const iAnterior = CATEGORIAS.indexOf(anterior);
    
    // Si no los encuentra en el array, no muestra nada
    if (iActual === -1 || iAnterior === -1) return null;
    
    if (iActual < iAnterior) return 'ascenso';
    if (iActual > iAnterior) return 'descenso';
    return null;
};

const Recategorizaciones = () => {
    const [jugadores, setJugadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMaintenance, setIsMaintenance] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jugadoresRes, configRes] = await Promise.all([
                    axios.get(`/api/jugadores`),
                    axios.get(`/api/configuraciones/mantenimiento`)
                ]);
                setJugadores(jugadoresRes.data);
                setIsMaintenance(configRes.data.mantenimiento);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isMaintenance && !loading) {
        return (
            <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-4 py-12 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                    <Activity size={500} strokeWidth={1} className="text-white" />
                </div>
                
                <div className="relative z-10 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-block p-4 bg-brand-primary/20 rounded-full mb-4">
                        <Activity className="text-brand-primary animate-pulse" size={64} />
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-tight">
                        Sistema en <span className="text-brand-primary">Mantenimiento</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
                        EN ESTE MOMENTO NO SE PUEDE VER LA PÁGINA WEB, ESTAMOS TRABAJANDO EN LAS RECATEGORIZACIONES.
                    </p>
                    
                    <div className="pt-8 flex flex-col items-center justify-center space-y-4">
                        <p className="text-sm font-black tracking-[0.2em] text-white/50 uppercase">
                            GRACIAS POR SU PACIENCIA
                        </p>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-20 animate-in fade-in duration-500">
            {/* Header section - Standard Dark Style */}
            <div className="bg-brand-dark text-white py-16 overflow-hidden relative">
                <div className="absolute top-1/2 right-0 -translate-y-1/2 p-10 opacity-5 pointer-events-none">
                    <Activity size={300} strokeWidth={1} />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-black tracking-[0.2em] uppercase border border-white/5 mb-4 inline-block">
                                TEMPORADA 2024
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight mb-4">
                                Historico de <span className="text-white/20 uppercase font-black tracking-tighter">Recategorizaciones</span>
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm text-white/60 font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-brand-primary rounded-md shadow-lg shadow-brand-primary/20">
                                        <ArrowUpRight size={14} className="text-white" />
                                    </div>
                                    <span>Ascensos y Descensos</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/40">
                                    <ArrowDownRight size={14} />
                                    <span>Registro Oficial</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                                            Jugador
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">
                                            Nivel Actual
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">
                                            Nivel Anterior
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">
                                            Última Act.
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {jugadores.map((jugador) => (
                                        <tr key={jugador.dni} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 relative">
                                                        {jugador.foto_perfil ? (
                                                            <img className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" src={`${jugador.foto_perfil}`} alt="" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-bold border-2 border-white shadow-sm uppercase">
                                                                {jugador.nombre.charAt(0)}{jugador.apellido.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-brand-dark uppercase">
                                                            {jugador.apellido}, {jugador.nombre}
                                                        </div>
                                                        {jugador.apodo && (
                                                            <div className="text-xs text-brand-primary font-medium tracking-wide">
                                                                "{jugador.apodo}"
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-light/30 text-brand-primary uppercase">
                                                    {jugador.nivel} CATEGORÍA
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center">
                                                    {getCategoryChange(jugador.nivel, jugador.nivel_anterior) === 'ascenso' && (
                                                        <div title="Ascendió de categoría" className="p-1.5 bg-green-50 text-green-600 rounded-full shadow-sm border border-green-100/50">
                                                            <ArrowUpRight strokeWidth={3} size={16} className="animate-in fade-in zoom-in-50" />
                                                        </div>
                                                    )}
                                                    {getCategoryChange(jugador.nivel, jugador.nivel_anterior) === 'descenso' && (
                                                        <div title="Descendió de categoría" className="p-1.5 bg-red-50 text-red-600 rounded-full shadow-sm border border-red-100/50">
                                                            <ArrowDownRight strokeWidth={3} size={16} className="animate-in fade-in zoom-in-50" />
                                                        </div>
                                                    )}
                                                    {getCategoryChange(jugador.nivel, jugador.nivel_anterior) === null && (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {jugador.nivel_anterior ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 uppercase">
                                                        {jugador.nivel_anterior} CATEGORÍA
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-medium">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-medium text-gray-500">
                                                {jugador.fecha_recategorizacion 
                                                    ? new Date(jugador.fecha_recategorizacion).toLocaleDateString('es-AR')
                                                    : '-'
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                    {jugadores.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                                                No hay jugadores registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recategorizaciones;
