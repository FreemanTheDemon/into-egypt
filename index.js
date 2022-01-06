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

let tarotCard;
let tarotBtn;

let firstDice;
let secondDice;
let userPower;
let enemyPower;
let fightBtn;
let runBtn;
let randArmy;

let armySize;
let buildArmy;
let exitArmy;

let buildTemple;
let buildPyramid;
let buildCanal;
let exitBuild;
let temple;
let pyramid;
let canal;

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
    profilePic: 1,
    turn: 0,
    gold: 200,
    soldiers: 1000,
    slaves: 20000, 
    authority: 100,
    glory: 0,
    enemySize: 1000,
    hasFoughtBattle: false,
    hasReadOracle: false,
    hasBuiltPyramid: false,
    hasBuiltTemple: false,
    hasBuiltCanal: false
};

var currentEvent = {};
let eventOnScreen = false;
let gameOver = false;

const conan1 = new Audio('./resources/conan.mp3');
const startAudio = new Audio('./resources/fanfare.mp3')
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
        startAudio.play();
        startGame(name);
    } else if (e.target.id === 'medium-btn') {
        playerData.difficulty = 'medium';
        startAudio.play();
        startGame(name);
    } else if (e.target.id === 'hard-btn') {
        playerData.difficulty = 'hard';
        startAudio.play();
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
    if (!eventOnScreen && !gameOver) {

        // increment the turn
        playerData.turn++;
        eventOnScreen = true;
        
        // at the start of the turn, check the current stats to see if the player has lost or is at the end of the game

        
        // handle end game
        if (playerData.turn === 21 && playerData.difficulty === 'easy') {
            if (playerData.glory < 1000) {
                badEnd();
            } else {
                goodEnd();
            }
        }

        if (playerData.turn === 36 && playerData.difficulty === 'medium') {
            if (playerData.glory < 1500) {
                badEnd();
            } else {
                goodEnd();
            }
        }

        if (playerData.turn === 51 && playerData.difficulty === 'hard') {
            if (playerData.glory < 2600) {
                badEnd();
            } else {
                goodEnd();
            }
        }

        // if gold or authority is zero or below, the game is over and lost
        if (playerData.gold < 0) {
            bankruptEnding();
        }
        if (playerData.soldiers < 0) {
            invasionEnding();
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
            playerData.slaves += 1000;
        }

        // reset battle and oracle
        playerData.hasFoughtBattle = false;
        playerData.hasReadOracle = false;

        setStats();

        // handle scripted and random events
        if (playerData.difficulty !== 'conan' && !gameOver) {
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
        } else if (!gameOver) {
            if (playerData.turn === 1) {
                getScriptedEvent(11);
            } else if (playerData.turn === 2) {
                getScriptedEvent(12);
            } else if (playerData.turn === 3) {
                getScriptedEvent(13);
            } else if (playerData.turn === 4) {
                getScriptedEvent(14);
            } else if (playerData.turn === 5) {
                getScriptedEvent(15);
            } else if (playerData.turn === 6) {
                getScriptedEvent(16);
            } else if (playerData.turn === 7) {
                getScriptedEvent(17);
            } else if (playerData.turn === 8) {
                getScriptedEvent(18);
            } else if (playerData.turn === 9) {
                getScriptedEvent(19);
            } else if (playerData.turn === 10) {
                getScriptedEvent(20);
            }
        }

    }
}

function createEvent(eventObj) {
    // get the description and option name(s) from the event object
    let {event_desc, option_1, option_2, img_id, gold_1, gold_2, glory_1, glory_2, slaves_1, slaves_2, soldiers_1, soldiers_2, auth_1, auth_2, death_1, death_2} = eventObj;
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
        death_1: death_1,
        death_2: death_2,
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
        gameOptionTwo = document.querySelector('#option-2');
        gameOptionTwo.addEventListener('click', handleOptionClick);
    }
    gameOptionOne = document.querySelector('#option-1');
    gameOptionOne.addEventListener('click', handleOptionClick);
    // put the template onto the DOM
    // change the music
    // add some simple text to the footer
    // change the background image
    gameBox.style.backgroundImage = "url('./resources/events/" + img_id + ".png')";

}

function handleOptionClick(e) {
    // if the id of the button was option-1
    if (e.target.id === 'option-1') {
        // make the stat adjustments using the currentEvent variable for easy access to data
        if (currentEvent.death_1) {
            deathEnding();
        }
        playerData.gold += currentEvent.gold_1
        playerData.glory += currentEvent.glory_1

        if (playerData.slaves + currentEvent.slaves_1 < 0) {
            playerData.slaves = 0;
        } else {
            playerData.slaves += currentEvent.slaves_1
        }

        if (playerData.soldiers + currentEvent.soldiers_1 < 0) {
            playerData.soldiers = 0;
        } else {
            playerData.soldiers += currentEvent.soldiers_1
        }
        
        if (playerData.authority + currentEvent.auth_1 > 100) {
            playerData.authority = 100;
        } else {
            playerData.authority += currentEvent.auth_1
        }

    // else (the id of the button was option-2)
    } else {
        // make the other stat adjustments using the currentEvent variable for easy access to data
        if (currentEvent.death_2) {
            deathEnding();
        }
        playerData.gold += currentEvent.gold_2
        playerData.glory += currentEvent.glory_2

        if (playerData.slaves + currentEvent.slaves_2 < 0) {
            playerData.slaves = 0;
        } else {
            playerData.slaves += currentEvent.slaves_2
        }
        
        if (playerData.soldiers + currentEvent.soldiers_2 < 0) {
            playerData.soldiers = 0;
        } else {
            playerData.soldiers += currentEvent.soldiers_2
        }

        if (playerData.authority + currentEvent.auth_2 > 100) {
            playerData.authority = 100;
        } else {
            playerData.authority += currentEvent.auth_2
        }
    }

    // after if else statement, remove the event
    removeMenu('event');
    eventOnScreen = false;
    // change background back to default, maybe change music too
    gameBox.style.backgroundImage = "url('./resources/base.png')";
    // update/refresh stats
    // change footer text to default
    setStats();
}

function removeMenu(menuId) {
    var e = document.querySelector("#" + menuId);
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

function readOracle() {
    if (!playerData.hasReadOracle && !eventOnScreen) {
        gameBox.style.backgroundImage = "url('./resources/oracle_background.png')";
        eventOnScreen = true;
        playerData.hasReadOracle = true;
        let oracleMenuTemplate = `
        <div id="oracle">
            <img id="tarot-card" src="">
            <button id="tarot-btn" class="option-btn">Read the signs...</button>
        </div>
        `
        gameEvent.innerHTML += oracleMenuTemplate;
        tarotCard = document.querySelector('#tarot-card');
        tarotBtn = document.querySelector('#tarot-btn');
        tarotBtn.addEventListener('click', drawCard);
    } else if (eventOnScreen) {
        gameText.textContent = 'Only one menu at a time!';
    } else {
        gameText.textContent = 'You can only do this once per turn!';
    }
}

const tarotSound = new Audio('./resources/discovery.mp3');
function drawCard() {
    tarotBtn.style.display = 'none';
    tarotSound.currentTime = 0;
    tarotSound.play();
    let rand = Math.floor(Math.random() * (22));
    tarotCard.src = './resources/tarot/' + rand + '.png';

    if (rand === 0) {
        gameText.textContent = 'The Fool - Gain 20 gold and Lose 1000 slaves';
        playerData.gold += 20;
        playerData.slaves -= 1000;
    } else if (rand === 1) {
        gameText.textContent = 'The Magician - Gain 10 authority and Lose 10 gold';
        playerData.authority += 10;
        playerData.gold -= 10;
    } else if (rand === 2) {
        gameText.textContent = 'The High Priestess - Gain 200 glory and Lose 10 gold';
        playerData.glory += 200;
        playerData.gold -= 10;
    } else if (rand === 3) {
        gameText.textContent = 'The Empress - Gain 20 gold and Lose 100 glory';
        playerData.gold += 20;
        playerData.glory -= 100;
    } else if (rand === 4) {
        gameText.textContent = 'The Emperor - Gain 10 authority and Lose 200 soldiers';
        playerData.authority += 10;
        playerData.soldiers -= 200;
    } else if (rand === 5) {
        gameText.textContent = 'The Hierophant - Gain 200 glory and Lose 200 soldiers';
        playerData.glory += 200;
        playerData.soldiers -= 200;
    } else if (rand === 6) {
        gameText.textContent = 'The Lovers - Gain 2000 slaves and Lose 10 gold';
        playerData.slaves += 2000;
        playerData.gold -= 10;
    } else if (rand === 7) {
        gameText.textContent = 'The Chariot - Gain 500 soldiers and Lose 10 gold';
        playerData.soldiers += 500;
        playerData.gold -= 10;
    } else if (rand === 8) {
        gameText.textContent = 'Strength - Gain 500 soldiers and Lose 5 authority';
        playerData.soldiers += 500;
        playerData.authority -= 5;
    } else if (rand === 9) {
        gameText.textContent = 'The Hermit - Gain 200 glory and Lose 10 gold';
        playerData.glory += 200;
        playerData.gold -= 10;
    } else if (rand === 10) {
        gameText.textContent = 'Wheel of Fortune - Gain 100 gold!';
        playerData.gold += 100;
    } else if (rand === 11) {
        gameText.textContent = 'Justice - Gain 10 authority and Lose 1000 slaves';
        playerData.authority += 10;
        playerData.slaves -= 1000;
    } else if (rand === 12) {
        gameText.textContent = 'The Hanged Man - Gain 200 glory and Lose 1000 slaves';
        playerData.glory += 200;
        playerData.slaves -= 1000;
    } else if (rand === 13) {
        gameText.textContent = 'Death - Lose 5000 slaves!';
        playerData.slaves -= 5000;
    } else if (rand === 14) {
        gameText.textContent = 'Temperance - Gain 2000 slaves and Lose 100 glory';
        playerData.slaves += 1000;
        playerData.glory -= 100;
    } else if (rand === 15) {
        gameText.textContent = 'The Devil - Gain 20 gold and Lose 5 authority';
        playerData.gold += 20;
        playerData.authority -= 5;
    } else if (rand === 16) {
        gameText.textContent = 'The Tower - Gain 20 gold and Lose 200 soldiers';
        playerData.gold += 20;
        playerData.soldiers -= 200;
    } else if (rand === 17) {
        gameText.textContent = 'The Star - Gain 10 authority and Lose 10 gold';
        playerData.authority += 10;
        playerData.gold -= 10;
    } else if (rand === 18) {
        gameText.textContent = 'The Moon - Gain 500 soldiers and Lose 100 glory';
        playerData.soldiers += 500;
        playerData.glory -= 100;
    } else if (rand === 19) {
        gameText.textContent = 'The Sun - Gain 500 soldiers and lose 1000 slaves';
        playerData.soldiers += 500;
        playerData.slaves -= 1000;
    } else if (rand === 20) {
        gameText.textContent = 'Judgement - Gain 2000 slaves and Lose 200 soldiers';
        playerData.slaves += 2000;
        playerData.soldiers -= 200;
    } else if (rand === 21) {
        gameText.textContent = 'The World - Gain 500 glory!';
        playerData.glory += 500;
    }

    
    setStats();
    
    setTimeout(() => {
        eventOnScreen = false;
        gameBox.style.backgroundImage = "url('./resources/base.png')";
        removeMenu('oracle');
    }, 3500);
}

function fightBattle() {
    if (!playerData.hasFoughtBattle && !eventOnScreen) {
        eventOnScreen = true;
        playerData.hasFoughtBattle = true;
        randArmy = Math.floor(Math.random() * (50 - 5 + 1) + 5) * 100
        let battleMenuTemplate = `
        <div id="battle">
            <div id="army-1">
                <p id="user-army">Soldiers: ${playerData.soldiers}</p>
                <p class="power" id="user-power">Power: </p>
                <img class="dice" id="dice-1" src="">
            </div>
            <div id="army-2">
                <p id="enemy-army">Soldiers: ${randArmy}</p>
                <p class="power" id="enemy-power">Power: </p>
                <img class="dice" id="dice-2" src="">
            </div>
            <div id="event-btn-container">
                <button id="fight-btn" class="option-btn">Fight Battle!</button>
                <button id="run-btn" class="option-btn">RUN AWAY!</button>
            </div>
        </div>
        `
        gameEvent.innerHTML += battleMenuTemplate;
        gameBox.style.backgroundImage = "url('./resources/battle_background.png')";
        firstDice = document.querySelector('#dice-1');
        secondDice = document.querySelector('#dice-2');
        userPower = document.querySelector('#user-power');
        enemyPower = document.querySelector('#enemy-power');
        fightBtn = document.querySelector('#fight-btn');
        runBtn = document.querySelector('#run-btn');
        fightBtn.addEventListener('click', fight);
        runBtn.addEventListener('click', runAway);
    } else if (eventOnScreen) {
        gameText.textContent = 'Only one menu at a time!';
    } else {
        gameText.textContent = 'You can only do this once per turn!';
    }
}

const over9000 = new Audio('./resources/over_9000.mp3');
const battleAudio = new Audio('./resources/battle.mp3');
function fight() {
    runBtn.style.display = 'none';
    fightBtn.style.display = 'none';
    let rand1 = Math.floor(Math.random() * (6 - 1 + 1) + 1);
    let rand2 = Math.floor(Math.random() * (6 - 1 + 1) + 1);
    firstDice.src = './resources/dice/' + rand1 + '.png';
    secondDice.src = './resources/dice/' + rand2 + '.png';

    userPower.textContent += rand1 * playerData.soldiers;
    enemyPower.textContent += rand2 * randArmy;

    if (((rand1 * playerData.soldiers)) > 9000 || ((rand2 * randArmy) > 9000)) {
        over9000.currentTime = 0;
        over9000.play();
    } else {
        battleAudio.currentTime = 0;
        battleAudio.play();
    }

    if ((rand1 * playerData.soldiers) >= (rand2 * randArmy)) {
        // victory
        let slavesGained = Math.round(((randArmy / 4) * 10) / 1000) * 1000;
        let gloryGained = randArmy / 10;
        let soldiersLost = Math.round((randArmy / 4) / 100) * 100;
        playerData.slaves += slavesGained;
        playerData.glory += gloryGained;
        playerData.soldiers -= soldiersLost
        gameText.textContent = 'Hail the victor! You gained ' + slavesGained + ' slaves and ' + gloryGained + ' glory! ' + soldiersLost + ' soldiers were lost in this encounter.'
    } else {
        // loss
        let soldiersLost = (randArmy / 2) + 500;
        playerData.soldiers -= soldiersLost;
        playerData.glory -= 300;
        playerData.authority -= 10;
        gameText.textContent = 'Death befalls your soldiers! You lost ' + soldiersLost + ' soldiers, ' + 10 + ' authority and ' + 300 + ' glory!'
    }

    setStats();

    setTimeout(() => {
        eventOnScreen = false;
        gameBox.style.backgroundImage = "url('./resources/base.png')";
        removeMenu('battle');
    }, 4000);
}

const runSound = new Audio('./resources/run_away.mp3');
function runAway() {
    runSound.currentTime = 0;
    runSound.play();
    eventOnScreen = false;
    playerData.soldiers -= 100;
    setStats();
    gameBox.style.backgroundImage = "url('./resources/base.png')";
    removeMenu('battle');
    gameText.textContent = 'Run away!'
}

function manageArmy() {
    if (!eventOnScreen) {
        eventOnScreen = true;
        let armyMenuTemplate = `
        <div id="army">
            <h2>Spend 20 gold for 100 soldiers?</h2>
            <p id="army-size">Army size: ${playerData.soldiers}</p>
            <div id="event-btn-container">
                <button id="build-army" class="option-btn">Recriut</button>
                <button id="exit-army" class="option-btn">Exit Menu</button>
            </div>
        </div>
        `
        gameEvent.innerHTML += armyMenuTemplate;
        // gameBox.style.backgroundImage = "url('./resources/battle_background.png')";
        armySize = document.querySelector('#army-size');
        buildArmy = document.querySelector('#build-army');
        exitArmy = document.querySelector('#exit-army');
        buildArmy.addEventListener('click', recruit);
        exitArmy.addEventListener('click', exitArmyMenu);
    } else {
        gameText.textContent = 'Only one menu at a time!';
    }
}

function recruit() {
    if (playerData.gold >= 20) {
        playerData.gold -= 20
        playerData.soldiers += 100;
        setStats();
        armySize.textContent = `Army size: ${playerData.soldiers}`
    } else {
        gameText.textContent = 'Not enough funds!';
    }
}

function exitArmyMenu() {
    eventOnScreen = false;
    gameBox.style.backgroundImage = "url('./resources/base.png')";
    removeMenu('army');
}

function buildWonders() {
    if (!eventOnScreen) {
        eventOnScreen = true;
        let buildMenuTemplate = `
        <div id="wonders">
            <h2>Build a Wonder!</h2>
            <div id="wonder-container">
                <div>
                    <img id="temple" class="building" src="./resources/luxor.png">
                    <p>Temple of Luxor</p>
                    <p>Costs 10000 slaves and 200 gold</p>
                    <p>Generates 1 authority per turn</p>
                    <button id="build-temple" class="option-btn">Build</button>
                </div>
                <div>
                    <img id="pyarmid" class="building" src="./resources/pyramid.png">
                    <p>Great Pyramid</p>
                    <p>Costs 20000 slaves and 400 gold</p>
                    <p>Generates 100 glory per turn</p>
                    <button id="build-pyramid" class="option-btn">Build</button>
                </div>
                <div>
                    <img id="canal" class="building" src="./resources/canal.png">
                    <p>Canal of the Pharaohs</p>
                    <p>Costs 30000 slaves and 600 gold</p>
                    <p>Generates 50 gold and 1000 slaves per turn</p>
                    <button id="build-canal" class="option-btn">Build</button>
                </div>
            </div>
            <button id="exit-build" class="option-btn">Exit</button>
        </div>
        `
        gameEvent.innerHTML += buildMenuTemplate;
        // gameBox.style.backgroundImage = "url('./resources/battle_background.png')";

        buildTemple = document.querySelector('#build-temple');
        buildPyramid = document.querySelector('#build-pyramid');
        buildCanal = document.querySelector('#build-canal');
        exitBuild = document.querySelector('#exit-build');
        temple = document.querySelector('#temple');
        pyramid = document.querySelector('#pyramid');
        canal = document.querySelector('#canal');
        buildTemple.addEventListener('click', buildTempleHandler);
        buildPyramid.addEventListener('click', buildPyramidHandler);
        buildCanal.addEventListener('click', buildCanalHandler);
        exitBuild.addEventListener('click', exitBuildMenu);

        if (playerData.hasBuiltPyramid) {
            pyramid.style.filter = 'grayscale(100%)';
        }
        if (playerData.hasBuiltTemple) {
            temple.style.filter = 'grayscale(100%)';
        }
        if (playerData.hasBuiltCanal) {
            canal.style.filter = 'grayscale(100%)';
        }
    } else {
        gameText.textContent = 'Only one menu at a time!';
    }
}

function exitBuildMenu() {
    eventOnScreen = false;
    gameBox.style.backgroundImage = "url('./resources/base.png')";
    removeMenu('wonders');
}

function buildTempleHandler() {
    if (!playerData.hasBuiltTemple && playerData.slaves >= 10000 && playerData.gold >= 200) {
        playerData.hasBuiltTemple = true;
        playerData.slaves -= 10000;
        playerData.gold -= 200;
        setStats();
        temple.style.filter = 'grayscale(100%)';
        gameText.textContent = 'You\'ve built the Temple of Luxor!'
    } else if (playerData.hasBuiltTemple) {
        gameText.textContent = 'You\'ve already built the temple!'
    } else {
        gameText.textContent = 'You don\'t have enough funds!'
    }
}

function buildPyramidHandler() {
    if (!playerData.hasBuiltPyramid && playerData.slaves >= 20000 && playerData.gold >= 400) {
        playerData.hasBuiltPyramid = true;
        playerData.slaves -= 10000;
        playerData.gold -= 200;
        setStats();
        pyramid.style.filter = 'grayscale(100%)';
        gameText.textContent = 'You\'ve built the Great Pyramid!'
    } else if (playerData.hasBuiltPyramid) {
        gameText.textContent = 'You\'ve already built the pyramid!'
    } else {
        gameText.textContent = 'You don\'t have enough funds!'
    }
}

function buildCanalHandler() {
    if (!playerData.hasBuiltCanal && playerData.slaves >= 30000 && playerData.gold >= 600) {
        playerData.hasBuiltCanal = true;
        playerData.slaves -= 30000;
        playerData.gold -= 600;
        setStats();
        canal.style.filter = 'grayscale(100%)';
        gameText.textContent = 'You\'ve built the Canal of the Pharaohs!'
    } else if (playerData.hasBuiltCanal) {
        gameText.textContent = 'You\'ve already built the canal!'
    } else {
        gameText.textContent = 'You don\'t have enough funds!'
    }
}

function saveGame() {
    // makes a post request to add a name to the database through the server
    if (!eventOnScreen && !gameOver) {
        axios.post(url + '/user', {
            difficulty: playerData.difficulty,
            name: playerData.name,
            profilePic: playerData.profilePic,
            gold: playerData.gold,
            turn: playerData.turn,
            soldiers: playerData.soldiers,
            slaves: playerData.slaves,
            authority: playerData.authority,
            glory: playerData.glory,
            enemySize: playerData.enemySize,
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
        gameText.textContent = 'Not available!';
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
                    let {auth, difficulty, glory, profile_pic, gold, name, slaves, soldiers, turn, enemy_size, has_built_canal, has_built_pyramid, has_built_temple, has_fought_battle, has_read_oracle} = res.data[i];
                    playerData.turn = turn;
                    playerData.gold = gold;
                    playerData.profilePic = profile_pic;
                    playerData.soldiers = soldiers;
                    playerData.slaves = slaves;
                    playerData.authority = auth;
                    playerData.difficulty = difficulty;
                    playerData.glory = glory;
                    playerData.name = name;
                    playerData.enemySize = enemy_size;
                    playerData.hasBuiltCanal = has_built_canal;
                    playerData.hasBuiltPyramid = has_built_pyramid;
                    playerData.hasBuiltTemple = has_built_temple;
                    playerData.hasFoughtBattle = has_fought_battle;
                    playerData.hasReadOracle = has_read_oracle;
                    foundUser = true;
                    startGame(name, true);
                    gameText.textContent = 'Game loaded!';
                    break;
                }
            }
            if (!foundUser) {
                // alert the user that there is no such game
                gameText.textContent = 'User not found!';

            }
        })
}

function gameIsOver() {
    // makes a delete request to the server
    // only upon game completion or game faliure
    axios.delete(url + '/user/', {data: {name: playerData.name}})
        .then(res => {
            // game over
        })
}

function deathEnding() {
    gameOver = true;
    gameText.textContent = 'And the Pharaoh\'s whole host was consumed by the waves... GAME OVER';
    setTimeout(() => {
        gameBox.style.backgroundImage = "url('./resources/endings/end_death.png')";
    }, 200);
    gameIsOver();
}

function invasionEnding() {
    gameOver = true;
    gameText.textContent = 'Egypt has fallen, trampled by its enemies... GAME OVER';
    setTimeout(() => {
        gameBox.style.backgroundImage = "url('./resources/endings/end_invasion.png')";
    }, 200);
}

function collapseEnding() {
    gameOver = true;
    gameText.textContent = 'Your power crumbles, and so do your dreams... GAME OVER';
    setTimeout(() => {
        gameBox.style.backgroundImage = "url('./resources/endings/end_collapse.png')";
    }, 200);
    gameIsOver();
}

function bankruptEnding() {
    gameOver = true;
    gameText.textContent = 'Considering your current funds, it\'s clear that you\'re no King Midas... GAME OVER';
    setTimeout(() => {
        gameBox.style.backgroundImage = "url('./resources/endings/end_bankrupt.png')";
    }, 200);
    gameIsOver();
}

function badEnd() {
    gameOver = true;
    gameText.textContent = 'You\'ve won! However, you didn\'t get enough glory to be remembered in history... GAME OVER';
    setTimeout(() => {
        gameBox.style.backgroundImage = "url('./resources/endings/end_boring.png')";
    }, 200);
    gameIsOver();
}

function goodEnd() {
    gameOver = true;
    gameText.textContent = 'Eternal victory! You\'ll be remembered for generations to come!... GAME OVER';
    setTimeout(() => {
        gameBox.style.backgroundImage = "url('./resources/endings/end_glory.png')";
    }, 200);
    gameIsOver();
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

gameOracle.addEventListener('click', readOracle);
gameFight.addEventListener('click', fightBattle);
gameManage.addEventListener('click', manageArmy);
gameBuild.addEventListener('click', buildWonders);


/*
TO DO:
    HIGH IMPORTANCE
    - Add manage nation menu
        - Maybe call it manage army
        - Spend gold to make a bigger army (10 gold/100 soldiers?)
    - Add building menu
        - Three one-time buildings represented by pictures
        - Change pictures when buildings are built
        - Big cost, long-term reward
    LOW IMPORTANCE
    - Add a profile picture selection option
    - Add music/audio to improve immersion
    - Add ten Conan events with pictures
        - Change the names of the stats when playing as Conan

*/