import React, { useState, useRef, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import Header from "./header/Header";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FaPlay } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import './PreviewReelPage.css';

export default function PreviewReelPage(){
    const [playingIndex, setPlayingIndex] = useState(null); // State to track playing video

    // Ref to hold video elements
    const videoRefs = useRef([]);

    const location = useLocation();
    const reels = location.state?.reels || [];
    console.log("Location state:", location.state);

    const handlePlayPause = (index) => {
        const video = videoRefs.current[index];
        if (video.paused) {
            video.play();
            setPlayingIndex(index); // Set current video as playing
        } else {
            video.pause();
            setPlayingIndex(null); // Reset playing index when paused
        }
    };

    useEffect(()=>{
        if(reels && reels.length<0){
            console.log("Reel length is 0")
        }
        else{
            console.log(reels)
        }
    })

    return (
        <div className="PreviewReelPage-container">
            <Header />
            <div className="PreviewReelPage-body">
                <div className="content-before-carousel">
                    <div className="header">All Set to Share!</div>
                    <img src="./linesf.png" alt="" />
                    <div className="line"></div>
                </div>
                <div className="swiper-container">
                    <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={10}
                        slidesPerView={1}
                        breakpoints={{
                            480: {
                                slidesPerView: 1
                            }, 
                            800: {
                                slidesPerView: 2 
                            }
                        }}

                        navigation={true}
                        pagination={{ clickable: true }}
                    >
                        {reels && (
                            reels.map((clip, index) => (
                                <SwiperSlide key={index} className="video-slide">
                                    <div className="video-container">

                                        <video
                                            ref={(el) => (videoRefs.current[index] = el)}
                                            width="280"
                                            className="video-clip"
                                            onClick={() => handlePlayPause(index)}
                                        >
                                            <source src={`http://localhost:8000/downloads/${clip}`} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                        {playingIndex !== index && (
                                            <button
                                                className="play-button"
                                                onClick={() => handlePlayPause(index)}
                                            >
                                                <FaPlay />
                                            </button>
                                        )}
                                        <div>
                                            
                                        </div>
                                        <a
                                            href={`http://localhost:8000/downloads/${clip}`}
                                            download={clip} // This attribute triggers the download
                                            className="download-btn video-options"
                                        >  
                                            <div className="buttons-container ">                                                
                                                <HiDownload/>
                                            </div>
                                        </a>
                                        
                                    </div>                
                                </SwiperSlide> 
                            ))
                        )}
                    </Swiper>
                </div>
                <div className="line-container"><div className="line"></div></div>
            </div>
        </div>
    );
}