import React from "react"
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"
import Form from "./Form"
import ScoreBoard from "./ScoreBoard"
import $ from "jquery"
//import fontawesome from "fontawesome"

/*
1. Game of two named players from user input;
2. Involves players rolling 10 dice to make sure all dice have same face Value turn by turn; eg all have 4. This condition is called a tenzie.
3. When a die face is selected, the face value remains unchanged as one rolls the dice to get matching face values
4. Number of attempts by each player is recorded;
5. Each player must achieve 5 tenzies; meaning the game involves playing 5 rounds/sets.
6. The number of attempts made before achieving tenzy is stored in each player's history.
7. After each round, the attempts are compared and a winner for that round declared; the overall winner is decided based on the number of sets won, not based on overall number of attempts.
8. The least number of attempts in achieving a tenzy is stored and updated in localStorage as a newRecored.
*/

export default function App() {

    const [dice, setDice] = React.useState(allNewDice())
    // tenzies.tenzy is true when all die has same value and held(or highlighted) as well.
    const [tenzies, setTenzies] = React.useState({tenzy: false, tenzyCount: 1})
    
    const [players, setPlayers] = React.useState([])
    
    // Get players names from user input
    const [getPlayers, setGetPlayers] = React.useState(
        { player1: "", player2: "" }
        )
    
    //Manage  number of sets won by each player
    const [setsWon, setSetsWon] = React.useState({player1: 0, player2: 0})
    
    // Track game record - the minimum number of tries to reach tenzies.tenzy
    const [newRecord, setNewRecord] = React.useState(JSON.parse(localStorage.getItem("records")) || 4400)
    
    React.useEffect(() => { 
        // completeGame() is a function used to check if a tenzy is made
        if (completeGame().allHeld && completeGame().allSameValue) {
            setTenzies(prevTenzies => ({
                ...prevTenzies, tenzy: true, tenzyCount: tenzies.tenzyCount + 1
            }))
            
            // find active player, check if he finished in record attempts, update his props
            const activePlayerIndex = players.findIndex(ind => ind.active)
            const activePlayerHistory = players[activePlayerIndex].history
            const activePlayerAttempts = players[activePlayerIndex].attempts
            // check if new record set
            checkRecord(activePlayerAttempts)

            const playersCopy = players.map(player => {
                if(player.active){
                    return ({...player, attempts: 0, active: !player.active, history: [...activePlayerHistory, player.attempts]})
                } return {...player, active: !player.active}
                })
            setPlayers(playersCopy)
        }
        // check if a set/round is completed by player1 and store his number of attempts
        if(tenzies.tenzyCount % 2 !== 0 && completeGame().allSameValue && completeGame().allHeld){
            const player1Attempts = players[0].attempts;
            localStorage.setItem("player1Score", player1Attempts)
        }
        // check if player2 completed a set/round and compare his total attempts with that of player1 and update data
        if(tenzies.tenzyCount > 0 && tenzies.tenzyCount % 2 === 0 && completeGame().allSameValue && completeGame().allHeld){
            const player2Attempts = players[1].attempts;
            const player1Attempts = JSON.parse(localStorage.getItem("player1Score"))
            
            player1Attempts !== player2Attempts ? soundsPlayer(setWinnerApplause) : null;
            
            const currentSetWinner = player1Attempts === player2Attempts ? "Set DRAWN 📥📤  " : 
                player1Attempts < player2Attempts ? 
                players[0].name + " WON this set🥇" : players[1].name + " WON this set🥇";
            // Display the current set winner
            $(".setResult").html(currentSetWinner)
            $(".setResult").fadeIn(1000).animate({left:"124px", top:"113px", height: "66px", opacity:"0.9"}).slideUp(8000).fadeOut(12000)
            //update each players total number of sets won
            const gameDecider = player1Attempts === player2Attempts ? 
                setSetsWon(prevSets => ({...prevSets, player1: setsWon.player1 + 0, player2: setsWon.player2 + 0}) ):
                player1Attempts < player2Attempts ? 
                setSetsWon(prevSets => ({...prevSets, player1: setsWon.player1 + 1}) ) :
                setSetsWon(prevSets => ({...prevSets, player2: setsWon.player2 + 1}) )
        } 
    }, [dice])
    
    // A function to check if a player has set a new record by completing a set in lesser number of tries
    const checkRecord = (attempts => {
        if(newRecord <= attempts){
            return newRecord
        } else {
            soundsPlayer(records)
            localStorage.setItem("records", attempts)
            setNewRecord(attempts)
            const newRec = $(".new-record").html(`Done in ${attempts} attempts; NEW Record! 👏😍👏`) ;
            $(".new-record").fadeIn(1000).fadeOut(15000)
        } 
    });
    
    // localStorage.clear()
    
    // logics of the game that decide when a game is completed,
    // Would be used to decide a complete set and subsequently, 
    // complete match after 5 sets have been played.
    const completeGame = () => {
        const allHeld = dice.every(die => die.isHeld) // no dice can change value
        const firstValue = dice[0].value // arbitrarily chosen die
        const allSameValue = dice.every(die => die.value === firstValue)
        return { allHeld: allHeld, firstValue: firstValue, allSameValue: allSameValue }
    }

    // generate a single die face
    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }    
    
    // generate 10 dice faces
    function allNewDice() {
        // const newDice = []
        // for (let i = 0; i < 10; i++) {
        //     newDice.push(generateNewDie())
        // }
        // return newDice

        // Using Spread Operator        
        return([...Array(10).keys()].map(() => generateNewDie()))    
    }
    
    // Dice rolls and their consequences/effects
    function rollDice() {
        // refresh the browser to restart the game after 5 sets played
        if(tenzies.tenzyCount === 11){
            window.location.reload()
        }
        // confirm players name is entered before rolling dice not working for now
        // if(typeof players !== "undefined" || typeof players !== "undefined" ){
        //     alert("You must enter names for players 1 & 2 before you can start game")
        // }

        // If all dice are not held and do not have the same face value 
        if(!tenzies.tenzy && players[0].name !== "" && players[1].name !== "") {
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
            // increase the number of attempts by one,
            const playersCopy = players.map(player => player.active ? {...player, attempts: player.attempts + 1} : player);
            // OR
            // const playersCopy = players.map(player => {
            //     if(player.active) {
            //         return {...player, attempts: player.attempts + 1}
            //     };
            //     return player;
            // })
            setPlayers(playersCopy)
        
        } else {
            // reverse the value of tenzies.tenzy
            setTenzies(prevTenzies => ({
                ...prevTenzies, tenzy: !tenzies.tenzy
            }))
            // set fresh ten dice
            setDice(allNewDice())
            
        }
    }
    
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            // reverse the value of dice.isHeld for the clicked die
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
        var audio = new Audio("https://s3.amazonaws.com/freecodecamp/drums/Heater-6.mp3");
        audio.play()
    }
    
    const setWinnerApplause = document.getElementById("set-applause") //$("#set-applause");
    const matchApplause = $("#match-applause")[0];
    const gameBackgroundSound = $("#game-trailer")[0];
    const records =  $("#record")[0];
    
    function soundsPlayer(soundElement) {
       soundElement.play() 
    } 

    // dice face images
    // const face1 = <img src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81qWTR41Kpx3T2jMuMU6_DR83uj57X5-JYSe4y4ESK38T_cpiDqEX_w-oMLAw__CPhgiMQVcdHvlWc0IqJKNQibcS652Ag=s63" />
    // const face2 = <img src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81owEzeEDsilsxVbHQzPKhbBekji0ZSWLDgPm5pXpDSutVk7GCW6BXj7nxNXvDLra_8smINOH6gmBC0MvEF2bYIH_3oDgw=s63" />
    // const face3 = <img src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81r0R5DZcOOmMYOghi5Ox3RXZcN5_bmiefjnchmaIE1dwfNnWhAAVFSvVIblzKE8gNq9hItWMlOV6Mo-qbNjnDGRcWD77g=s63" />
    // const face4 = <img src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81pXKyp_phE_gXPfUa9j4d-PXvoYwmzxL0XYSEWTLHd7UT3wBfKIcOWeh9h1ZViKLVuVUEeDQDnpnu4fEUSESwLAmmvg_g=s63" />
    // const face5 = <img src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81rorjE8CYyBsU8fY4aqdHKlxtT1Klvekam-B6x7tYMK0st3NOfNlbVEexSLQ00EMmkWMBzdQ8vfnEa8yiG2Bu69jOPw2A=s63" />
    // const face6 = <img src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81rZ2Hd5nMkh1rpAinIUJcDLpfX9qnS6VOq98Lkj0mHM0UNRg83i06rjNjVCmPbk9D-xg9vT9em4NWWZrQ1OJI19qAjq=s63" />
    
        // dice face images
    const face1 = <img className="raw-die" width="54" height="54"  src="images/seed1.png" alt="seedimage" />
    const face2 = <img className="raw-die" width="54" height="54"  src="images/seed2.png" alt="seedimage" />
    const face3 = <img className="raw-die" width="54" height="54"  src="images/seed3.png" alt="seedimage" />
    const face4 = <img className="raw-die" width="54" height="54"  src="images/seed4.png" alt="seedimage" />
    const face5 = <img className="raw-die" width="54" height="54"  src="images/seed5.png" alt="seedimage" />
    const face6 = <img className="raw-die" width="54" height="54" src="images/seed6.png" alt="seedimage" />
    
    // const face1 = <img className="raw-die" width="54" height="54"  src="images/dice-1.png" alt="dice-image" />
    // const face2 = <img className="raw-die" width="54" height="54"  src="images/dice-2.png" alt="dice-image" />
    // const face3 = <img className="raw-die" width="54" height="54"  src="images/dice-3.png" alt="dice-image" />
    // const face4 = <img className="raw-die" width="54" height="54"  src="images/dice-4.png" alt="dice-image" />
    // const face5 = <img className="raw-die" width="54" height="54"  src="images/dice-5.png" alt="dice-image" />
    // const face6 = <img className="raw-die" width="54" height="54" src="images/dice-6.png" alt="dice-image" />
        
            // dice face images
    // const face1 = <img height="48" width="48" src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81rESe_Nfnvd8GFWQG9EXXMWWxsKK1ORZCk_pVpSKY8ogVYzyUe6wJmQBaK3GJAgYHx15PYOCSePjTuof0egvBHtIcZCmw=s2560" alt="1" />
    // const face2 = <img height="48" width="48"  src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81pr0Qo3o3A0pUuHdrX58ceo1kNbYPJy834PcwQzQTulJOLrXzNGv0y6fBm7mWAkMLLtlDgMalKDBGfGo0VUMBh1QV3EXA=s2560" alt="2" />
    // const face3 = <img height="48" width="48" src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81otr9EroBP0nveBToLrlPSX-neDp97bmeZY1J8wn_xdF6zI_7jk0r5VCrXAgtIWXT6JPB33yzFwE6r6tUsuImmPsCH-=s2560"alt="3" />
    // const face4 = <img height="48" width="48" src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81oHXeCuYClxw3V0q69U8Vhy0h9qf_Omkyn0om7dE5v3Etv9AOKZANxMsF0wk21Itg3Jv7jaswS8FsViledttQzX8i6jpw=s2560" alt="4" />
    // const face5 = <img height="48" width="48" src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81p3haH4d7KdLJjVzTohqSgcYYv41uxa1BmBSvGgb8njZwhNhHHN2FPpO9TvyybwjVU2BkAXFAkBJyNsBrEwbEn9Us7qFA=s2560" alt="5" />
    // const face6 = <img height="48" width="48"  src="https://lh3.googleusercontent.com/drive-viewer/AFGJ81rCBVDgmOOTgykcG_DS44YGVrtyM_X_FrwJpzOURHKastGnuTqvO8V6DtXh9qpGHjJLScX6EwLDAhkHfPQygTQerY1F2A=s2560" alt="6" />
    
    // map through the dice array and pass props to Die component
    const diceElements = dice.map(die => {
        const dieFace = die.value === 1 ? face1 : die.value === 2 ? face2 : 
        die.value === 3 ? face3 : die.value === 4 ? face4 : 
        die.value === 5 ? face5 : face6 ;
        return (
        <Die 
            key={die.id} 
            value={dieFace} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    )})
    
    
    // refresh or quit game
    function reset() {
    window.location.reload();
    }
    
    // handle change to set players object.name property to respective user inputs
    function handleChange(e) {
        e.preventDefault()
        setGetPlayers(player => ({
            ...player, [e.target.name]: e.target.value
        }))
    }
    
    // function to create two players object with name coming from user input
    function generateNewPlayers(e) {
        const obj1 = {name: getPlayers.player1, attempts: 0, history: [], active: true, id: nanoid()}
        const obj2 = {name: getPlayers.player2, attempts: 0, history: [], active: false, id: nanoid()}
        setPlayers([obj1, obj2])
        // ensure player name is no empty before game starts
        if(!$(".player").val() || !$(".player2").val()){
            alert("Click on 'quit', enter names for players 1 & 2, and click 'Enter' to start game")
        } else {
            setGetPlayers(players => ({
                ...players, player1: "", player2: ""
            }))
        }
        soundsPlayer(gameBackgroundSound)
        // hide the input elements and the start button
       $(".player").hide()
       $(".register").hide()
    }

    const myFooter = $(".socials").hide()
    
    // pass players scores to the ScoreBoard component
    const playersScores = players.map((player) => (
        <ScoreBoard key={player.id}
        playersScores={player.history}
        // players={players}
        />
    ))
    
    // display a scoreboard at the end of the match
    const scoreDisplay = tenzies.tenzyCount === 11 && <div className="scoresBody">
                <div className="p1Score">{tenzies.tenzyCount === 11 && players[0].name + " scores"}</div>
                <div className="p2Score">{tenzies.tenzyCount === 11 && players[1].name + " scores"}</div>
                <div className="pScores">{tenzies.tenzyCount === 11 && playersScores}</div>
            </div>
    // a function to toggle game instructions and hide footer
    const btns = () => {
        $(".instructions-container").toggle();
    }

    // passing props down to Form component
    const formInputs = (
                <Form 
                player1={getPlayers.player1}
                player2={getPlayers.player2}
                handleChange={ (e) => handleChange(e) }
                generateNewPlayers={ (e) => generateNewPlayers(e)}
                reset={ () => reset()}
                btns={() => btns()}
                players={players}
        />)
    
    const how2Play = `Tenzy game is played by two players and consists of 10 dice. Enter any two names and click "Enter" to start. Player1 starts first - choose a particular dice face and click them to highlight them; then roll the dice until that dice face are all highlighted. Eg All face becomes a six. Player2 takes turn. 
    After five sets each, the scoreBoard displays your scores and the player who won most sets is declared the winner. 
    - © Chiadi 2023 
    
    ➡👉`
    if (window.screen.width < 480  ) {
        $(".copyrights").hide()
    }

    // end of match
    if (tenzies.tenzyCount === 11) {
        soundsPlayer(matchApplause)
        const finalResult = setsWon.player1 === setsWon.player2 ? "Honours Even ⚖️" : setsWon.player1 > setsWon.player2 ?
            `GameOver! ${players[0].name} wins ${setsWon.player1}:${setsWon.player2} sets 
            💰🏅🏆`:
            `GameOver! ${players[1].name} wins ${setsWon.player2}:${setsWon.player1} sets 
            💰🏅🏆`
        var resultDisplay = $("<h1></h1>").addClass("final-scores").text(finalResult);
        $(".setResult").after(resultDisplay)
        $(".dice-container").hide()
        $(".form-btn").hide()
        $(".form-content").hide()
        $(".socials").show()
    }
    
    return (
        <main>
            {(tenzies.tenzyCount > 1 && tenzies.tenzyCount % 2 !== 0 && tenzies.tenzy) && <Confetti />}
            <h1 className="title">Chiadi-Tenzies</h1>
            <div className="instructions-container">
                <div className="instructions">{how2Play}
                    <button className="start-game" onClick={() => {
                    myFooter.toggle();
                    $(".instructions-container").toggle();
                }}>Let's Go!</button>
                </div>
                </div>
            {formInputs}
            <h3 className="new-record">
            </h3>
            <h3 className="setResult">            
            </h3>
            {scoreDisplay}            
            <div className="dice-container">
                {diceElements}
            </div>
            <button 
                className="roll-dice" 
                onClick={rollDice}
            >
                {tenzies.tenzyCount === 11 ? "End game" : tenzies.tenzyCount === 1 ? "Roll Dice?" : tenzies.tenzyCount % 2 !== 0 && tenzies.tenzy ? `Next Set` :  !tenzies.tenzy ? "Play" :"Next Player" }
            </button>
        </main>
    )
}

    // const selectedSound = dice.map(die => {
    //     const dieAudio = die.value === 1 ? "https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3" : die.value === 2 ? "https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3" :
    //         die.value === 3 ? "https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3" : die.value === 4 ? "https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3" :
    //             die.value === 5 ? "https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3" : "https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3";
    //     return dieAudio
    // })

    
    // const playSound = (audioFile) => {
    //     var audio = new Audio(audioFile);
    //     audio.play()
    // }

    // const soundSource = (dieFace) => {
    //     switch (dieFace) {
    //         case (1):
    //             playSound("https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3");
    //             break;
    //         case (2):
    //             playSound("./sounds/Trailer-1.mp3/Trailer.mp3");
    //             break;
    //         case (3):
    //             playSound("sound/mixkit-4.wav");
    //             break;
    //         case (4):
    //             playSound("sound/mixkit-7.wav");
    //             break;
    //         case (5):
    //             playSound("sound/mixkit-8.wav");
    //             break;
    //         case (6):
    //             playSound("sound/mixkit-5.wav");
    //             break;
    //         default: console.log ("done")
    //     }
    // }
    

    // video reference
    // Epic Trailer by LesFM | https://lesfm.net/
    // Music promoted by https://www.chosic.com/free-music/all/

    //     Shenyang Kevin MacLeod (incompetech.com)
    // Licensed under Creative Commons: By Attribution 3.0 License
    // http://creativecommons.org/licenses/by/3.0/
    // Music promoted by https://www.chosic.com/free-music/all/ 

    // Fluffing a Duck Kevin MacLeod (incompetech.com)
    // Licensed under Creative Commons: By Attribution 3.0 License
    // http://creativecommons.org/licenses/by/3.0/
    // Music promoted by https://www.chosic.com/free-music/all/ 
 
