import { AlertCircle } from 'react-feather';
import './alert-mess.scss';

const AlertMesg = (props) => {
    return (
        <div className="d-inline-flex gap-1 align-items-center alert alert-warning mt-2">
            <AlertCircle /> {props.message}
        </div>
    )
}

export default AlertMesg;