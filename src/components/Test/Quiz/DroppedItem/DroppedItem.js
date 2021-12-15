import { MoreVertical, XCircle } from "react-feather";

const DroppedItem = ({id, label, x, y}) => {

    return (
        <div
            key={id}
            data-label={label}
            className='mapItem'
            style={{left: `${x}px`, top: `${y}px`,}}
        >
            <MoreVertical className='dragHandle' />
            <span>{label}</span>
            <XCircle className='mark' />
        </div>
    )
}

export default DroppedItem