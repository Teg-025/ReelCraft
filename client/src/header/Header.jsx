import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Header.css'

export default function Header(){

    const [isSignedIn, setIsSignedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        if(localStorage.getItem('authToken')){
            setIsSignedIn(true);
        }
        else{
            setIsSignedIn(false);
        }
    }, [])

    function handleSignOut(){
        localStorage.removeItem('authToken');
        setIsSignedIn(false);
        navigate('/');
    }

    return(
        <div className="navbar">
            <div className="left-navbar-box">
                <a href="/"><img src="/reelcraft-high-resolution-logo-transparent.png" alt="logo" width={180} /></a>
            </div>

            <div className="right-navbar-box">
                <a href="/uploadVideo">Create Reel</a>
                {
                    !isSignedIn
                    ?   <>
                            <a href="/auth/signUp">Sign Up</a>
                            <a href="/auth/signIn">Login</a>
                        </>
                    :   <>
                            <span onClick={handleSignOut}>Logout</span>
                        </>
                }
                
            </div>
        </div>
    )
}