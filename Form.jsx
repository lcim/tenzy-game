import React from "react"

export default function Form(props) {
    
    //console.log(props)
    return (
        <div className="form-content">
            <div className="players-input">
                <input 
                className="player player1"
                type="text"
                name="player1"
                value={props.player1}
                placeholder="player1, enter your name"
                onChange={ props.handleChange }
            />
            
            <input 
                className="player player2"
                type="text"
                name="player2"
                value={props.player2}
                placeholder="player2, enter your name"
                onChange={ props.handleChange }
                />
            </div>
            <div className="ctrl-buttons">
            <button className="register form-btn" onClick={ (e) => props.generateNewPlayers(e)} 
            type="button">
            Enter
            </button>
            
            <button className="reset form-btn" onClick={props.reset} 
            type="button">
            reset?
            </button> 
            
            <button className="start-game form-btn" onClick={props.btns}>Instructions?
            </button>
            </div>
        </div>
    )
}