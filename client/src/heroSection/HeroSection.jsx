import React from "react";
import Header from "../header/Header";
import Typewriter from "../typeWriter/TypeWriter";
import './HeroSection.css'

export default function HeroSection(){

    return(
        <div>
            <div 
                className="hero-section-container"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundImage: "url('hero_img_reelcraft_n.jpg')",
                    minHeight: "100vh",
                    backgroundPosition: "center",  // Center the image
                    backgroundSize: "contain",     // Maintain aspect ratio
                    backgroundRepeat: "repeat", // Avoid tiling the image
                }}
            >
                <Header/>
                <div className="left-box-hero-page">
                    <div className="heading-left-box-hero-page">
                        Convert 
                        <img 
                            src="YouTube_logo.svg" 
                            alt="img" 
                            style={{
                                width: "16.8rem",
                                margin: "0rem 0.8rem"
                            }}
                        />
                        Videos into&nbsp;
                        <span className="highlight">
                            Engaging Reels
                        </span>
                        <div>
                            &mdash;Effortlessely!
                        </div>
                    </div>
                    
                    <div className="desc">
                        Transform and shorten your content to showcase the best moments and engage your audience!
                    </div>
                </div>
            </div>
        </div>
    )
}