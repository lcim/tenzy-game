import React from "react"
import fontawesome from "fontawesome"

export default function Die(props) {
    const styles = { 
        border: props.isHeld ? "8px solid orange" : "8px solid white"
    }
    
    return (
        <div 
            className="die-face" 
            style={styles}
            onClick={props.holdDice}
        >
            <h2  className="die-img">{props.value}</h2>
        </div>
    )
}