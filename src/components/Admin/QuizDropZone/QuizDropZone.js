import './quiz-dropzone.scss';
import { useDrop } from 'react-dnd';
import ListItem from '../ListItem/ListItem';


const QuizDropZone = function (props) {
    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: "listItem",
        drop: (item) => updateLists(item),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    function updateLists(obj) {
        props.updateSourceItems(obj.id)
    }

    return (
        <ul
            ref={dropRef}
            className={isOver ? "dropzone over" : "dropzone"}
        >
            {(props.items.length > 0) &&
                props.items.map(({ id, title, isUsed }) => (
                    <ListItem 
                        key={id}
                        id={id}
                        title={title}
                        isUsed={isUsed}
                        updateDraggedItems={props.updateDraggedItems}
                    />
                ))
            }
        </ul>
    )
}

export default QuizDropZone;