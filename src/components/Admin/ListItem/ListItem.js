import { useDrag } from "react-dnd";
import { MoreVertical } from 'react-feather';

function ListItem(props) {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: "listItem",
        item: {
            id: props.id,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    }));

    const removeItem = (idx) => {
        props.removeFromDropped(idx);
    }

    return (
        <li
            ref={dragRef}
            data-id={props.id}
            className={`list-group-item d-flex ${isDragging ? 'disabled' : ''}`}
        >
            <MoreVertical className='grab' />
            {props.title}
        </li>
    )
}

export default ListItem;