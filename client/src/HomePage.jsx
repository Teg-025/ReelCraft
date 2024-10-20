import React from "react";
import HeroSection from "./heroSection/HeroSection";
import './homePageCard/HomePageCard'
import HomePageCard from "./homePageCard/HomePageCard";
import HomePageHowToUsePoint from "./homePageHowToUsePoint/HomePageHowToUsePoint";
import './HomePage.css'

export default function HomePage(){

    const cardContent = [
        {
        cardHead: "Effortless Video Uploading",
        cardBody: "Upload videos directly from your device or through YouTube links with ReelCraft’s simple and user-friendly interface. Whether it's personal footage or professional content, our platform ensures smooth uploads, getting you started on reel creation quickly."
        },
      {
        cardHead: "AI-Powered Reel Creation",
        cardBody: "ReelCraft’s machine learning engine leverages Librosa and OpenCV to detect audio peaks, scene transitions, and even generate transcripts. This enables automated reel creation that captures the most engaging moments, saving you hours of manual editing while maintaining high-quality output."
      },
      {
        cardHead: "Aspect Ratio Optimization for Reels",
        cardBody: "Optimize your videos for social media with ReelCraft’s FFmpeg-powered aspect ratio adjustments. Whether it’s landscape, portrait, or square, ReelCraft automatically reformats your content into Instagram reel-friendly formats for a seamless viewing experience."
      },
      {
        cardHead: "User-Friendly Interface",
        cardBody: "ReelCraft features an intuitive and interactive user interface that simplifies the video creation process. With a clean layout and easy navigation, users can quickly upload videos. Helpful prompts guide you through each step, making it easy for anyone to create stunning reels in no time."
      }
    ]

    const howToUseSteps = [
        {
            pointNumber: 1,
            pointTitle: "Upload Video or YouTube Link",
            pointInfo: "Effortlessly upload videos from your device or paste a YouTube link into ReelCraft’s intuitive interface. The process is quick and hassle-free, letting you focus on creating and sharing your content without unnecessary delays or complications."
        },
        {
            pointNumber: 2,
            pointTitle: "AI-Powered Reel Creation",
            pointInfo: "ReelCraft takes over the creative process, transforming your video into engaging, ready-to-share reels automatically, this seamless experience allows you to focus on your content while the platform generates engaging reels for you, saving time and effort in the process."
        },
        {
            pointNumber: 3,
            pointTitle: "Preview and Download",
            pointInfo: "Once your reel is ready, preview the final result. With a simple click, download your newly created reel, ready for Instagram or other platforms!"
        }
      ];


    return(
        <div className="page-container">
            <HeroSection />
            <div className="body-container">
                <div className="card-container">
                    <div className="card-container-head">
                        Why use ReelCraft for video to reel conversion ?
                    </div>
                    <div className="card-container-body">
                        {cardContent.map((card, index) => (
                            <HomePageCard
                                key={index} 
                                cardHead={card.cardHead} 
                                cardBody={card.cardBody} 
                            />
                        ))}
                    </div>
                    <div className="how-to-use-part">
                        <div className="how-to-use-part-head">
                            How to use ReelCraft to convert Youtube videos to reels ?
                        </div>
                        <div className="how-to-use-part-body">
                            {howToUseSteps.map((point) => (
                                <HomePageHowToUsePoint
                                    key={point.pointNumber}
                                    pointNumber={point.pointNumber}
                                    pointTitle={point.pointTitle}
                                    pointInfo={point.pointInfo}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}