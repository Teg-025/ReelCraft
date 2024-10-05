import React, { useEffect, useState } from "react";
import './TypeWriter.css'

export default function TypeWriter(props){
    const {text, speed, className} = props;
    const [displayedText, setDisplayedText] = useState("");

    useEffect(()=>{
        let index = -1;
        const interval = setInterval(()=>{
            index++;
            setDisplayedText(prev => prev + text[index]);
            if(index===text.length-1){
                clearInterval(interval)
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return(
        <div className={`${className}`}>
            {displayedText}
        </div>    
    )
}