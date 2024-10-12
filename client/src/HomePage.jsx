import React from "react";
import HeroSection from "./heroSection/HeroSection";

export default function HomePage(){
    return(
        <div className="page-container">
            <HeroSection />
            <div className="body-container">
                <div className="card-container">
                    Our values
                </div>
            </div>
        </div>
    )
}