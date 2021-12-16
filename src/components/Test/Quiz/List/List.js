import './List.scss';
import Item from '../Item/Item';



function List(props) {

    return (
        <ul className="quiz-items-list">
            {props.items.map((li) => (
                <Item key={li.id} infos={li} />
            ))}
        </ul>
    );
}

export default List;