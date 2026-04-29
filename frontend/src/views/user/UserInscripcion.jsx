import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Trophy, Calendar, MapPin, Users, CheckCircle, XCircle, AlertTriangle, ClipboardList } from 'lucide-react';
import Toast from '../../components/Toast';
import { useHeader } from '../../context/HeaderContext';

// Category hierarchy: index 0 = highest, index 17 = lowest
const CATEGORIAS_ORDER = [
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

function getCategoryIndex(categoria) {
    const idx = CATEGORIAS_ORDER.indexOf(categoria);
    return idx === -1 ? 999 : idx;
}

function getShortCategory(cat) {
    return cat?.split('(')[1]?.replace(')', '') || cat;
}

const UserInscripcion = () => {
    const { user } = useAuth();
    const [torneos, setTorneos] = useState([]);
    const [misInscripciones, setMisInscripciones] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Fetch user profile to get their category
    const { setHeader } = useHeader();

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.dni) { setLoading(false); return; }
            try {
                const [profileRes, torneosRes, inscripcionesRes] = await Promise.all([
                    axios.get(`/api/auth/profile/${user.dni}`),
                    axios.get(`/api/torneos?estado=INSCRIPCIONES`),
                    axios.get(`/api/inscripciones/${user.dni}`)
                ]);
                setProfile(profileRes.data);
                setTorneos(torneosRes.data);
                setMisInscripciones(inscripcionesRes.data);

                if (profileRes.data) {
                    setHeader('INSCRIPCIÓN A TORNEOS', `Tu categoría: ${getShortCategory(profileRes.data.nivel)}`);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        return () => setHeader('', '');
    }, [user?.dni]);

    const handleInscribirse = async (torneoId) => {
        try {
            const res = await axios.post(`/api/inscripciones`, {
                torneo_id: torneoId,
                usuario_dni: user.dni
            });
            setToast({ type: 'success', message: res.data.msg });

            // Refresh data
            const [torneosRes, inscRes] = await Promise.all([
                axios.get(`/api/torneos?estado=INSCRIPCIONES`),
                axios.get(`/api/inscripciones/${user.dni}`)
            ]);
            setTorneos(torneosRes.data);
            setMisInscripciones(inscRes.data);
        } catch (err) {
            const msg = err.response?.data?.msg || 'Error al inscribirse';
            setToast({ type: 'error', message: msg });
        }
    };

    const handleCancelar = async (inscripcionId) => {
        try {
            await axios.put(`/api/inscripciones/${inscripcionId}/cancelar`);
            setToast({ type: 'success', message: 'Inscripción cancelada' });

            // Refresh
            const [torneosRes, inscRes] = await Promise.all([
                axios.get(`/api/torneos?estado=INSCRIPCIONES`),
                axios.get(`/api/inscripciones/${user.dni}`)
            ]);
            setTorneos(torneosRes.data);
            setMisInscripciones(inscRes.data);
        } catch (err) {
            setToast({ type: 'error', message: 'Error al cancelar la inscripción' });
        }
    };

    const userCatIndex = profile ? getCategoryIndex(profile.nivel) : 999;

    // Check if user is already registered for a tournament
    const isRegistered = (torneoId) => {
        return misInscripciones.some(i => i.torneo_id === torneoId && i.estado === 'CONFIRMADA');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Category Info Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm font-bold text-blue-700">Regla de Inscripción</p>
                    <p className="text-xs text-blue-600 mt-1">
                        Podés inscribirte a torneos de tu misma categoría (<strong>{getShortCategory(profile?.nivel)}</strong>) o de categoría superior (número menor). 
                        No es posible inscribirse a una categoría inferior.
                    </p>
                </div>
            </div>

            {/* Available Tournaments */}
            <div>
                <h2 className="text-lg font-black text-brand-dark tracking-tight mb-4 uppercase">Torneos Disponibles</h2>

                {torneos.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-12 text-center">
                        <ClipboardList size={40} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-brand-gray font-medium">No hay torneos disponibles en este momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {torneos.map(torneo => {
                            const torneoCatIndex = getCategoryIndex(torneo.categoria);
                            const canRegister = torneoCatIndex <= userCatIndex;
                            const alreadyRegistered = isRegistered(torneo.id);
                            const isFull = torneo.inscriptos >= torneo.cupo;

                            return (
                                <div key={torneo.id} className={`bg-white rounded-lg border shadow-sm overflow-hidden transition-all ${
                                    !canRegister ? 'border-red-100 opacity-75' : 'border-gray-100 hover:shadow-md'
                                }`}>
                                    {/* Tournament Header */}
                                    <div className={`px-5 py-3 flex items-center justify-between ${
                                        !canRegister ? 'bg-red-50' : alreadyRegistered ? 'bg-green-50' : 'bg-gray-50'
                                    }`}>
                                        <span className="px-2.5 py-1 text-[10px] font-black tracking-wider rounded-md bg-white border border-gray-200 text-brand-dark uppercase">
                                            {getShortCategory(torneo.categoria)}
                                        </span>
                                        {!canRegister && (
                                            <span className="text-[10px] font-black text-red-500 tracking-wider uppercase">Categoría no permitida</span>
                                        )}
                                        {alreadyRegistered && (
                                            <span className="text-[10px] font-black text-green-600 tracking-wider uppercase flex items-center gap-1">
                                                <CheckCircle size={12} /> Inscripto
                                            </span>
                                        )}
                                        {!canRegister === false && !alreadyRegistered && isFull && (
                                            <span className="text-[10px] font-black text-amber-500 tracking-wider uppercase">Completo</span>
                                        )}
                                    </div>

                                    {/* Tournament Body */}
                                    <div className="p-5 space-y-3">
                                        <h3 className="text-base font-black text-brand-dark uppercase tracking-tight">{torneo.nombre}</h3>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-brand-gray">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span className="font-medium">{new Date(torneo.fecha).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                            {torneo.ubicacion && (
                                                <div className="flex items-center gap-2 text-sm text-brand-gray">
                                                    <MapPin size={14} className="text-gray-400" />
                                                    <span className="font-medium">{torneo.ubicacion}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-brand-gray">
                                                <Users size={14} className="text-gray-400" />
                                                <span className="font-medium">{torneo.inscriptos || 0} / {torneo.cupo} inscriptos</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-2">
                                            {alreadyRegistered ? (
                                                <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 text-[11px] font-black tracking-widest rounded-lg border border-green-100 uppercase">
                                                    <CheckCircle size={14} /> Ya Inscripto
                                                </span>
                                            ) : !canRegister ? (
                                                <button 
                                                    disabled
                                                    className="w-full px-4 py-2.5 bg-gray-100 text-gray-400 text-[11px] font-black tracking-widest rounded-lg uppercase cursor-not-allowed"
                                                >
                                                    No disponible para tu categoría
                                                </button>
                                            ) : isFull ? (
                                                <button 
                                                    disabled
                                                    className="w-full px-4 py-2.5 bg-amber-50 text-amber-400 text-[11px] font-black tracking-widest rounded-lg border border-amber-100 uppercase cursor-not-allowed"
                                                >
                                                    Cupo Completo
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleInscribirse(torneo.id)}
                                                    className="w-full px-4 py-2.5 bg-brand-dark text-white text-[11px] font-black tracking-widest rounded-lg hover:bg-black transition-all shadow-lg shadow-black/10 uppercase"
                                                >
                                                    Inscribirme
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* My Registrations */}
            {misInscripciones.length > 0 && (
                <div>
                    <h2 className="text-lg font-black text-brand-dark tracking-tight mb-4 uppercase">Mis Inscripciones</h2>
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-50 bg-gray-50/50">
                                        <th className="text-left px-6 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Torneo</th>
                                        <th className="text-left px-6 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Categoría</th>
                                        <th className="text-left px-6 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Fecha</th>
                                        <th className="text-center px-6 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Estado</th>
                                        <th className="text-right px-6 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {misInscripciones.map(insc => (
                                        <tr key={insc.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-brand-dark">{insc.torneo_nombre}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-500 rounded border border-gray-200/50 uppercase">
                                                    {getShortCategory(insc.torneo_categoria)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-brand-gray">
                                                {new Date(insc.torneo_fecha).toLocaleDateString('es-AR')}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 text-[10px] font-black tracking-wider rounded-md ${
                                                    insc.estado === 'CONFIRMADA'
                                                        ? 'bg-green-50 text-green-600'
                                                        : 'bg-red-50 text-red-500'
                                                }`}>
                                                    {insc.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {insc.estado === 'CONFIRMADA' && (
                                                    <button
                                                        onClick={() => handleCancelar(insc.id)}
                                                        className="text-[10px] font-black tracking-widest text-red-400 hover:text-red-600 transition-colors uppercase"
                                                    >
                                                        Cancelar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserInscripcion;
