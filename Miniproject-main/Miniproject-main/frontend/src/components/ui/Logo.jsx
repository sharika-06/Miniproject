import { clsx } from 'clsx';
import logoUrl from '../../assets/neurograph-logo.png';

export function Logo({ className }) {
    return (
        <img
            src={logoUrl}
            alt="Neurograph Logo"
            className={clsx("object-contain", className)}
        />
    );
}
