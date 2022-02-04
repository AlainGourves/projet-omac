import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DateTime, Interval } from 'luxon';
import { AlertTriangle } from 'react-feather';


function ExportForm(props) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('')
    const { register, handleSubmit, reset, watch } = useForm();

    const watchStart = watch('startDate');
    const watchEnd = watch('endDate');

    const [resultsInInterval, setResultsInInterval] = useState(0);

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

    useEffect(() => {
        if (props.resultsDates.length > 1) {
            let interval = Interval.fromDateTimes(DateTime.fromISO(watchStart), DateTime.fromISO(watchEnd).plus({ days: 1 })); // ajoute un jour à la fin pour que toute la journée en question soit dans l'intervalle
            if (!interval.isValid && interval.invalidReason === 'end before start') {
                // l'intervalle n'est pas valide : `end` est antérieur à `start`
                interval = Interval.fromDateTimes(DateTime.fromISO(watchEnd), DateTime.fromISO(watchStart).plus({ days: 1 }));
            }
            const results = props.resultsDates.filter(date => interval.contains(date));
            setResultsInInterval(results.length);
        }
    }, [watchStart, watchEnd, props.resultsDates]);

    return (
        <div className={`card my-3 ${props.alert ? 'beware' : ''}`}>
            <h4 className="card-header">
                {props.alert && <span><AlertTriangle /></span>}
                <span>{props.title}</span>
                {props.alert && <span><AlertTriangle /></span>}
            </h4>
            <div className='card-body'>
                <form onSubmit={handleSubmit(props.submitFn)}>
                    {props.body}
                    {(props.diff && props.diff > 1) &&
                        <>
                            <div className='row mb-1'>
                                <strong>Sélection de l'intervalle :</strong>
                            </div>
                            <div className='row'>
                                <div className="col-md-6 col-lg-5 mb-3">
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
                                <div className="col-md-6 col-lg-5 mb-3">
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
                    <div className="d-flex  flex-column flex-lg-row justify-content-between align-items-center pb-3 gap-3">
                        <div>
                            {(props.diff && props.diff > 1) &&
                                <span className='alert alert-info'>
                                    <strong>{resultsInInterval}&nbsp;enregistrement{resultsInInterval > 1 ? 's' : ''}</strong>
                                </span>
                            }
                        </div>
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