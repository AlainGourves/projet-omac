import { Link } from "react-router-dom";

const Page404 = () => {
    return (
        <div>
            <h1>404</h1>

            <p>On reviendrait peut-être <Link to="/">en terrain connu ?</Link></p>
        </div>
    )
}

export default Page404;