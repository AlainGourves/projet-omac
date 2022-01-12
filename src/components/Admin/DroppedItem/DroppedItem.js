import { XCircle } from 'react-feather';


function DroppedItem(props) {

    const removeItem = (idx) => {
        props.removeFromDropped(idx);
    }

    return (
        <li
            key={props.id}
            data-id={props.id}
            className={`list-group-item d-flex`}
        >
            {props.title}
            <button
                type="button"
                className="btn"
                onClick={() => removeItem(props.id)}
            >
                <XCircle />
            </button>
        </li>
    )
}

export default DroppedItem;