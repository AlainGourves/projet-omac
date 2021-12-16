import './map.scss';
import { forwardRef } from 'react';
import { useDrop } from 'react-dnd';
import DroppedItem from '../DroppedItem/DroppedItem';

const Map = forwardRef(({ answers, addAnswer }, mapRef) => {

    // mapRef : référence au DIV qui englobe Map pour pouvoir récupérer ses dimensions

    const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
        accept: "listItem",
        drop: (item, monitor) => {
            let dropped = monitor.getItem();
            let pos = monitor.getClientOffset(); // last recorded { x, y } client offset of the pointer
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

    return (
        <div ref={mapRef} className='quizMap__wrap'>
            <div
                className={(isOver) ? 'quizMap over' : 'quizMap'}
                ref={dropRef}
                style={{
                    backgroundColor: isOver ? 'purple' : ''
                }}
            >
                {answers.map((ans, idx) => (
                    <DroppedItem
                        key={ans.id}
                        id={ans.id}
                        label={ans.label}
                        x={ans.x}
                        y={ans.y}
                        z={idx}
                    />)
                )}
                <p>{canDrop ? 'Prêt' : 'Déposer ici'}</p>
            </div>
        </div>
    );
})

export default Map;