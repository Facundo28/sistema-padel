import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';

const RegisterForm = ({ onSuccess }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        dni: '',
        password: '',
        apellido: '',
        nombre: '',
        email: '',
        sexo: '',
        nivel: '',
        telefono: '',
        tel_alternativo: '',
        fecha_nacimiento: '',
        pais: 'Argentina',
        provincia: '',
        localidad: '',
        instagram: '',
        facebook: '',
        x: '',
        brazo_habil: '',
        posicion: ''
    });

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [localidades, setLocalidades] = useState([]);
    const [loadingLocalidades, setLoadingLocalidades] = useState(false);

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

    const provincias = [
        'Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 
        'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 
        'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 
        'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'provincia') {
            setFormData({ ...formData, [name]: value, localidad: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Fetch localities when province changes
    useEffect(() => {
        const fetchLocalidades = async () => {
            if (!formData.provincia) {
                setLocalidades([]);
                return;
            }
            setLoadingLocalidades(true);
            try {
                const res = await axios.get(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${formData.provincia}&max=1000&campos=nombre`);
                const sortedLocalidades = res.data.localidades
                    .map(l => l.nombre)
                    .sort((a, b) => a.localeCompare(b));
                setLocalidades([...new Set(sortedLocalidades)]); // Remove duplicates and sort
            } catch (err) {
                console.error('Error fetching localities:', err);
                setLocalidades([]);
            } finally {
                setLoadingLocalidades(false);
            }
        };
        fetchLocalidades();
    }, [formData.provincia]);

    // Update categoria (nivel) based on selected gender
    useEffect(() => {
        if (formData.sexo === 'Masculino') {
            setFormData(prev => ({ ...prev, nivel: 'Caballeros Octava (8va C)' }));
        } else if (formData.sexo === 'Femenino') {
            setFormData(prev => ({ ...prev, nivel: 'Damas Octava (8va D)' }));
        }
    }, [formData.sexo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setToast(null);
        try {
            const res = await axios.post(`/api/auth/register`, formData);
            setToast({ type: 'success', message: '¡Cuenta creada con éxito!' });

            // Auto login after register
            setTimeout(() => {
                login({
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    role: res.data.role
                });
                onSuccess();
            }, 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0]?.msg || 'Error al registrar usuario';
            setToast({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-dark/5 text-sm font-medium transition-all";
    const labelClass = "block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 ml-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Sección 1: Datos Personales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-black tracking-widest text-brand-dark">01. DATOS PERSONALES</h3>
                </div>
                <div>
                    <label className={labelClass}>DNI</label>
                    <input required name="dni" value={formData.dni} onChange={handleChange} className={inputClass} placeholder="Ej: 12345678" />
                </div>
                <div>
                    <label className={labelClass}>Contraseña</label>
                    <input required type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="Mínimo 6 caracteres" />
                </div>
                <div>
                    <label className={labelClass}>Apellido</label>
                    <input required name="apellido" value={formData.apellido} onChange={handleChange} className={inputClass} placeholder="Escriba su apellido" />
                </div>
                <div>
                    <label className={labelClass}>Nombre</label>
                    <input required name="nombre" value={formData.nombre} onChange={handleChange} className={inputClass} placeholder="Escriba su nombre" />
                </div>
                <div>
                    <label className={labelClass}>Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="ejemplo@correo.com" />
                </div>
                <div>
                    <label className={labelClass}>Fecha de Nacimiento</label>
                    <input required type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Sexo</label>
                    <select required name="sexo" value={formData.sexo} onChange={handleChange} className={inputClass}>
                        <option value="">Seleccionar...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Teléfono</label>
                    <input name="telefono" value={formData.telefono} onChange={handleChange} className={inputClass} placeholder="Principal" />
                </div>
            </div>

            {/* Sección 2: Nivel y Juego */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-black tracking-widest text-brand-dark">02. CATEGORÍA Y JUEGO</h3>
                </div>
                <div className="col-span-full">
                    <label className={labelClass}>Nivel de Jugador (Automático)</label>
                    <select 
                        required 
                        name="nivel" 
                        value={formData.nivel} 
                        onChange={handleChange} 
                        className={`${inputClass} bg-gray-200/50 cursor-not-allowed text-gray-500`}
                        disabled
                    >
                        <option value="">Seleccione su Sexo primero...</option>
                        {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Brazo Hábil</label>
                    <select required name="brazo_habil" value={formData.brazo_habil} onChange={handleChange} className={inputClass}>
                        <option value="">Seleccionar...</option>
                        <option value="Derecho">Derecho</option>
                        <option value="Izquierdo">Izquierdo</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Posición Habitual</label>
                    <select required name="posicion" value={formData.posicion} onChange={handleChange} className={inputClass}>
                        <option value="">Seleccionar...</option>
                        <option value="Lado Derecho de la Cancha">Lado Derecho</option>
                        <option value="Lado Izquierdo de la Cancha">Lado Izquierdo</option>
                        <option value="Indistinto">Indistinto</option>
                    </select>
                </div>
            </div>

            {/* Sección 3: Residencia */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-full border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-black tracking-widest text-brand-dark">03. RESIDENCIA</h3>
                </div>
                <div>
                    <label className={labelClass}>País</label>
                    <input readOnly name="pais" value={formData.pais} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Provincia</label>
                    <select required name="provincia" value={formData.provincia} onChange={handleChange} className={inputClass}>
                        <option value="">Seleccionar...</option>
                        {provincias.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Localidad</label>
                    <select 
                        required 
                        name="localidad" 
                        value={formData.localidad} 
                        onChange={handleChange} 
                        className={`${inputClass} ${!formData.provincia ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!formData.provincia || loadingLocalidades}
                    >
                        <option value="">{loadingLocalidades ? 'Cargando...' : 'Seleccionar...'}</option>
                        {localidades.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
            </div>

            {/* Sección 4: Redes Sociales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-full border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-black tracking-widest text-brand-dark">04. REDES SOCIALES</h3>
                </div>
                <div>
                    <label className={labelClass}>Instagram</label>
                    <input name="instagram" value={formData.instagram} onChange={handleChange} className={inputClass} placeholder="@usuario" />
                </div>
                <div>
                    <label className={labelClass}>Facebook</label>
                    <input name="facebook" value={formData.facebook} onChange={handleChange} className={inputClass} placeholder="Perfil" />
                </div>
                <div>
                    <label className={labelClass}>X (Twitter)</label>
                    <input name="x" value={formData.x} onChange={handleChange} className={inputClass} placeholder="@usuario" />
                </div>
            </div>

            <div className="pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-brand-dark text-white font-black tracking-[0.2em] text-sm rounded-lg hover:bg-black/90 transition-all shadow-xl disabled:opacity-50 uppercase"
                >
                    {loading ? 'Procesando...' : 'Completar Registro'}
                </button>
            </div>
        </form>
    );
};

export default RegisterForm;
