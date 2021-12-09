import './list-item.scss';
import { useDrag } from "react-dnd";

function ListItem(props) {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: "listItem",
        item: {
            id: props.id,
        },
        // end: (item, monitor) => {
        //     if (item && monitor.getDropResult()) {
        //         console.log("end drag item:", item)
        //     }
        // },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    }));

    const removeDraggedItem = (idx) => {
        props.updateDraggedItems(idx);
    }

    return (
        <li
            ref={dragRef}
            data-id={props.id}
            className={isDragging ? "list-group-item d-flex disabled" : "list-group-item d-flex"}
        >
            {!props.isUsed &&
                <span className="material-icons grab">
                    drag_indicator
                </span>
            }
            {props.title}
            {props.isUsed &&
                <button 
                    type="button"
                    className="btn"
                    onClick={() => removeDraggedItem(props.id)}
                >
                    <span className="material-icons">
                        clear
                    </span>
                </button>
            }
        </li>
    )
}

export default ListItem;