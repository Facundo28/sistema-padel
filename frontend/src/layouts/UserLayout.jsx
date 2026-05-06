import { useState } from 'react';
import { Menu } from 'lucide-react';
import Navbar from '../components/Navbar';
import UserSidebar from '../components/UserSidebar';
import { useAuth } from '../context/AuthContext';
import { useHeader } from '../context/HeaderContext';

const UserLayout = ({ children }) => {
    const { user } = useAuth();
    const { headerData } = useHeader();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white flex flex-col overflow-hidden">
            <Navbar />
            <div className="flex flex-1 min-h-0 overflow-hidden">
                <UserSidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
                <main className="flex-1 flex flex-col bg-[#f8f9fa] min-w-0 overflow-hidden">
                    {/* Inner Header for Section Title */}
                    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 md:px-8 shrink-0">
                        <button 
                            className="md:hidden mr-4 p-2 text-brand-dark hover:bg-gray-50 rounded-lg"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu size={22} />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-sm font-black text-brand-dark uppercase tracking-tighter leading-tight">
                                {headerData.title || 'Panel de Control'}
                            </h2>
                            {headerData.subtitle && (
                                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest leading-tight mt-0.5">
                                    {headerData.subtitle}
                                </p>
                            )}
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-6xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
