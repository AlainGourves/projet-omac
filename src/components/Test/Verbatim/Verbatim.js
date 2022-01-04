import './verbatim.scss';
import { useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {addToLocalStorage} from '../../Utils/helperFunctions';

function Verbatim({verbatim, ...props}) {
    let history = useHistory();
    
    const { id } = useParams();
    
    const { register, handleSubmit } = useForm({
        defaultValues: {
            response: ''
        }
    })
    
    // Routage :
    const nextStep = useRef('/test');
    useEffect(() => {
        if (id !== undefined) {
            if (parseInt(id) !== verbatim.length - 1) {
                // verbatim[id] n'est pas la dernière valeur du array
                nextStep.current = '/test/verbatim/' + (parseInt(id) + 1);
            } else {
                nextStep.current = '/test/fin'
            }
        }
    }, [id, verbatim]);

    const onSubmit = (values, ev) => {
        addToLocalStorage('verbatim', values.response);
        ev.target[0].value = ''; // vide le champ
        ev.target[0].focus(); // remet le focus dessus
        history.push(nextStep.current)
    }

    return (
        <div className="carte row text-center">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row mb-3">{verbatim[id]}</div>
                <div className="row mb-3">
                    <textarea
                        {...register("response")}
                        className='verbatim'
                        placeholder="Ta réponse..."
                    />
                </div>

                <div className="mb-3">
                    <button type='submit' className="btn btn-primary">Continuer</button>
                </div>
            </form>
        </div>);

}

export default Verbatim;