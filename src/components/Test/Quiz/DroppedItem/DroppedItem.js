import { useDrag } from "react-dnd";
import { MoreVertical, XCircle } from "react-feather";

const DroppedItem = ({id, label, x, y, z}) => {
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
            data-label={label}
            data-id={id}
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