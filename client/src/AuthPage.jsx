import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import { BsFillPersonFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa6";

import './AuthPage.css'

export default function AuthPage({isSignIn}){
    const [isSignInState, setIsSignInState] = useState(isSignIn);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [err, setErr] = useState(false);

    const navigate = useNavigate();


    function handleChange(event){
        const {name, value} = event.target;
        setFormData((prevFormData)=>{
            return {...prevFormData, [name]: value}
        })
    }
    
    function toggleSignIn(){
        setIsSignInState(!isSignInState);
    }

    async function handleSignUp(event){
        event.preventDefault();
        try{
            const response = await fetch("http://localhost:8000/auth/signUp", {
                method: "POST",
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if(response.status === 200){
                setIsSignInState(true);
            }
        }
        catch(err){
            console.log(err)
        }
    }

    async function handleSignIn(event){
        event.preventDefault();
        try{
            const response = await fetch("http://localhost:8000/auth/signIn", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if(response.status === 200){
                const data = await response.json();
                localStorage.setItem('authToken', data.authToken);
                navigate('/');
            }
            else{
                setErr(true);
            }
        }
        catch(err){
            console.log(err)
        }
    }

    async function handleGoogleSignIn(){
        window.location.href = "http://localhost:8000/auth/google";
    }

    React.useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const token = query.get('token');
        
        if(token){
            localStorage.setItem('authToken', token);
            navigate('/');
        }
    }, [navigate]);

    return(
        <div className="auth-page-body">
            <div className={`auth-page-container ${isSignInState ? "right-panel-active" : ""}`}>
                
                <div className="form-container signUp-container">

                    <div className="logo-icon">
                        <a href="/" className="logo-link">
                            <img src="/reelcraft-high-resolution-logo-transparent.png" alt="logo" width={180} />
                        </a>
                    </div>

                    <form className="left-box-signUp" onSubmit={handleSignUp}>
                        <div className="head">SIGN UP</div>
                        <div className="input-with-icon-class">
                            <BsFillPersonFill/>
                            <input 
                                type="text" 
                                name="firstName"
                                className="registerInput"
                                placeholder="First Name" 
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-with-icon-class">
                            <BsFillPersonFill/>
                            <input 
                                type="text" 
                                name="lastName"
                                className="registerInput"
                                placeholder="Last Name" 
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-with-icon-class">
                            <MdEmail/>
                            <input 
                                type="email" 
                                name="email"
                                className="registerInput"
                                placeholder="Email" 
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-with-icon-class">
                            <FaLock/>
                            <input 
                                type="password" 
                                name="password"
                                className="registerInput"
                                placeholder="Password" 
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        
                        
                        <button className="btn auth-btn">SIGN-UP</button>
                        {err &&
                            <p className="error">You credentials are invalid please try again</p>
                        }

                        <div className="divider-signUp-page">
                            <div className="divider-line"></div>
                            <p className="dividerText dividerTextAuthPage">Or Sign-In using</p>
                        </div>

                        <div className="signIn-with-google" onClick={handleGoogleSignIn}>
                            <img src="/google-logo.png" alt="" width={28}/>
                            <div className="text">Google</div>
                        </div>

                    </form>
                </div>

                        
                <div className="form-container signIn-container">
                    <form className="right-box-signIn" onSubmit={handleSignIn}>
                        
                        <div className="head">SIGN IN</div>
                        <div className="input-with-icon-class">
                            <MdEmail/>
                            <input 
                                type="email" 
                                name="email"
                                className="registerInput"
                                placeholder="Email" 
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-with-icon-class">
                            <FaLock/>
                            <input 
                                type="password" 
                                name="password"
                                className="registerInput"
                                placeholder="Password" 
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <button className="btn auth-btn">SIGN-IN</button>

                        {err &&
                            <p className="error">You credentials are invalid please try again</p>
                        }
                        <div className="divider-signIn-page">
                            <div className="divider-line"></div>
                            <p className="dividerText dividerTextAuthPage">Or Sign-In using</p>
                        </div>

                        <div className="signIn-with-google" onClick={handleGoogleSignIn}>
                            <img src="/google-logo.png" alt="" width={28}/>
                            <div className="text">Google</div>
                        </div>
                    </form>

                </div>

                <div className="overlay-container">
                    <div className="overlay">

                        <div className="overlay-panel overlay-panel-left">
                            <div className="logo-icon">
                                <a href="/" className="logo-link">
                                    <img src="/reelcraft-high-resolution-logo-white-transparent.png" alt="logo" width={180} />
                                </a>
                            </div>
                            <div className="head-msg">Welcome back to ReelCraft !</div>
                            <div className="sub-msg">Are you new here? </div>
                            <button onClick={toggleSignIn} className="btn toggle-btn">Click Here to Sign-Up</button>
                        </div>


                        <div className="overlay-panel overlay-panel-right">

                            <div className="head-msg">Let's craft some amazing things together !</div>
                            <div className="sub-msg">Already have an account? </div>
                            <button onClick={toggleSignIn} className="btn toggle-btn">Click Here to Sign-In</button>
                        </div>


                        
                    </div>
                </div>
            </div>
        </div>
    )
}