import { MoreVertical, XCircle } from "react-feather";

const DroppedItem = ({id, label, x, y, z}) => {

    return (
        <div
            key={id}
            data-label={label}
            data-id={id}
            className='mapItem'
            style={{left: `${x}%`, top: `${y}%`, zIndex: `${z +10}`, }}
        >
            <MoreVertical className='dragHandle' />
            <span>{label}</span>
            <XCircle className='mark' />
        </div>
    )
}

export default DroppedItem