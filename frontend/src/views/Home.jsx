import HeroCarousel from '../components/HeroCarousel';
import NewsSection from '../components/NewsSection';
import FeaturedSections from '../components/FeaturedSections';
import CurrentEvents from '../components/CurrentEvents';
import Reveal from '../components/Reveal';
import Sponsors from '../components/Sponsors';
import CommentsSlider from '../components/CommentsSlider';

const Home = () => {
    return (
        <div className="animate-in fade-in duration-1000">
            <HeroCarousel />

            <FeaturedSections />
            
            <Reveal>
                <CurrentEvents />
            </Reveal>

            {/* Additional sections can be added here */}
            <NewsSection />

            <Sponsors />
            <CommentsSlider />
        </div>
    );
};

export default Home;
