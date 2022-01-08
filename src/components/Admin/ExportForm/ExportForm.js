import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AlertTriangle } from 'react-feather';


function ExportForm(props) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('')
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (props.startDate && props.endDate) {
            setStartDate(props.startDate.toFormat('yyyy-MM-dd'));
            setEndDate(props.endDate.toFormat('yyyy-MM-dd'));
        }
    }, [props.startDate, props.endDate]);

    useEffect(() => {
        const defaultValues = {
            'startDate': startDate,
            'endDate': endDate,
        }
        reset(defaultValues);
    }, [startDate, endDate, reset]);

    return (
        <div className={`card my-3 ${props.alert ? 'beware' : ''}`}>
            <h4 className="card-header">
                {props.alert && <AlertTriangle />}
                {props.title}
                {props.alert && <AlertTriangle />}
            </h4>
            <div className='card-body'>
                <form onSubmit={handleSubmit(props.submitFn)}>
                    {(props.startDate && props.endDate && props.diff && props.diff > 1) &&
                        <>
                        {props.body}
                            <div className='row mb-1'>
                                <strong>Sélection de l'intervalle :</strong>
                            </div>
                            <div className='row'>
                                <div className="col-md-5 mb-3">
                                    <div className='input-group'>
                                        <span className='input-group-text'>Début:</span>
                                        <input
                                            {...register("startDate")}
                                            type="date"
                                            min={startDate}
                                            max={endDate}
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-5 mb-3">
                                    <div className='input-group'>
                                        <span className='input-group-text'>Fin:</span>
                                        <input
                                            {...register("endDate")}
                                            type="date"
                                            min={startDate}
                                            max={endDate}
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                    <div className="d-flex justify-content-end pb-3">
                        <input
                            type="submit"
                            className="btn btn-primary"
                            value="Exporter"
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ExportForm;