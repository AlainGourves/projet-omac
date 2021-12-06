import './admin.scss';
// import { useState } from 'react';
// import axios from 'axios';
// import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/Auth';

const Admin = function (props) {
    const { user } = useAuth();
    // const { user, sessionToken } = useAuth();

    // const url = process.env.REACT_APP_BACKEND_URL;
    console.log("from admin: ", user)

    // useEffect(() => {
    //     // Faire un POST qui contient le token de session (`sessionToken`)
    //     axios.post(url,
    //         {
    //             sessionToken,
    //         })
    //         .then((response) => {

    //             console.log("from admin:", response.data)
    //         })
    // }, [])


    return (
        <>
            <h1>Admin interface</h1>
        </>
    )

}

export default Admin