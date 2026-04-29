import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Calendar, Trophy, Target, Camera } from 'lucide-react';
import { useHeader } from '../../context/HeaderContext';

const UserProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const { setHeader } = useHeader();

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.dni) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`/api/auth/profile/${user.dni}`);
                setProfile(res.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
        setHeader('MI PERFIL', 'Información personal de tu cuenta.');
        return () => setHeader('', '');
    }, [user?.dni]);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('foto', file);

        setIsUploading(true);
        try {
            const res = await axios.post(`/api/auth/profile/${user.dni}/foto`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(prev => ({ ...prev, foto_perfil: res.data.foto_perfil }));
        } catch (err) {
            console.error('Error uploading photo:', err);
            alert('Error al subir la foto de perfil');
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const InfoItem = ({ icon: Icon, label, value }) => (
        <div className="flex items-start gap-3 py-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-gray-400" />
            </div>
            <div>
                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{label}</p>
                <p className="text-sm font-bold text-brand-dark mt-0.5">{value || '-'}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Profile Info */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-brand-dark p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <div className="relative group">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-black bg-white/10 border-4 border-brand-dark shadow-xl overflow-hidden transition-all duration-300`}>
                            {profile?.foto_perfil ? (
                                <img src={`${profile.foto_perfil}`} alt="Perfil" className="w-full h-full object-cover" />
                            ) : (
                                profile?.apellido?.charAt(0)?.toUpperCase() || 'U'
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col justify-center h-24">
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                            {profile ? `${profile.apellido}, ${profile.nombre}`.toUpperCase() : 'USUARIO'}
                        </h2>
                        <p className="text-white/60 text-sm font-medium mt-1">{profile?.email || ''}</p>
                    </div>

                    <div className="sm:ml-auto flex flex-col items-center sm:items-end gap-2">
                        <input type="file" id="photo-upload" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploading} />
                        <label 
                            htmlFor="photo-upload" 
                            className={`flex items-center gap-2 px-6 py-3 bg-white text-brand-dark font-black text-xs tracking-widest rounded-lg transition-all shadow-xl cursor-pointer uppercase ${isUploading ? 'opacity-50' : 'hover:bg-gray-100 hover:scale-105 active:scale-95'}`}
                        >
                            {isUploading ? (
                                <div className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Camera size={16} />
                            )}
                            {isUploading ? 'SUBIENDO...' : 'SUBIR FOTO DE PERFIL'}
                        </label>
                        <p className="text-[10px] font-black text-red-500 bg-white/10 px-3 py-1 rounded-full uppercase tracking-tighter animate-pulse border border-red-500/30">
                            Subir OBLIGATORIAMENTE foto de perfil
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1 divide-y md:divide-y-0 md:divide-x divide-gray-50">
                        <div className="space-y-1 pr-8">
                            <InfoItem icon={User} label="DNI" value={profile?.dni} />
                            <InfoItem icon={User} label="Sexo" value={profile?.sexo} />
                            <InfoItem icon={Calendar} label="Fecha de Nacimiento" value={profile?.fecha_nacimiento ? new Date(profile.fecha_nacimiento).toLocaleDateString('es-AR') : '-'} />
                            <InfoItem icon={Trophy} label="Nivel" value={profile?.nivel} />
                        </div>
                        <div className="space-y-1 px-8">
                            <InfoItem icon={Mail} label="Email" value={profile?.email} />
                            <InfoItem icon={Phone} label="Teléfono" value={profile?.telefono} />
                            <InfoItem icon={Phone} label="Tel. Alternativo" value={profile?.tel_alternativo} />
                            <InfoItem icon={Target} label="Brazo Hábil" value={profile?.brazo_habil} />
                        </div>
                        <div className="space-y-1 pl-8">
                            <InfoItem icon={MapPin} label="País" value={profile?.pais} />
                            <InfoItem icon={MapPin} label="Provincia" value={profile?.provincia} />
                            <InfoItem icon={MapPin} label="Localidad" value={profile?.localidad} />
                            <InfoItem icon={Target} label="Posición" value={profile?.posicion} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
