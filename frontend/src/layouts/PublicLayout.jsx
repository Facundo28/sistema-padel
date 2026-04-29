import Navbar from '../components/Navbar';

const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main>
                {children}
            </main>
            <footer className="bg-gray-50 border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-xl font-black tracking-tighter text-brand-dark">PADEL<span className="text-gray-400">PRO</span></span>
                    <p className="mt-4 text-gray-500 text-sm font-medium">© 2026 PadelPro Management. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
