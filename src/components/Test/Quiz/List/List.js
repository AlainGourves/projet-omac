import './List.scss';
import Item from '../Item/Item';

function shuffleArray(arr) {
    // Fisher–Yates shuffle (plus efficace que d'utiliser simplement la fonction random())
    // ref : https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Array destructuring
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function List(props) {
    // Randomise l'ordre des items si `is_alpha` est false
    const list = (!props.is_alpha) ? shuffleArray(props.items.slice()) : props.items;


    return (
        <ul className="quiz-items-list">
            {list.map((li) => (
                <Item key={li.id} infos={li} />
            ))}
        </ul>
    );
}

export default List;