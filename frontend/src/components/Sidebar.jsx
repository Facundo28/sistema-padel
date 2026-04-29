import { LayoutDashboard, Trophy, Swords, LayoutGrid, ExternalLink, Menu, X, BarChart2, Calendar, MapPin, Image as ImageIcon, Star, MessageSquare, Users, FileText, MonitorPlay } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Trophy, label: 'Ranking', path: '/admin/ranking' },
        { icon: Swords, label: 'Torneos', path: '/admin/torneos' },
        { icon: Calendar, label: 'Calendario', path: '/admin/circuito' },
        { icon: MapPin, label: 'Sedes', path: '/admin/sedes' },
        { icon: MonitorPlay, label: 'Carteles', path: '/admin/carteles' },
        { icon: ImageIcon, label: 'Galería', path: '/admin/galeria' },
        { icon: Star, label: 'Sponsors', path: '/admin/sponsors' },
        { icon: MessageSquare, label: 'Comentarios', path: '/admin/comentarios' },
        { icon: FileText, label: 'Noticias', path: '/admin/noticias' },
        { icon: Users, label: 'Jugadores', path: '/admin/jugadores' },
        { icon: Users, label: 'Recategorías', path: '/admin/recategorizaciones' },
        { icon: LayoutGrid, label: 'Zonas', path: '/admin/zonas' },
        { icon: BarChart2, label: 'Puntos', path: '/admin/puntos' },
        { icon: Swords, label: 'Clasificación', path: '/admin/clasificacion' },
    ];

    return (
        <div className={`bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 relative flex flex-col h-screen transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
            <div className="p-6 flex items-center justify-between border-b border-gray-50/50">
                {isOpen && <h1 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">AFORPA</h1>}
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-brand-dark rounded-lg transition-colors">
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <nav className="flex-1 px-4 mt-6 space-y-1.5 overflow-y-auto custom-scrollbar pb-4">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-brand-dark text-white font-black shadow-md shadow-brand-dark/10'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-brand-dark font-black'
                                }`}
                        >
                            <item.icon size={18} className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-dark'}`} />
                            {isOpen && <span className="ml-3 text-[11px] uppercase tracking-wider">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100/50">
                <Link
                    to="/"
                    className="flex items-center w-full p-3 text-slate-500 hover:text-brand-dark hover:bg-slate-50 transition-colors rounded-xl group"
                >
                    <ExternalLink size={18} className="text-slate-400 group-hover:text-brand-dark transition-colors" />
                    {isOpen && <span className="ml-3 text-[11px] font-black uppercase tracking-wider">Ver Página</span>}
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
