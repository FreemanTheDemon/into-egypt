const gameBox = document.querySelector('#game-box');
const gameStart = document.querySelector('#game-start');
const insertName = document.querySelector('#insert-name');
const easyBtn = document.querySelector('#easy-btn');
const mediumBtn = document.querySelector('#medium-btn');
const hardBtn = document.querySelector('#hard-btn');

const charName = document.querySelector('#char-name');
const charTurn = document.querySelector('#char-turn');
const charGold = document.querySelector('#char-gold');
const charSoldiers = document.querySelector('#char-soldiers');
const charSlaves = document.querySelector('#char-slaves');
const charAuth = document.querySelector('#char-auth');
const charGlory = document.querySelector('#char-glory');

const gameText = document.querySelector('#game-text');

// Initialize game

// soldiers increment by hundreds (Ramses II had 20,000 soldiers)
// slaves increment by thousands (around 200,000 slaves in the New Kingdom)
let playerData = {
    difficulty: '',
    name: '',
    turn: 0,
    gold: 100,
    soldiers: 1000,
    slaves: 10000, 
    authority: 100,
    glory: 0,
    hasFoughtBattle: false,
    hasReadOracle: false,
    builtPyramid: false,
    builtLuxor: false,
    builtPharaohCanal: false
};

var currentEvent = {};

const conan1 = new Audio('./resources/conan.mp3');

function handleStartBtn(e) {
    let name = insertName.value;
    console.log(name);
    console.log(e.target.id);
    if (name.length === 0) {
        alert('The Pharaoh cannot be unnamed!');
    } else if (name.length > 21) {
        alert('The Pharaoh\'s name is too long!');
    } else if (name === 'Conan') {
        displayText('Between the time when the oceans drank Atlantis, and the rise of the sons of Aryas, there was an age undreamed of. And unto this, Conan, destined to wear the jeweled crown of Aquilonia upon a troubled brow. It is I, his chronicler, who alone can tell thee of his saga...');
        playerData.name = 'Conan the Barbarian';
        charName.textContent = playerData.name;
        playerData.difficulty = 'Conan';
        gameStart.style.display = 'none';
        conan1.play();
        advanceTurn();
    } else if (e.target.id === 'easy-btn') {
        playerData.name = name;
        charName.textContent = name;
        playerData.difficulty = 'easy';
        gameStart.style.display = 'none';
        advanceTurn();
    } else if (e.target.id === 'medium-btn') {
        playerData.name = name;
        charName.textContent = name;
        playerData.difficulty = 'medium';
        gameStart.style.display = 'none';
        advanceTurn();
    } else if (e.target.id === 'hard-btn') {
        playerData.name = name;
        charName.textContent = name;
        playerData.difficulty = 'hard';
        gameStart.style.display = 'none';
        advanceTurn();
    }
}

function setStats() {
    charTurn.textContent = playerData.turn;
    charGold.textContent = playerData.gold;
    charSoldiers.textContent = playerData.soldiers;
    charSlaves.textContent = playerData.slaves;
    charAuth.textContent = playerData.authority;
    charGlory.textContent = playerData.glory;
}

function advanceTurn() {
    // easy scripted turns: 12, 14
        // 12 Abram enters Egypt
        // 14 Plagues happen and Abram leaves
    // medium scripted turns: 12, 14, 16
        // 12 Strange visions
        // 14 Appoint Joseph as Viser
        // 16 Famine
    // hard scripted turns: 12, 14, 16, 18, 20
        // 12 Moses, an asset to the Kingdom
        // 14 Moses, exiled!
        // 16 Moses returns
        // 18 Ten Plagues upon Egypt
        // 20 Revenge?

    // if certain buildings have been built, give some bonuses each turn

    // temple - generates 1 authority per turn
    // pyramids - generates glory
    // canal - generates gold

    // increment the turn
    playerData.turn++;
    
    // at the start of the turn, check the current stats to see if the player has lost or is at the end of the game

    // if easy medium or hard (different length of game, different turn number to end on victory)
    // if gold or authority is zero or below, the game is over and lost

    // every 1000 slaves grants 1 gold
    if (playerData.turn !== 0) {
        playerData.gold += (playerData.slaves / 1000);
    }
    // reset battle and oracle
    playerData.hasFoughtBattle = false;
    playerData.hasReadOracle = false;

    setStats();

    // handle scripted and random events
    if (playerData.difficulty === 'easy' && playerData.turn === 12) {
        getScriptedEvent(1);
    } else if (playerData.difficulty === 'easy' && playerData.turn === 14) {
        getScriptedEvent(2);
    } else if (playerData.difficulty === 'medium' && playerData.turn === 12) {
        getScriptedEvent(3);
    } else if (playerData.difficulty === 'medium' && playerData.turn === 14) {
        getScriptedEvent(4);
    } else if (playerData.difficulty === 'medium' && playerData.turn === 16) {
        getScriptedEvent(5);
    } else if (playerData.difficulty === 'hard' && playerData.turn === 12) {
        getScriptedEvent(6);
    } else if (playerData.difficulty === 'hard' && playerData.turn === 14) {
        getScriptedEvent(7);
    } else if (playerData.difficulty === 'hard' && playerData.turn === 16) {
        getScriptedEvent(8);
    } else if (playerData.difficulty === 'hard' && playerData.turn === 18) {
        getScriptedEvent(9);
    } else if (playerData.difficulty === 'hard' && playerData.turn === 20) {
        getScriptedEvent(10);
    } else {
        getRandomEvent();
    }
}

function createEvent(eventObj) {
    // get the description and option name(s) from the event object
    const {} = eventObj;

    // templates for one or two options
    let oneOptionTemplate = `
    <div id="event">
        <p class="event-desc">${1234}</p>
        <button id="option-1" class="option-btn solo-btn">${123}</button>
    </div>
    `;
    let twoOptionTemplate = `
    <div id="event">
        <p class="event-desc">${1234}</p>
        <button id="option-1" class="option-btn">${123}</button>
        <button id="option-2" class="option-2 option-btn">${123}</button>
    </div>
    `

    // if option-2 is blank, use the one option template
    // put the template onto the DOM

}

function handleOptionClick(e) {
    // if the id of the button was option-1
        // make the stat adjustments using the currentEvent variable for easy access to data
    // else (the id of the button was option-2)
        // make the other state adjustments using the currentEvent variable for easy access to data
    
    // after if else statement, simply delete the div with the id of event
    // change background back to default, maybe change music too
    // update/refresh stats
    // change footer text to default
}

function getRandomEvent() {
    // makes a request to the server for the whole random event table
    // returns a single event from that table at random
}

function getScriptedEvent(eventId) {
    // makes a request to the server for the specific event.
    // there are only 10 scripted events
}

function saveGame() {
    // makes a request to add a name to the database through the server
}

function loadGame(name) {
    // makes a post (?) request for a game with a certain name
    // if the name doesn't exist, notify the user
}

function gameIsOver(name) {
    // makes a delete request to the server
    // only upon game completion or game faliure
}


// fancy text stuff

let textCounter = 0;
function displayText(text) {
    gameText.textContent = '';
    let textArr = text.split('');
    textInterval(textArr);
}

const textInterval = function(arr) {
    let intervaler = setInterval(() => {
        if (gameText.textContent.length === arr.length) {
            textCounter = 0;
            clearInterval(intervaler);
        } else {
            gameText.textContent = gameText.textContent + arr[textCounter];
            textCounter++;
        }
    }, 75);
}

displayText('Begin your reign...');

easyBtn.addEventListener('click', handleStartBtn);
mediumBtn.addEventListener('click', handleStartBtn);
hardBtn.addEventListener('click', handleStartBtn);