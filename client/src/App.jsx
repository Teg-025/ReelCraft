import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import HomePage from './HomePage';
import PreviewReelPage from "./PreviewReelPage";
import UploadVideoModal from "./UploadVideoPage";
import AuthPage from './AuthPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';


export default function App(){
    return(
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/uploadVideo" element={<UploadVideoModal />}/>
                    <Route path="/previewReel" element={<PreviewReelPage />}/>
                    <Route path="/auth/signIn" element={<AuthPage isSignIn={true}/>}/>
                    <Route path="/auth/signUp" element={<AuthPage isSignIn={false}/>} />
                </Routes>
                <ToastContainer
                    position = "bottom-right"
                    autoClose = {4000}
                    hideProgressBar
                    closeOnClick
                    pauseOnHover
                    draggable
                />
            </BrowserRouter>
        </div>
    )
}
