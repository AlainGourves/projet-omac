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
        props.addToDropped(obj.id)
    }

    return (
        <ul
            ref={dropRef}
            className={isOver ? "dropzone over" : "dropzone"}
        >
            {(props.quizs.length > 0) &&
                props.quizs.map(({ id, title, isUsed }) => (
                    isUsed && <ListItem 
                        key={id}
                        id={id}
                        title={title}
                        isUsed={isUsed}
                        removeFromDropped={props.removeFromDropped}
                    />
                ))
            }
        </ul>
    )
}

export default QuizDropZone;