import React, { useState } from "react";
import Header from "./header/Header";
import { useNavigate } from "react-router-dom";
import { RiVideoUploadLine } from "react-icons/ri";
import { FaLink } from "react-icons/fa6";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import './UploadVideoPage.css';

export default function UploadVideoPage() {
    const [isYoutubeLinkClicked, setIsYoutubeLinkClicked] = useState(false);
    const [linkUpload, setLinkUpload] = useState("");
    const [isConfirmWindow, setIsConfirmWindow] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    function handleFileChange(event){
        let file = event.target.files[0]; 
        setSelectedFile(file);
        setIsConfirmWindow(true);
    }

    function confirmUploadFromLocal(){
        uploadVideoFromLocal();
    }

    async function uploadVideoFromLocal(){
        setIsLoading(true); 
        const formData = new FormData();
        formData.append("videoFile", selectedFile);
        let response, result, myReels;
        try{
            response = await fetch('http://localhost:8000/createReel/createFromLocal', {
                method: 'POST',
                body: formData,
            });
            result = await response.json();
            myReels = result.clippedFilenames;
        } 
        catch (error) {
            console.log('Error:', error);
        } 
        finally {
            if (response.ok) {
                console.log('Video converted');
                console.log(myReels)
                navigate('/previewReel', { state: { reels: myReels}})
            } else {
                console.log('Error converting video');
            }
            setIsLoading(false);
        }

    }

    async function uploadVideoFromUrl() {
        setIsLoading(true);
        let response, result, myReels;
        try {
            response = await fetch('http://localhost:8000/createReel/createFromUrl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // 'Authorization': `Bearer ${token}` // Uncomment if needed
                },
                body: JSON.stringify({ linkUpload })
            });

            result = await response.json();
            myReels = result.mergedFilenames;
        } catch (error) {
            console.log('Error:', error);
        } finally {
            if (response.ok) {
                console.log('Video converted');
                console.log(myReels)
                setIsYoutubeLinkClicked(false);
                navigate('/previewReel', { state: { reels: myReels}})
            } else {
                console.log('Error converting video');
            }
            setIsLoading(false);
        }
    }

    function handleLink(event) {
        setLinkUpload(event.target.value);
    }

    function handleYoutubeLinkClick() {
        setIsYoutubeLinkClicked(true);
    }

    function cancelUploadFromUrl() {
        setIsYoutubeLinkClicked(false);
    }

    function cancelUploadFromLocal(){
        setIsConfirmWindow(false);
        setSelectedFile(null);
    }

    return (
        <>
            <Header/>
            {isLoading ? (
                <div className="loadingScreen">
                    <div className="loader"></div>
                </div>
            ) : (
                !isYoutubeLinkClicked ? (
                    !isConfirmWindow ? (
                        <div className="addVideoModalContainer">
                            <div className="addVideoModal">
                                <div className="videoModalHead">Add a video to create reels</div>

                                <div className="uploadFromDevice">
                                    <label htmlFor="videoUpload" className="custom-video-upload">
                                        <div className="icon">
                                            <RiVideoUploadLine />
                                        </div>
                                        <span>Upload from your device</span>
                                        <div className="helpful-subs">(preffered option)</div>
                                    </label>
                                    <input 
                                        type="file" 
                                        id="videoUpload" 
                                        name="videoFile"
                                        onChange={handleFileChange} 
                                         accept="video/*"
                                    />
                                </div>

                                <div className="importVideo">
                                    <div className="custom-video-upload " onClick={handleYoutubeLinkClick}>
                                        <div className="icon">
                                            <FaLink />
                                        </div>
                                        <div className="importVideoDesc">YouTube link</div>
                                    </div>
                                </div>

                                <div className="divider">
                                    <p className="dividerText">Or import a video from</p>
                                </div>
                            </div>
                        </div>
                    )
                    : 
                    (
                        <div className="confirmWindow">
                            <div className="addVideoModal confirm-window-modal">
                                <button onClick={cancelUploadFromLocal} className="back-btn">
                                    <ArrowBackIosNewIcon style={{ fontSize: "1.18rem" }} />
                                </button>
                                <div className="linkModalHead videoModalHead">Please Confirm your actions</div>
                                <div className="confirm-window-modal-body">
                                    <p>Are you sure you want to upload this video?</p>
                                    <div className="confirmActions">
                                        <button className="btn confirmBtn" onClick={confirmUploadFromLocal}>Yes</button>
                                        <button className="btn cancelBtn" onClick={cancelUploadFromLocal}>No</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                    
                ) : 
                (
                    <div className="youtubeLinkContainer addVideoModalContainer">
                        <div className="addVideoModal">
                            <button onClick={cancelUploadFromUrl} className="back-btn">
                                <ArrowBackIosNewIcon style={{ fontSize: "1.18rem" }} />
                            </button>
                            <div className="linkModalHead videoModalHead">Import from URL</div>
                            <div className="youtube-link-upload">
                                <input 
                                    type="text" 
                                    id="linkUpload" 
                                    name="linkUpload" 
                                    value={linkUpload}
                                    onChange={handleLink}
                                    placeholder="Enter the URL to import the video from"
                                />
                                <button className="btn" onClick={uploadVideoFromUrl}>IMPORT</button>
                            </div>
                        </div>
                    </div>
                )
            )}
        </>
    );
}