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
const gameInfo = document.querySelector('#game-info');
const gameEvent = document.querySelector('#game-event');

let gameOptionOne;
let gameOptionTwo;

const gameFight = document.querySelector('#game-fight');
const gameBuild = document.querySelector('#game-build');
const gameManage = document.querySelector('#game-manage');
const gameOracle = document.querySelector('#game-oracle');

const gameNext = document.querySelector('#game-next');
const gameSave = document.querySelector('#game-save');
const gameLoad = document.querySelector('#game-load');
const loadText = document.querySelector('#insert-character');

const charPic = document.querySelector('#char-picture');

let url='http://localhost:4004'

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
    hasBuiltPyramid: false,
    hasBuiltTemple: false,
    hasBuiltCanal: false
};

var currentEvent = {};
let eventOnScreen = false;

const conan1 = new Audio('./resources/conan.mp3');

function handleStartBtn(e) {
    let name = insertName.value;
    if (name.length === 0) {
        alert('The Pharaoh cannot be unnamed!');
    } else if (name.length > 21) {
        alert('The Pharaoh\'s name is too long!');
    } else if (name === 'Conan') {
        displayText('Between the time when the oceans drank Atlantis, and the rise of the sons of Aryas, there was an age undreamed of. And unto this, Conan, destined to wear the jeweled crown of Aquilonia upon a troubled brow. It is I, his chronicler, who alone can tell thee of his saga...');
        charPic.src = './resources/conan_pic.png';
        gameBox.style.backgroundImage = "url('./resources/conan_background.png')";
        playerData.name = 'Conan the Barbarian';
        name = 'Conan the Barbarian'
        playerData.difficulty = 'conan';
        conan1.play();
        startGame(name);
    } else if (e.target.id === 'easy-btn') {
        playerData.difficulty = 'easy';
        startGame(name);
    } else if (e.target.id === 'medium-btn') {
        playerData.difficulty = 'medium';
        startGame(name);
    } else if (e.target.id === 'hard-btn') {
        playerData.difficulty = 'hard';
        startGame(name);
    }
}

function startGame(name, load) {
    load = load || false;
    playerData.name = name;
    charName.textContent = name;
    gameStart.style.display = 'none';
    loadText.style.display = 'none';
    gameLoad.style.display = 'none';
    gameInfo.style.display = 'block';
    gameNext.style.display = 'block';
    gameSave.style.display = 'block';
    if(!load) {
        advanceTurn();
    } else {
        setStats();
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
    if (!eventOnScreen) {

    // increment the turn
    playerData.turn++;
    eventOnScreen = true;
    
    // at the start of the turn, check the current stats to see if the player has lost or is at the end of the game

    
    // handle end game
    if (playerData.turn === 21 && playerData.difficulty === 'easy') {
        if (playerData.glory < 1000) {
            badEndEasy();
        } else {
            goodEndEasy();
        }
    }

    if (playerData.turn === 36 && playerData.difficulty === 'medium') {
        if (playerData.glory < 1500) {
            badEndMedium();
        } else {
            goodEndMedium();
        }
    }

    if (playerData.turn === 51 && playerData.difficulty === 'hard') {
        if (playerData.glory < 2600) {
            badEndHard();
        } else {
            goodEndHard();
        }
    }

    // if gold or authority is zero or below, the game is over and lost
    if (playerData.gold <= 0) {
        bankruptEnding();
    }
    if (playerData.authority <= 0) {
        collapseEnding();
    }

    // every 1000 slaves grants 1 gold
    if (playerData.turn !== 0 || playerData.turn !== 1) {
        playerData.gold += (playerData.slaves / 1000);
    }

    // if certain buildings have been built, give some bonuses each turn

    // temple - generates 1 authority per turn
    if (playerData.hasBuiltTemple) {
        if (playerData !== 100) {
            playerData.authority += 1;
        }
    }
    // pyramids - generates glory
    if (playerData.hasBuiltPyramid) {
        playerData.glory += 100;
    }
    // canal - generates gold
    if (playerData.hasBuiltCanal) {
        playerData.gold += 50;
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
}

function createEvent(eventObj) {
    // get the description and option name(s) from the event object
    const {event_desc, option_1, option_2, img_id, gold_1, gold_2, glory_1, glory_2, slaves_1, slaves_2, soldiers_1, soldiers_2, auth_1, auth_2} = eventObj;
    currentEvent = {
        gold_1: gold_1,
        gold_2: gold_2,
        glory_1: glory_1,
        glory_2: glory_2,
        slaves_1: slaves_1,
        slaves_2: slaves_2,
        soldiers_1: soldiers_1,
        soldiers_2: soldiers_2,
        auth_1: auth_1,
        auth_2: auth_2,
    }
    // templates for one or two options
    let oneOptionTemplate = `
        <div id="event">
            <h2>Fate is outside your hands!</h2>
            <p id="event-desc">${event_desc}</p>
            <div id="event-btn-container">
                <button id="option-1" class="option-btn">${option_1}</button>
            </div>
        </div>
    `;
    let twoOptionTemplate = `
        <div id="event">
            <h2>Choose Wisely</h2>
            <p id="event-desc">${event_desc}</p>
            <div id="event-btn-container">
                <button id="option-1" class="option-btn">${option_1}</button>
                <button id="option-2" class="option-btn">${option_2}</button>
            </div>
        </div>
    `

    // if option-2 is blank, use the one option template
    if (option_2 === '') {
        gameEvent.innerHTML += oneOptionTemplate;
    } else {
        gameEvent.innerHTML += twoOptionTemplate;
    }
    gameOptionOne = document.querySelector('#option-1');
    gameOptionTwo = document.querySelector('#option-2');

    gameOptionOne.addEventListener('click', handleOptionClick);
    gameOptionTwo.addEventListener('click', handleOptionClick);
    // put the template onto the DOM
    // change the music
    // add some simple text to the footer
    // change the background image
    gameBox.style.backgroundImage = "url('./resources/conan_background.png')";

}

function handleOptionClick(e) {
    // if the id of the button was option-1
    if (e.target.id === 'option-1') {
        // make the stat adjustments using the currentEvent variable for easy access to data
        playerData.gold += currentEvent.gold_1
        playerData.glory += currentEvent.glory_1
        playerData.slaves += currentEvent.slaves_1
        playerData.soldiers += currentEvent.soldiers_1
        if (playerData.auth + currentEvent.auth_1 > 100) {
            playerData.auth = 100;
        } else {
            playerData.auth += currentEvent.auth_1
        }

    // else (the id of the button was option-2)
    } else {
        // make the other stat adjustments using the currentEvent variable for easy access to data
        playerData.gold += currentEvent.gold_2
        playerData.glory += currentEvent.glory_2
        playerData.slaves += currentEvent.slaves_2
        playerData.soldiers += currentEvent.soldiers_2
        if (playerData.auth + currentEvent.auth_2 > 100) {
            playerData.auth = 100;
        } else {
            playerData.auth += currentEvent.auth_2
        }
    }

    // after if else statement, remove the event
    removeEvent();
    eventOnScreen = false;
    // change background back to default, maybe change music too
    gameBox.style.backgroundImage = "url('./resources/base.png')";
    // update/refresh stats
    // change footer text to default
    setStats();
}

function removeEvent() {
    var e = document.querySelector("#event");
    var first = e.firstElementChild;
    while (first) {
        first.remove();
        first = e.firstElementChild;
    }
    e.remove();
}

function getRandomEvent() {
    // makes a request to the server for the whole random event table
    // returns a single event from that table at random
    axios.get(url + '/randevent/')
        .then(res => {
            let rand = Math.floor(Math.random() * (res.data.length) + 1);
            createEvent(res.data[rand - 1]);
        })
}

function getScriptedEvent(eventId) {
    // makes a request to the server for the specific event.
    // there are only 10 scripted events
    axios.get(url + '/scriptevent/' + eventId)
        .then(res => {
            createEvent(res.data[0]);
        })
}

function saveGame() {
    // makes a post request to add a name to the database through the server
    if (!eventOnScreen) {
        axios.post(url + '/user', {
            difficulty: playerData.difficulty,
            name: playerData.name,
            gold: playerData.gold,
            turn: playerData.turn,
            soldiers: playerData.soldiers,
            slaves: playerData.slaves,
            authority: playerData.authority,
            glory: playerData.glory,
            hasFoughtBattle: playerData.hasFoughtBattle,
            hasReadOracle: playerData.hasReadOracle,
            hasBuiltPyramid: playerData.hasBuiltPyramid,
            hasBuiltTemple: playerData.hasBuiltTemple,
            hasBuiltCanal: playerData.hasBuiltCanal,
        })
            .then(res => {
                gameText.textContent = 'Game saved!';
            })
    } else {
        gameText.textContent = 'Not available during events!';
    }
}

function loadGame() {
    let queryName = loadText.value;
    // makes a get request for a game with a certain name
    // if the name doesn't exist, notify the user
    axios.get(url + '/user')
        .then(res => {
            let foundUser = false;
            for (let i = 0; i < res.data.length; i++) {
                if (res.data[i].name === queryName) {
                    let {auth, difficulty, glory, gold, name, slaves, soldiers, turn, hasbuiltcanal, hasbuiltpyramid, hasbuilttemple, hasfoughtbattle, hasreadoracle} = res.data[i];
                    playerData.turn = turn;
                    playerData.gold = gold;
                    playerData.soldiers = soldiers;
                    playerData.slaves = slaves;
                    playerData.authority = auth;
                    playerData.difficulty = difficulty;
                    playerData.glory = glory;
                    playerData.name = name;
                    playerData.hasBuiltCanal = hasbuiltcanal;
                    playerData.hasBuiltPyramid = hasbuiltpyramid;
                    playerData.hasBuiltTemple = hasbuilttemple;
                    playerData.hasFoughtBattle = hasfoughtbattle;
                    playerData.hasReadOracle = hasreadoracle;
                    foundUser = true;
                    startGame(name, true);
                    gameText.textContent = 'Game loaded!';
                    break;
                }
            }
            if (!foundUser) {
                // alert the user that there is no such game
                alert('User not found!');
            }
        })
}

function gameIsOver(name) {
    // makes a delete request to the server
    // only upon game completion or game faliure
}

function collapseEnding() {

}

function bankruptEnding() {

}

function badEndEasy() {

}

function goodEndEasy() {

}

function badEndMedium() {

}

function goodEndMedium() {

}

function badEndEasy() {

}

function goodEndEasy() {

}

// fancy text stuff
// ideally switch this out for some fancy css later (this breaks easy)

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

gameNext.addEventListener('click', advanceTurn);
gameSave.addEventListener('click', saveGame);
gameLoad.addEventListener('click', loadGame);