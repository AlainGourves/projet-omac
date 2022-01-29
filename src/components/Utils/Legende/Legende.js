import './legende.scss';
import { useState, useRef } from 'react';
import { HelpCircle, ArrowUpLeft } from 'react-feather';

const Legende = (props) => {
    const aideRef = useRef();
    const [aideOpen, setAideOpen] = useState(false);

    const clickBtn = (ev) => {
        aideRef.current.classList.toggle('opened');
        setAideOpen(aideRef.current.classList.contains('opened'))
    }

    console.log("props",props.legendeContent)

    return (
        <dl className="aide__bubble alert alert-info" ref={aideRef}>
            {
                props.legendeContent.map((li, idx) => (
                    <div key={idx}>
                    <dt>{li.icon}</dt>
                <dd>{li.text}</dd>
                    </div>
                ))
            }
            <button
                className='icon'
                onClick={clickBtn}>{aideOpen ? <ArrowUpLeft /> : <HelpCircle />}</button>
        </dl>
    )
}

export default Legende;