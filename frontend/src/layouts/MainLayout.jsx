import Sidebar from '../components/Sidebar';
import { useHeader } from '../context/HeaderContext';

const MainLayout = ({ children }) => {
    const { headerData } = useHeader();

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0 shadow-sm">
                    <div className="flex flex-col">
                        <h2 className="text-sm font-black text-brand-dark uppercase tracking-tighter leading-tight">
                            {headerData.title || 'Panel de Gestión'}
                        </h2>
                        {headerData.subtitle && (
                            <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] leading-tight mt-0.5">
                                {headerData.subtitle}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-5">
                        {headerData.action && (
                            <div className="flex items-center gap-5">
                                {headerData.action}
                                <div className="h-6 w-px bg-slate-200"></div>
                            </div>
                        )}
                        <div className="w-10 h-10 rounded-full bg-brand-dark flex flex-shrink-0 items-center justify-center text-white font-black text-sm shadow-md shadow-brand-dark/20 cursor-pointer hover:scale-105 transition-transform">
                            FA
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
