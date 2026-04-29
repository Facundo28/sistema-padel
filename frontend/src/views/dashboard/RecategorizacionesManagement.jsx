import { useState, useEffect } from 'react';
import { Search, Save, CheckCircle, AlertCircle, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
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

const RecategorizacionesManagement = () => {
    const [jugadores, setJugadores] = useState([]);
    const [filteredJugadores, setFilteredJugadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingParams, setUpdatingParams] = useState({ dni: null, status: null });
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [maintenanceLoading, setMaintenanceLoading] = useState(true);

    const fetchConfigAndPlayers = async () => {
        setLoading(true);
        setMaintenanceLoading(true);
        try {
            const [jugadoresRes, configRes] = await Promise.all([
                axios.get(`/api/jugadores`),
                axios.get(`/api/configuraciones/mantenimiento`)
            ]);
            setJugadores(jugadoresRes.data);
            setFilteredJugadores(jugadoresRes.data);
            setIsMaintenance(configRes.data.mantenimiento);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
            setMaintenanceLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigAndPlayers();
    }, []);

    useEffect(() => {
        const filtered = jugadores.filter(j => 
            `${j.nombre} ${j.apellido} ${j.dni}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredJugadores(filtered);
    }, [searchTerm, jugadores]);

    const handleToggleMaintenance = async () => {
        setMaintenanceLoading(true);
        try {
            const newStatus = !isMaintenance;
            await axios.post(`/api/configuraciones/mantenimiento`, { mantenimiento: newStatus });
            setIsMaintenance(newStatus);
        } catch (err) {
            console.error('Error toggling maintenance mode:', err);
        } finally {
            setMaintenanceLoading(false);
        }
    };

    const handleCategoryChange = (dni, newNivel) => {
        const updatedJugadores = jugadores.map(j => {
            if (j.dni === dni) {
                return { ...j, _newNivel: newNivel };
            }
            return j;
        });
        setJugadores(updatedJugadores);
    };

    const handleUpdateCategory = async (dni, newNivel) => {
        if (!newNivel) return;
        
        setUpdatingParams({ dni, status: 'loading' });
        try {
            await axios.put(`/api/jugadores/${dni}/nivel`, { nivel: newNivel });
            
            // Update local state to reflect change
            const updatedJugadores = jugadores.map(j => {
                if (j.dni === dni) {
                    return { ...j, nivel_anterior: j.nivel, nivel: newNivel, _newNivel: undefined };
                }
                return j;
            });
            setJugadores(updatedJugadores);
            setUpdatingParams({ dni, status: 'success' });
            
            setTimeout(() => {
                setUpdatingParams({ dni: null, status: null });
            }, 3000);
        } catch (err) {
            console.error('Error updating category:', err);
            setUpdatingParams({ dni, status: 'error' });
            setTimeout(() => {
                setUpdatingParams({ dni: null, status: null });
            }, 3000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Gestión de Recategorizaciones</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleToggleMaintenance}
                        disabled={maintenanceLoading}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-sm ${
                            isMaintenance 
                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                        } ${maintenanceLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {maintenanceLoading ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : isMaintenance ? (
                            <ShieldAlert size={16} />
                        ) : (
                            <ShieldCheck size={16} />
                        )}
                        <span className="hidden sm:inline">
                            {isMaintenance ? 'Mantenimiento Activo' : 'Mantenimiento Inactivo'}
                        </span>
                    </button>
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar jugador..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                                    Jugador
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">
                                    Categoría Actual
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">
                                    Nueva Categoría
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center flex-col items-center">
                                            <RefreshCw className="animate-spin text-brand-primary mb-2" size={24} />
                                            <span className="text-sm font-medium">Cargando jugadores...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredJugadores.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">
                                        No se encontraron jugadores.
                                    </td>
                                </tr>
                            ) : (
                                filteredJugadores.map((jugador) => (
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
                                                    <div className="text-xs text-gray-500">
                                                        DNI: {jugador.dni}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 uppercase">
                                                {jugador.nivel}
                                            </span>
                                            {jugador.nivel_anterior && (
                                                <div className="text-[10px] text-gray-400 mt-1 uppercase">
                                                    Ant: {jugador.nivel_anterior}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <select
                                                className="block w-full text-sm border-gray-200 rounded-lg focus:ring-brand-primary focus:border-brand-primary py-2 px-3 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                                                value={jugador._newNivel || jugador.nivel}
                                                onChange={(e) => handleCategoryChange(jugador.dni, e.target.value)}
                                            >
                                                {CATEGORIAS.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {updatingParams.dni === jugador.dni ? (
                                                updatingParams.status === 'loading' ? (
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600">
                                                        <RefreshCw className="animate-spin mr-1.5" size={14} />
                                                        GUARDANDO...
                                                    </span>
                                                ) : updatingParams.status === 'success' ? (
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-600">
                                                        <CheckCircle className="mr-1.5" size={14} />
                                                        GUARDADO
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600">
                                                        <AlertCircle className="mr-1.5" size={14} />
                                                        ERROR
                                                    </span>
                                                )
                                            ) : (
                                                <button
                                                    onClick={() => handleUpdateCategory(jugador.dni, jugador._newNivel)}
                                                    disabled={!jugador._newNivel || jugador._newNivel === jugador.nivel}
                                                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase ${
                                                        !jugador._newNivel || jugador._newNivel === jugador.nivel
                                                            ? 'hidden'
                                                            : 'bg-brand-dark text-white hover:bg-gray-800 shadow-sm'
                                                    }`}
                                                >
                                                    <Save size={14} className="mr-1.5" />
                                                    Actualizar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecategorizacionesManagement;
