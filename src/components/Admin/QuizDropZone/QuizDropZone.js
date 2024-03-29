import './quiz-dropzone.scss';
import { useDrop } from 'react-dnd';
import DroppedItem from '../DroppedItem/DroppedItem';
import { useState, useEffect } from 'react';

const QuizDropZone = function ({ quizs, droppedQuizs, addToDropped, removeFromDropped }) {
    const [result, setResult] = useState(null);

    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: "listItem",
        drop: (item) => updateDropped(item.id),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    const updateDropped = (id) => {
        addToDropped(id)
    };
    
    useEffect(() => {
        if (droppedQuizs.length > 0) {
            setResult(droppedQuizs.map(id => quizs.find(q => q.id === id)));
            // setResult(quizs.filter(q => droppedQuizs.includes(q.id)));
        }else{
            setResult(null);
        }
    }, [quizs, droppedQuizs])
    
    return (
        <ul
            ref={dropRef}
            className={isOver ? "dropzone over" : "dropzone"}
        >
            {result && result.map(({ id, title, isUsed }) => (
                <DroppedItem
                    key={id}
                    id={id}
                    title={title}
                    isUsed={true}
                    removeFromDropped={removeFromDropped}
                />
            ))
            }
        </ul>
    )
}

export default QuizDropZone;
