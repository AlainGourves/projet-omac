function TestList({ allTests }) {

    return (
        <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                Sélectionner le test
            </button>
            <ul className="dropdown-menu">
                {allTests.map(({ id, name, created_at }) => (
                    <li
                        key={id}
                    ><a href="/" className="dropdown-item">{name}</a></li>
                ))}
            </ul>
        </div>
    )
}

export default TestList;