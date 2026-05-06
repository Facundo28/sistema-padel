import { User, BarChart3, ClipboardList, Users, Menu, X, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const UserSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();

    const menuItems = [
        { icon: User, label: 'Mi Perfil', path: '/control' },
        { icon: BarChart3, label: 'Estadísticas', path: '/control/estadisticas' },
        { icon: ClipboardList, label: 'Inscripción', path: '/control/inscripcion' },
        { icon: Users, label: 'Pareja', path: '/control/pareja' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-brand-dark/20 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`
                fixed md:sticky top-0 md:top-20
                bg-white border-r border-gray-100 
                flex flex-col h-screen md:h-[calc(100vh-80px)] 
                transition-all duration-300 z-50 md:z-30 
                ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-64 md:w-20'}
            `}>
            <div className="p-6 flex items-center justify-between">
                {isOpen && <h1 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">MI CUENTA</h1>}
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="p-2 hover:bg-gray-50 rounded-lg text-brand-dark transition-colors"
                    title={isOpen ? "Contraer menú" : "Expandir menú"}
                >
                    {isOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            <nav className="flex-1 px-4 mt-2 space-y-1">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-brand-dark text-white font-bold shadow-md shadow-black/5'
                                : 'text-brand-gray hover:bg-gray-50 hover:text-brand-dark'
                                }`}
                        >
                            <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-dark'} />
                            {isOpen && <span className="ml-3 text-[11px] font-black uppercase tracking-wider">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <Link
                    to="/"
                    className="flex items-center w-full p-3 text-brand-gray hover:text-brand-dark transition-colors rounded-lg group"
                >
                    <ExternalLink size={18} className="text-gray-400 group-hover:text-brand-dark" />
                    {isOpen && <span className="ml-3 text-[11px] font-black uppercase tracking-wider">Ver Inicio</span>}
                </Link>
            </div>
        </div>
    </>
    );
};

export default UserSidebar;
