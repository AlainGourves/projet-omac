import './legende.scss';
import { useState, useRef } from 'react';
import { Mail, User, HelpCircle, ArrowUpLeft } from 'react-feather';

const Legende = () => {
    const aideRef = useRef();
    const [aideOpen, setAideOpen] = useState(false);

    const clickBtn = (ev) => {
        aideRef.current.classList.toggle('opened');
        setAideOpen(aideRef.current.classList.contains('opened'))
    }

    return (
        <dl className="aide__bubble alert alert-info" ref={aideRef}>
            <div>
                <dt><Mail /></dt>
                <dd>une liste d'invitations est associée au test.</dd>
            </div>
            <div>
                <dt><User /></dt>
                <dd>un compte "visiteur" est associé au test.</dd>
            </div>
            <button
                className='icon'
                onClick={clickBtn}>{aideOpen ? <ArrowUpLeft /> : <HelpCircle />}</button>
        </dl>
    )
}

export default Legende;