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
    gold: 100,
    soldiers: 1000,
    slaves: 10000, 
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

function drawCard() {
    tarotBtn.style.display = 'none';
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
        removeMenu('oracle');
    }, 3500);
}

function fightBattle() {
    if (!playerData.hasFoughtBattle && !eventOnScreen) {
        eventOnScreen = true;
        playerData.hasReadOracle = true;
        let randArmy = Math.floor(Math.random() * (50 - 5 + 1) + 5) * 100
        let battleMenuTemplate = `
        <div id="battle">
            <div id="army-1">
                <p id="user-army">Soldiers: ${playerData.soldiers}</p>
                <p id="user-power">Power: </p>
                <img id="dice-1" src="">
            </div>
            <div id="army-2">
                <p id="enemy-army">Soldiers: ${randArmy}</p>
                <p id="enemy-power">Power: </p>
                <img id="dice-2" src="">
            </div>
            <div id="event-btn-container">
                <button id="fight-btn" class="option-btn">Fight Battle!</button>
                <button id="run-btn" class="option-btn">RUN AWAY!</button>
            </div>
        </div>
        `
        gameEvent.innerHTML += battleMenuTemplate;
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

function fight() {

}

const runSound = new Audio('./resources/run_away.mp3');
function runAway() {
    runSound.currentTime = 0;
    runSound.play();
    removeMenu('battle');
    gameText.textContent = 'Run away!'
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


/*
TO DO:
    HIGH IMPORTANCE
    - Add tarot oracle feature
        - Opens a template menu with two buttons
            - One button draws and displays a card
            - The other button goes back
    - Add manage nation menu
        - Maybe call it manage army
        - Spend gold to make a bigger army (10 gold/100 soldiers?)
    - Add battles
        - Generate random enemy army size every turn
        - Opens a template menu with two buttons and comments on the size of the enemy army
            - Run away (play monty python audio)
            - Fight battle (wait time for suspense) (maybe play warlords battle audio)
        - Random enemy size between a reasonable range
        - Computer and player both roll one dice
        - To determine the winner:
            - Multiply the army sizes by the dice and compare
            - The biggest number wins
        - If the player loses:
            - Lose soldiers equal to 1/2 the size of the enemy army
            - Lose glory (probably fixed)
        - If the player wins:
            - Lose soldiers equal to 1/8 (maybe 1/4?) the size of the enemy army
            - Gain slaves equal to half the size of the enemy army multiplied by ten, and then rounded (up/down?) to the nearest thousand
            - Gain some glory (maybe in proportion to the size of the enemy army)
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