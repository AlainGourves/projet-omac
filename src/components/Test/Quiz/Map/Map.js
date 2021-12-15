import './map.scss';
import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import DroppedItem from '../DroppedItem/DroppedItem';

const Map = ({ answers, addAnswer }) => {

    const mapRef = useRef(); // référence au DIV qui englobe Map pour pouvoir récupérer ses dimensions

    const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
        accept: "listItem",
        drop: (item, monitor) => {
            let dropped = monitor.getItem();
            let pos = monitor.getClientOffset(); // last recorded { x, y } client offset of the pointer
            console.log(mapRef.current.getBoundingClientRect())
            addAnswer({
                ...dropped,
                ...pos,
            })
        },
        collect: (monitor) => ({
            item: monitor.getItem(),
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    function myFunc(ev) {
        const rect = ev.target.getBoundingClientRect();
        console.log("xMouse:", ev.clientX, "yMouse:", ev.clientY);
        console.log("x:", ev.clientX - rect.x, "y:", ev.clientY - rect.y);
    }

    return (
        <div ref={mapRef} className='quizMap__wrap'>
            <div
                className={(isOver) ? 'quizMap over' : 'quizMap'}
                ref={dropRef}
                onClick={myFunc}
                style={{
                    backgroundColor: isOver ? 'purple' : ''
                }}
            >
                {answers.map((ans) => (
                    <DroppedItem
                        key={ans.id}
                        id={ans.id}
                        label={ans.label}
                        x={ans.x}
                        y={ans.y}
                    />)
                )}
                <p>{canDrop ? 'Prêt' : 'Déposer ici'}</p>
            </div>
        </div>
    );
}

export default Map;