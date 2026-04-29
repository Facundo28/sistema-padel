import { Info, BarChart2, GitBranch, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, onAction }) => {
    const navigate = useNavigate();
    const actions = [
        { label: 'INFORMACIÓN GENERAL', icon: Info },
        { label: 'CLASIFICACIÓN', icon: BarChart2 },
        { label: 'LLAVE FINAL', icon: GitBranch },
        { label: 'PARTIDOS JUGADOS', icon: PlayCircle },
    ];

    return (
        <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-xl hover:shadow-2xl transition-all group">
            <div className="relative h-64 overflow-hidden">
                <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                    <span className={`px-4 py-1.5 backdrop-blur-md text-white text-[10px] font-black tracking-widest rounded-lg ${
                        event.estado === 'INSCRIPCIONES' ? 'bg-blue-600/70' :
                        event.estado === 'EN CURSO' ? 'bg-amber-600/70' :
                        'bg-gray-600/70'
                    }`}>
                        {event.estado || 'EN CURSO'}
                    </span>
                </div>
            </div>

            <div className="p-8">
                <h3 className="text-2xl font-black text-brand-dark tracking-tighter mb-6">{event.name}</h3>

                <div className="grid grid-cols-2 gap-3">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => {
                                if (action.label === 'CLASIFICACIÓN') {
                                    navigate(`/torneos/${event.id}/clasificacion`);
                                } else if (action.label === 'LLAVE FINAL') {
                                    navigate(`/torneos/${event.id}/llave`);
                                } else if (action.label.includes('INFORMACIÓN')) {
                                    navigate(`/torneos/${event.id}/info`);
                                } else if (onAction) {
                                    onAction(action.label, event);
                                }
                            }}
                            className="flex items-center justify-center gap-2 px-3 py-3 border border-gray-100 rounded-lg text-[10px] font-black tracking-tighter text-brand-dark hover:bg-gray-50 transition-colors"
                        >
                            <action.icon size={14} className="text-gray-400" />
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventCard;
