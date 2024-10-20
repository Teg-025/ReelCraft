import React from "react";
import './HomePageHowToUsePoint.css'

export default function HomePageHowToUsePoint(props){
    const {pointNumber, pointTitle, pointInfo} = props;
    return(
        <div className="point-body">
            <div className="point-number">
                {pointNumber}
            </div>
            <div className="point-content">
                <div className="point-title">
                    {pointTitle}
                </div>
                <div className="point-info">
                    {pointInfo}
                </div>
            </div>
        </div>
    )
}