import { useState, useEffect } from 'react';
import Reveal from './Reveal';
import axios from 'axios';

const Sponsors = () => {
    const [sponsorsRow1, setSponsorsRow1] = useState([]);
    const [sponsorsRow2, setSponsorsRow2] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                const res = await axios.get(`/api/sponsors`);
                const loadedSponsors = Array.isArray(res.data) ? res.data : [];
                
                // Split them into two rows for the animation
                const mid = Math.ceil(loadedSponsors.length / 2);
                let r1 = loadedSponsors.slice(0, mid);
                let r2 = loadedSponsors.slice(mid);
                
                // If there are very few sponsors, duplicate them so the animation doesn't break
                if (r1.length < 4) r1 = [...r1, ...r1, ...r1];
                if (r2.length < 4) r2 = [...r2, ...r2, ...r2];
                if (r2.length === 0) r2 = r1; // Fallback if 1 sponsor

                setSponsorsRow1([...r1, ...r1]);
                setSponsorsRow2([...r2, ...r2]);
            } catch (err) {
                console.error("Error fetching sponsors:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSponsors();
    }, []);

    if (!loading && sponsorsRow1.length === 0) return null;

    return (
        <section className="bg-brand-dark py-24 overflow-hidden border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                <Reveal>
                    <span className="text-[10px] font-black tracking-[0.4em] text-gray-500 mb-4 block uppercase">Quienes hacen esto posible</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">
                        NUESTROS <span className="text-gray-500">SPONSORS</span>
                    </h2>
                </Reveal>
            </div>

            <div className="relative flex flex-col gap-8">
                {/* Gradient Masks for smooth fading on edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-brand-dark to-transparent z-10 pointer-events-none"></div>

                {/* Top Row - Moves Left */}
                <div className="flex w-fit animate-scroll-left hover:[animation-play-state:paused] cursor-pointer">
                    {sponsorsRow1.map((sponsor, index) => (
                        <div 
                            key={`row1-${index}`} 
                            className="flex-shrink-0 w-48 mx-6 md:mx-10 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                        >
                            <div className="h-24 w-full flex items-center justify-center group transition-colors">
                                {sponsor.logo_path ? (
                                    <img src={`${sponsor.logo_path}`} alt={sponsor.name} className="max-w-full max-h-full object-contain drop-shadow-md" />
                                ) : (
                                    <span className="font-black text-gray-400 tracking-[0.2em] italic text-sm group-hover:text-white transition-colors">{sponsor.name}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Row - Moves Right */}
                <div className="flex w-fit animate-scroll-right hover:[animation-play-state:paused] cursor-pointer">
                    {sponsorsRow2.map((sponsor, index) => (
                        <div 
                            key={`row2-${index}`} 
                            className="flex-shrink-0 w-48 mx-6 md:mx-10 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                        >
                            <div className="h-24 w-full flex items-center justify-center group transition-colors">
                                {sponsor.logo_path ? (
                                    <img src={`${sponsor.logo_path}`} alt={sponsor.name} className="max-w-full max-h-full object-contain drop-shadow-md" />
                                ) : (
                                    <span className="font-black text-gray-400 tracking-[0.2em] italic text-sm group-hover:text-white transition-colors">{sponsor.name}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Sponsors;
