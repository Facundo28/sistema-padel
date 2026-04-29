import Navbar from '../components/Navbar';
import UserSidebar from '../components/UserSidebar';
import { useAuth } from '../context/AuthContext';
import { useHeader } from '../context/HeaderContext';

const UserLayout = ({ children }) => {
    const { user } = useAuth();
    const { headerData } = useHeader();

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <UserSidebar />
                <main className="flex-1 flex flex-col bg-[#f8f9fa] overflow-hidden">
                    {/* Inner Header for Section Title */}
                    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-8 shrink-0">
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
                    <div className="flex-1 overflow-y-auto p-8">
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
