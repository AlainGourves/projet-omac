import { useFormContext } from 'react-hook-form';
import { XCircle, PlusCircle } from 'react-feather';

function Verbatim(props) {
    const { register } = useFormContext();

    return (
        <>
            <div className="input-group">
                <span className="input-group-text text-end">Texte de l'intitulé :</span>
                <input
                    {...register(`verbatim.${props.count}.val`)}
                    className="form-control"
                />
                <span className="input-group-text">
                    <button
                        type="button"
                        className="btn"
                        onClick={() => {
                            props.removeVerbatim(props.count)
                        }}
                        title="Supprimer ce verbatim"
                    >
                        <XCircle />
                    </button>
                </span>
            </div>
            <div className="col-1 d-flex justify-content-center align-items-center">
                {props.isLast &&
                    <button
                        onClick={props.addVerbatim}
                        type="button"
                        className="btn"
                        title="Ajouter un nouveau verbatim"
                    >
                        <PlusCircle className='fs-1 text-primary' />
                    </button>
                }
            </div>
        </>
    )
}

export default Verbatim;