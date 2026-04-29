import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Users, Search, CheckCircle, XCircle, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import Toast from '../../components/Toast';
import { useHeader } from '../../context/HeaderContext';

const UserPareja = () => {
    const { user } = useAuth();
    const [dniBusqueda, setDniBusqueda] = useState('');
    const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
    const [parejaActual, setParejaActual] = useState(null);
    const [buscando, setBuscando] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [toast, setToast] = useState(null);

    const fetchPareja = async () => {
        try {
            const res = await axios.get(`/api/parejas/detalle/${user.dni}`);
            setParejaActual(res.data);
        } catch (err) {
            console.error('Error fetching partner:', err);
        } finally {
            setCargando(false);
        }
    };

    const { setHeader } = useHeader();

    useEffect(() => {
        if (user?.dni) fetchPareja();
        setHeader('MI PAREJA', 'Busca y vincúlate con tu pareja habitual para los torneos.');
        return () => setHeader('', '');
    }, [user?.dni]);

    const handleBuscar = async (e) => {
        e.preventDefault();
        if (!dniBusqueda) return;
        setBuscando(true);
        setUsuarioEncontrado(null);
        try {
            const res = await axios.get(`/api/parejas/buscar/${dniBusqueda}`);
            setUsuarioEncontrado(res.data);
        } catch (err) {
            setToast({ type: 'error', message: 'Usuario no encontrado' });
        } finally {
            setBuscando(false);
        }
    };

    const handleVincular = async () => {
        try {
            const res = await axios.post(`/api/parejas/vincular`, {
                user1_dni: user.dni,
                user2_dni: usuarioEncontrado.dni
            });
            setToast({ type: 'success', message: res.data.msg });
            setUsuarioEncontrado(null);
            setDniBusqueda('');
            fetchPareja();
        } catch (err) {
            const msg = err.response?.data?.msg || 'Error al vincular pareja';
            setToast({ type: 'error', message: msg });
        }
    };

    const handleDesvincular = async () => {
        if (!window.confirm('¿Estás seguro de que querés desvincularte de tu pareja?')) return;
        try {
            await axios.delete(`/api/parejas/${parejaActual.id}`);
            setToast({ type: 'success', message: 'Vínculo eliminado' });
            setParejaActual(null);
        } catch (err) {
            setToast({ type: 'error', message: 'Error al desvincular pareja' });
        }
    };

    if (cargando) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
            </div>
        );
    }

    const inputClass = "w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-dark/5 text-sm font-medium transition-all text-brand-dark";

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Current Partner Display */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h2 className="text-sm font-black text-brand-dark tracking-widest uppercase italic flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-500" /> Vínculo Actual
                    </h2>
                </div>
                <div className="p-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-brand-dark/5 flex items-center justify-center border-4 border-gray-50">
                        <Users size={40} className="text-brand-dark/20" />
                    </div>
                    <div className="flex-1 space-y-4">
                        {parejaActual ? (
                            <>
                                <div>
                                    <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">
                                        {parejaActual.apellido}, {parejaActual.nombre}
                                    </h3>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                        <span className="text-brand-gray font-medium">DNI: {parejaActual.dni}</span>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase tracking-widest">
                                            <CheckCircle size={12} /> USUARIO VALIDADO
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDesvincular}
                                    className="px-6 py-2.5 bg-red-50 text-red-500 text-[11px] font-black tracking-widest rounded-lg border border-red-100 hover:bg-red-100 transition-all uppercase flex items-center gap-2 mx-auto sm:mx-0"
                                >
                                    <UserMinus size={14} /> Desvincular Pareja
                                </button>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-brand-gray font-medium">No tienes ninguna pareja vinculada actualmente.</p>
                                <p className="text-xs text-gray-400">Busca a tu compañero por DNI abajo para crear el vínculo.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Section */}
            {!parejaActual && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-8 space-y-6">
                    <div>
                        <h2 className="text-sm font-black text-brand-dark tracking-widest uppercase italic">Buscar Pareja</h2>
                        <p className="text-xs text-brand-gray mt-1">Ingresa el DNI exacto de tu compañero.</p>
                    </div>

                    <form onSubmit={handleBuscar} className="relative group max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-dark transition-colors" size={20} />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ingresar DNI..."
                                value={dniBusqueda}
                                onChange={(e) => setDniBusqueda(e.target.value)}
                                className={inputClass}
                            />
                            <button
                                type="submit"
                                disabled={buscando || !dniBusqueda}
                                className="px-6 py-3 bg-brand-dark text-white rounded-lg font-black text-xs uppercase hover:bg-black transition-all disabled:opacity-50"
                            >
                                {buscando ? <Loader2 size={16} className="animate-spin" /> : 'BUSCAR'}
                            </button>
                        </div>
                    </form>

                    {usuarioEncontrado && (
                        <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-100 animate-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm text-brand-dark font-black">
                                        {usuarioEncontrado.nombre[0]}{usuarioEncontrado.apellido[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-brand-dark uppercase tracking-tight">
                                            {usuarioEncontrado.apellido}, {usuarioEncontrado.nombre}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-xs text-brand-gray font-medium">DNI: {usuarioEncontrado.dni}</span>
                                            <CheckCircle size={10} className="text-green-500" />
                                            <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">VALIDADO</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleVincular}
                                    className="flex items-center gap-2 px-6 py-3 bg-brand-dark text-white text-[11px] font-black tracking-widest rounded-lg hover:bg-black transition-all shadow-lg shadow-black/10 uppercase"
                                >
                                    <UserPlus size={16} /> Vincular
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserPareja;
