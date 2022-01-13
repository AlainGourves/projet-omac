import { useDrag } from "react-dnd";
import { MoreVertical, XCircle } from "react-feather";

const DroppedItem = ({id, label, registeredX, registeredY, x, y, z}) => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: "droppedItem",
        item: {
            id: id,
            label: label,
            isUsed: true,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div
            key={id}
            data-id={id}
            data-label={label}
            data-position-x={registeredX}
            data-position-y={registeredY}
            ref={dragRef}
            className={`mapItem ${isDragging ? 'over':''}`}
            style={{left: `${x}%`, top: `${y}%`, zIndex: `${z +10}`, }}
        >
            <MoreVertical className='dragHandle' />
            <span>{label}</span>
            <XCircle className='mark' />
        </div>
    )
}

export default DroppedItem