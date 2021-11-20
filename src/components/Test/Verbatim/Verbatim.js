import './verbatim.scss';
import { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

function Verbatim(props) {
    let history = useHistory();
    
    const { id } = useParams();
    const verbatim = props.verbatim; // données des verbatim

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            response: ''
        }
    })

    // Routage
    let nextStep;
    if (parseInt(id) !== verbatim.length - 1) {
        // verbatim[id] n'est pas la dernière valeur du array
        nextStep = '/test/verbatim/' + (parseInt(id) + 1);
    } else {
        nextStep = '/test/fin'
    }

    const onSubmit = (values, ev) => {
        props.getVerbatimResponse(id, values.response);
        ev.target[0].value = ''; // vide le champ
        ev.target[0].focus(); // remet le focus dessus
        history.push(nextStep)
    }

    return (
        <div className="carte row text-center">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row mb-3">{verbatim[id]}</div>
                <div className="row mb-3">
                    <textarea
                        {...register("response")}
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