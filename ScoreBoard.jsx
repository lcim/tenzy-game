import React from "react"

export default function ScoreBoard(props) {
    // console.log(props.players[0].history)
    const scored = props.playersScores.map((eachScore, ind) => {
        // const style ={backgroundColor: props.players[0].attempts === props.players[1].attempts ? "white": props.players[0].attempts < props.players[1].attempts ? "blue" : "green" }
        return <h3 className="scores">{eachScore}</h3>})
    const len = props.playersScores.length;
    const sumOfScores = props.playersScores.reduce((accum, score) => accum + score );
    return (<div className="scores-wrap">        
        <div className="scoresContainer">
            {scored }
        </div>
        <div className="attempts">{sumOfScores + " attempts total"}</div>
    </div>)
}