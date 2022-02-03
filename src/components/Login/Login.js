import './login.scss';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import { ChevronLeft } from 'react-feather';
import { supabase } from '../../supabaseClient';
import FormConnect from './FormConnect/FormConnect';
import FormMagic from './FormMagic/FormMagic';
import Confirmation from './Confirmation/Confirmation';

const Login = function () {
    const [isPassword, setIsPassword] = useState(true); // Basculer entre email/password et magic link
    const [isSend, setIsSend] = useState(false); // Savoir si le magic link est envoyé
    const [magicLinkAddress, setMagicLinkAddress] = useState('');
    const [tooManyRequests, setTooManyRequests] = useState(false); // Afficher message si plus d'une demande de magic link en une minute

    // Get connexion function from the Auth context
    const { signIn, signOut } = useAuth();

    const changePasswordState = () => {
        setIsPassword(!isPassword);
    }

    const sendMagicLink = async (email) => {
        // Vérifie si l'adresse est dans annuaire
        try {
            const { data, error } = await supabase
                .from('annuaire')
                .select('email')
                .eq('email', email)
                .order('created_at', { ascending: false })
            // renvoit un array vide si pas de correspondance
            if (error) throw new Error(error.message);
            if (data.length) {
                // Envoi magic link
                try {
                    const { error } = await signIn({ email: email });
                    if (error) throw error;
                } catch (error) {
                    // sans doute erreur 429: 'Too Many Requests'
                    // une seule demande de magic link par minute autorisée
                    setTooManyRequests(true);
                }
            }
        } catch (error) {
        } finally {
            // Erreur silencieuse : même si l'adresse soumise n'est pas enregistrée dans `annuaire`, on fait comme si l'email était parti (Sécurité !)
            setIsSend(true);
            setMagicLinkAddress(email);
        }
    }

    return (
        <>
            <div className='login__container'>
                {isPassword &&
                    <FormConnect
                        changePasswordState={changePasswordState}
                    />
                }

                {(!isPassword && !isSend) &&
                    <FormMagic
                        changePasswordState={changePasswordState}
                        sendMagicLink={sendMagicLink}
                    />
                }

                {(!isPassword && isSend) &&
                    <Confirmation
                        email={magicLinkAddress}
                        tooManyRequests={tooManyRequests}
                    />
                }
            </div>

            {/* ------- Lien Retour à l'accueil -------------- */}
            <div className="login__home">
            <Link to='/' className='text-decoration-none'><ChevronLeft /></Link>
            <Link to='/' className='text-decoration-none'>Retour à l'accueil</Link>
            </div>
        </>
    )
}

export default Login;