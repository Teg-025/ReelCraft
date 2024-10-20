import React from "react";
import './HomePageCard.css'

export default function HomePageCard(props){
    const {cardHead, cardBody} = props
    return(
        <div className="single-card-container">
            <div className="card-head">
                {cardHead}
            </div>
            <div className="cardBody">
                {cardBody}
            </div>
        </div>
    )
}