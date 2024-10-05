import React from "react";
import Header from "../header/Header";
import Typewriter from "../typeWriter/TypeWriter";
import './HeroSection.css'

export default function HeroSection(){
    return(
        <div >
            <Header/>
            <div className="hero-section-container">
                <div className="hero-section-left">
                    <Typewriter text="Generate more content in less time." speed={40} className="headText" />
                    <div className="subText">
                        Easily convert <span style={{color: "#fc0301"}}>Youtube</span> videos to <span style={{color: "#535f9c"}}>reels</span>
                    </div>
                </div>
                <div className="hero-section-right">
                    <img src="/Hero-section_img.png" alt="hero-img" width={600}/>
                </div>
            </div>
        </div>
    )
}