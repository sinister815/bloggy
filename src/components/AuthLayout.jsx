import React from 'react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function Protected({ children, authentication = true }) {

    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {

        /*
        //more easy version of below code
        if(authStatus===true){
            navigate("/")
        }
        else if(authStatus===false){
            navigate("/login")
        }
            */

        /*
         * if authentication is true then it means that the user is logged in
           
         *or we could use,Alternative::-
          let authValue = authStatus === true ? true : false
          instead of authStatus !== authentication
        */


        if (authentication && authStatus !== authentication) {
            navigate("/login")
        }
        else if (!authentication && authStatus !== authentication) {
            navigate("/")
        }
        setLoader(false)
    }, [authStatus, navigate, authentication])

    return loader ? <h1>Loading...</h1> : <>{children}</>
}
