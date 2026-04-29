import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, LogIn, Menu, X, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Reveal from './Reveal';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [modal, setModal] = useState({ open: false, type: null });
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);
    const navRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
            if (navRef.current && !navRef.current.contains(e.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleModal = (type = null) => {
        setModal({ open: !!type, type });
        if (isMenuOpen) setIsMenuOpen(false);
    };



    const navLinks = [
        { label: 'INICIO', to: '/' },
        {
            label: 'INSTITUCIONAL',
            to: '#',
            dropdown: [
                { label: 'QUIENES SOMOS', to: '/quienes-somos' },
                { label: 'REGLAMENTO', to: '/reglamento' },
                { label: 'DEJA TU OPINION', to: '/opinion' },
                { label: 'CONTACTO', to: '/contacto' },
            ]
        },
        { label: 'RECATEGORIZACIONES', to: '/recategorizaciones' },
        { label: 'JUGADORES', to: '/jugadores' },
        { label: 'RANKING', to: '/ranking' },
    ];

    // Get the currently active dropdown data
    const activeDropdownData = navLinks.find(link => link.label === activeDropdown);

    return (
        <>
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50" ref={navRef} onMouseLeave={() => setActiveDropdown(null)}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-black tracking-tighter text-brand-dark uppercase">AFORPA<span className="text-gray-400"></span></span>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden lg:flex items-center space-x-4">
                            {navLinks.map((link) => (
                                <div key={link.label}
                                    onMouseEnter={() => link.dropdown ? setActiveDropdown(link.label) : setActiveDropdown(null)}
                                >
                                    {link.dropdown ? (
                                        <span
                                            className={`px-3 py-2 text-[11px] font-black tracking-widest transition-colors flex items-center gap-1 uppercase cursor-default ${activeDropdown === link.label ? 'text-gray-400' : 'text-brand-dark hover:text-gray-400'
                                                }`}
                                        >
                                            {link.label}
                                            <ChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                                        </span>
                                    ) : (
                                        <Link
                                            to={link.to}
                                            className="px-3 py-2 text-[11px] font-black tracking-widest text-brand-dark hover:text-gray-400 transition-colors flex items-center gap-1 uppercase"
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="hidden lg:flex items-center space-x-3">
                            {!isAuthenticated ? (
                                <>
                                    <button
                                        onClick={() => toggleModal('login')}
                                        className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-black tracking-widest text-brand-dark hover:bg-gray-50 transition-colors rounded-lg border border-gray-200 uppercase"
                                    >
                                        <LogIn size={16} />
                                        INICIAR SESIÓN
                                    </button>
                                    <button
                                        onClick={() => toggleModal('register')}
                                        className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-black tracking-widest bg-brand-dark text-white hover:bg-black/90 transition-all rounded-lg shadow-lg shadow-black/5 uppercase"
                                    >
                                        <User size={16} />
                                        REGISTRARSE
                                    </button>
                                </>
                            ) : (
                                <div className="relative" ref={userDropdownRef}>
                                    <button
                                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                        className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center text-sm font-black uppercase hover:ring-4 hover:ring-brand-dark/10 transition-all overflow-hidden"
                                    >
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{user?.apellido?.charAt(0)?.toUpperCase() || 'U'}</span>
                                        )}
                                    </button>

                                    {userDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 shadow-xl py-2 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-xs font-black text-brand-dark uppercase tracking-wider">{user?.apellido ? `${user.apellido}, ${user.nombre}`.toUpperCase() : 'USUARIO'}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{user?.email || ''}</p>
                                            </div>
                                            <Link
                                                to="/control"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-gray-500 hover:bg-gray-50 hover:text-brand-dark transition-colors uppercase tracking-wider"
                                            >
                                                <LayoutDashboard size={15} />
                                                Panel de Control
                                            </Link>
                                            {user?.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-gray-500 hover:bg-gray-50 hover:text-brand-dark transition-colors uppercase tracking-wider"
                                                >
                                                    <Settings size={15} />
                                                    Panel Administrador
                                                </Link>
                                            )}
                                            <div className="border-t border-gray-100 mt-1 pt-1">
                                                <button
                                                    onClick={() => { logout(); setUserDropdownOpen(false); }}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-[10px] font-bold text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors uppercase tracking-wider"
                                                >
                                                    <LogOut size={15} />
                                                    Cerrar Sesión
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex lg:hidden items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-50"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Full-width Mega Dropdown */}
                {activeDropdownData && (
                    <div className="hidden lg:block absolute left-0 right-0 border-t border-gray-100 bg-white shadow-lg animate-in fade-in slide-in-from-top-1 duration-200 z-40">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                                {activeDropdownData.dropdown.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.to}
                                        onClick={() => setActiveDropdown(null)}
                                        className="px-4 py-2.5 text-[10px] font-black tracking-widest text-gray-500 hover:bg-gray-50 hover:text-brand-dark transition-colors uppercase rounded-lg"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-1 animate-slide-down">
                        {navLinks.map((link, index) => (
                            <Reveal key={link.label} delay={index * 50} threshold={0}>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <Link
                                            to={link.to}
                                            className="block px-3 py-3 text-sm font-black tracking-widest text-brand-dark hover:bg-gray-50 rounded-lg uppercase flex-1"
                                            onClick={(e) => {
                                                if (link.dropdown) {
                                                    e.preventDefault();
                                                    setActiveDropdown(activeDropdown === link.label ? null : link.label);
                                                } else {
                                                    setIsMenuOpen(false);
                                                }
                                            }}
                                        >
                                            {link.label}
                                        </Link>
                                        {link.dropdown && (
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === link.label ? null : link.label)}
                                                className="p-3 text-brand-dark hover:bg-gray-50 rounded-lg"
                                            >
                                                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}
                                    </div>
                                    {link.dropdown && activeDropdown === link.label && (
                                        <div className="pl-6 space-y-1 border-l-2 border-gray-50 ml-3 overflow-hidden transition-all animate-slide-down">
                                            {link.dropdown.map((item, subIndex) => (
                                                <Reveal key={item.label} delay={subIndex * 50} threshold={0}>
                                                    <Link
                                                        to={item.to}
                                                        className="block px-3 py-2 text-xs font-bold text-gray-400 hover:text-brand-dark uppercase"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                </Reveal>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Reveal>
                        ))}
                        <div className="pt-4 space-y-2">
                            {!isAuthenticated ? (
                                <>
                                    <button
                                        onClick={() => toggleModal('login')}
                                        className="w-full flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-black tracking-widest text-brand-dark bg-gray-50 rounded-lg uppercase"
                                    >
                                        <LogIn size={18} /> INICIAR SESIÓN
                                    </button>
                                    <button
                                        onClick={() => toggleModal('register')}
                                        className="w-full flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-black tracking-widest bg-brand-dark text-white rounded-lg uppercase"
                                    >
                                        <User size={18} /> REGISTRARSE
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/control"
                                        className="w-full flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-black tracking-widest text-brand-dark bg-gray-50 rounded-lg uppercase"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <LayoutDashboard size={18} /> Panel de Control
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            className="w-full flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-black tracking-widest bg-brand-dark text-white rounded-lg uppercase"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Settings size={18} /> Panel Administrador
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-black tracking-widest text-red-500 bg-red-50 rounded-lg uppercase"
                                    >
                                        <LogOut size={18} /> CERRAR SESIÓN
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <Modal
                isOpen={modal.open}
                onClose={() => toggleModal()}
                title={modal.type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                maxWidth={modal.type === 'login' ? 'max-w-md' : 'max-w-4xl'}
            >
                {modal.type === 'login' ? (
                    <LoginForm onSuccess={() => toggleModal()} />
                ) : (
                    <RegisterForm onSuccess={() => toggleModal()} />
                )}
            </Modal>
        </>
    );
};

export default Navbar;
