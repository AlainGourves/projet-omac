import './quiz-list.scss';
import ListItem from '../ListItem/ListItem';

function QuizList({quizs}) {
    return (
        <ul className="list-group">
            {
                quizs.map(({ id, title, isUsed }) => (
                    !isUsed && <ListItem key={id} id={id} title={title} />
                ))
            }
        </ul>
    )
}

export default QuizList;