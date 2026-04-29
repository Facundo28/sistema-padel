import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';

const LoginForm = ({ onSuccess }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        dni: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setToast(null);
        try {
            const res = await axios.post(`/api/auth/login`, formData);

            setToast({ type: 'success', message: '¡Sesión iniciada con éxito!' });

            setTimeout(() => {
                login({
                    dni: res.data.dni,
                    nombre: res.data.nombre,
                    apellido: res.data.apellido,
                    role: res.data.role
                });
                onSuccess();
            }, 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0]?.msg || 'Credenciales inválidas';
            setToast({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-dark/5 text-sm font-medium transition-all";
    const labelClass = "block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 ml-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div>
                <label className={labelClass}>DNI</label>
                <input required name="dni" value={formData.dni} onChange={handleChange} className={inputClass} placeholder="Ingrese su DNI" />
            </div>

            <div>
                <label className={labelClass}>Contraseña</label>
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="********" />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-brand-dark text-white font-black tracking-[0.2em] text-sm rounded-lg hover:bg-black/90 transition-all shadow-xl disabled:opacity-50 uppercase italic"
                >
                    {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                </button>
            </div>
        </form>
    );
};

export default LoginForm;
