import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import bgUrl from '../assets/landing-bg.png';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate('/login')}
            className="h-screen w-full flex flex-col items-center justify-end pb-12 cursor-pointer relative overflow-hidden bg-black bg-no-repeat bg-center"
            style={{
                backgroundImage: `url(${bgUrl})`,
                backgroundSize: 'contain' // Using contain to ensure the whole logo/text is visible without cropping
            }}
        >
            {/* Click Hint */}
            <p className="text-white text-sm tracking-[0.3em] font-mono animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] opacity-90 hover:opacity-100 transition-opacity">
                [ CLICK ANYWHERE TO ENTER ]
            </p>
        </div>



    );
}
