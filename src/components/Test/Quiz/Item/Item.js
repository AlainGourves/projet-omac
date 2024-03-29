// add drag support
import { useDrag } from 'react-dnd';
import { MoreVertical } from "react-feather";

function Item(props) {

    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: "listItem",
        item: {
            id: props.infos.id,
            label: props.infos.label,
            isUsed: props.infos.isUsed,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <li
            className="quiz-item"
            key={props.infos.id}
        >
            <div
                ref={dragRef}
                className={`quiz-item__label ${isDragging ? 'over':''}`}
                // data-id={props.infos.id}
            >
                <MoreVertical />{props.infos.label}
            </div>
        </li>
    );
}

export default Item;