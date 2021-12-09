import './quiz-list.scss';
import ListItem from '../ListItem/ListItem';

function QuizList(props) {
    return (
        <ul className="list-group">
            {
                props.items.map(({ id, title, isUsed }) => (
                    <ListItem key={id} id={id} title={title} />
                ))
            }
        </ul>
    )
}

export default QuizList;