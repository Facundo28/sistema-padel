import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', duration = 2000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for hide animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const styles = {
        success: {
            bg: 'bg-white',
            border: 'border-green-100',
            text: 'text-green-600',
            icon: <CheckCircle2 size={20} className="text-green-500" />
        },
        error: {
            bg: 'bg-white',
            border: 'border-red-100',
            text: 'text-red-600',
            icon: <AlertCircle size={20} className="text-red-500" />
        }
    };

    const config = styles[type];

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
            }`}>
            <div className={`flex items-center gap-3 px-6 py-4 rounded-lg bg-white border ${config.border} shadow-2xl min-w-[300px]`}>
                <div className="flex-shrink-0">
                    {config.icon}
                </div>
                <div className="flex-grow">
                    <p className={`text-sm font-black tracking-tight uppercase italic ${config.text}`}>
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Toast;
