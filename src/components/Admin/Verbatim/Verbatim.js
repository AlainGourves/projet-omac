import { useFormContext } from 'react-hook-form';

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
                >
                    <span className="material-icons">
                        clear
                    </span>
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
                    <span className="material-icons fs-1 text-primary">
                        add_circle
                    </span>
                </button>
            }
            </div>
        </>
    )
}

export default Verbatim;