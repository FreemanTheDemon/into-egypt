const BASE_BACKGROUND = './resources/base.png';
const ORACLE_BACKGROUND = './resources/oracle_background.png';
const BATTLE_BACKGROUND = './resources/battle_background.png';

const SAVE_KEY_PREFIX = 'into-egypt-save:';
const MAX_NAME_LENGTH = 21;
const TYPEWRITER_DELAY_MS = 75;
const ORACLE_CLOSE_DELAY_MS = 3500;
const BATTLE_CLOSE_DELAY_MS = 4000;
const POWER_LEVEL_MEME_THRESHOLD = 9000;

const ONE_MENU_MESSAGE = 'Only one menu at a time!';
const ONCE_PER_TURN_MESSAGE = 'You can only do this once per turn!';

const $ = selector => document.querySelector(selector);

const elements = {
    gameBox: $('#game-box'),
    startScreen: $('#game-start'),
    nameInput: $('#insert-name'),
    playerInfo: $('#game-info'),
    portrait: $('#char-picture'),
    playerName: $('#char-name'),
    menuArea: $('#game-event'),
    message: $('#game-text'),
    endTurnButton: $('#game-next'),
    saveButton: $('#game-save'),
    loadButton: $('#game-load'),
    loadInput: $('#insert-character'),
    stats: {
        turn: $('#char-turn'),
        gold: $('#char-gold'),
        soldiers: $('#char-soldiers'),
        slaves: $('#char-slaves'),
        authority: $('#char-auth'),
        glory: $('#char-glory'),
    },
};

const sounds = {
    fanfare: new Audio('./resources/fanfare.mp3'),
    conan: new Audio('./resources/conan.mp3'),
    tarot: new Audio('./resources/discovery.mp3'),
    battle: new Audio('./resources/battle.mp3'),
    over9000: new Audio('./resources/over_9000.mp3'),
    runAway: new Audio('./resources/run_away.mp3'),
};

let player = null;
let activeMenu = null;
let isGameOver = false;
let typewriterTimer = null;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(items) {
    return items[randomInt(0, items.length - 1)];
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

function setBackground(imagePath) {
    elements.gameBox.style.backgroundImage = `url('${imagePath}')`;
}

function showMessage(text) {
    stopTypewriter();
    elements.message.textContent = text;
}

function typeMessage(text) {
    stopTypewriter();
    let shownLength = 0;
    elements.message.textContent = '';
    typewriterTimer = setInterval(() => {
        shownLength++;
        elements.message.textContent = text.slice(0, shownLength);
        if (shownLength >= text.length) {
            stopTypewriter();
        }
    }, TYPEWRITER_DELAY_MS);
}

function stopTypewriter() {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
}

function createPlayer(name, difficulty) {
    return {
        name,
        difficulty,
        turn: 0,
        ...STARTING_STATS,
        hasFoughtBattle: false,
        hasReadOracle: false,
        builtWonders: [],
    };
}

function applyEffects(effects) {
    for (const [stat, change] of Object.entries(effects)) {
        player[stat] += change;
    }
    player.soldiers = Math.max(0, player.soldiers);
    player.slaves = Math.max(0, player.slaves);
    player.authority = Math.min(MAX_AUTHORITY, player.authority);
    renderStats();
}

function renderStats() {
    for (const [stat, element] of Object.entries(elements.stats)) {
        element.textContent = player[stat];
    }
}

function describeEffects(effects) {
    const gains = [];
    const losses = [];
    for (const [stat, change] of Object.entries(effects)) {
        (change > 0 ? gains : losses).push(`${Math.abs(change)} ${stat}`);
    }
    const parts = [];
    if (gains.length > 0) parts.push(`Gain ${gains.join(' and ')}`);
    if (losses.length > 0) parts.push(`Lose ${losses.join(' and ')}`);
    return parts.length === 1 ? `${parts[0]}!` : parts.join(' and ');
}

function handleDifficultyClick(event) {
    const name = elements.nameInput.value.trim();
    if (name.length === 0) {
        showMessage('The Pharaoh cannot be unnamed!');
        return;
    }
    if (name.length > MAX_NAME_LENGTH) {
        showMessage('The Pharaoh\'s name is too long!');
        return;
    }

    const difficulty = name === CONAN_NAME ? 'conan' : event.currentTarget.dataset.difficulty;
    const config = DIFFICULTIES[difficulty];
    player = createPlayer(config.displayName ?? name, difficulty);

    showGameScreen();
    if (config.intro) {
        playSound(sounds.conan);
        typeMessage(config.intro);
    } else {
        playSound(sounds.fanfare);
    }
    advanceTurn();
}

function showGameScreen() {
    const config = DIFFICULTIES[player.difficulty];
    elements.startScreen.style.display = 'none';
    elements.loadInput.style.display = 'none';
    elements.loadButton.style.display = 'none';
    elements.playerInfo.style.display = 'block';
    elements.endTurnButton.style.display = 'block';
    elements.saveButton.style.display = 'block';
    elements.playerName.textContent = player.name;
    if (config.portrait) {
        elements.portrait.src = config.portrait;
    }
    setBackground(config.background ?? BASE_BACKGROUND);
    renderStats();
}

function saveKey(name) {
    return SAVE_KEY_PREFIX + name;
}

function saveGame() {
    if (isGameOver || activeMenu) {
        showMessage('Not available!');
        return;
    }
    try {
        localStorage.setItem(saveKey(player.name), JSON.stringify(player));
        showMessage('Game saved!');
    } catch {
        showMessage('Could not save the game in this browser!');
    }
}

function loadGame() {
    let saved;
    try {
        const json = localStorage.getItem(saveKey(elements.loadInput.value.trim()));
        saved = json && JSON.parse(json);
    } catch {
        showMessage('Could not read saved games in this browser!');
        return;
    }
    if (!saved) {
        showMessage('User not found!');
        return;
    }
    player = saved;
    showGameScreen();
    showMessage('Game loaded!');
}

function deleteSave() {
    try {
        localStorage.removeItem(saveKey(player.name));
    } catch {}
}

function advanceTurn() {
    if (isGameOver) return;
    if (activeMenu) {
        showMessage(ONE_MENU_MESSAGE);
        return;
    }

    player.turn++;
    const ending = findEnding();
    if (ending) {
        endGame(ending);
        return;
    }

    collectTurnIncome();
    player.hasFoughtBattle = false;
    player.hasReadOracle = false;
    renderStats();

    const event = pickTurnEvent();
    if (event) {
        openEventMenu(event);
    }
}

function findEnding() {
    if (player.gold < 0) return 'bankrupt';
    if (player.soldiers <= 0) return 'invasion';
    if (player.authority <= 0) return 'collapse';

    const { finalTurn, gloryToWin } = DIFFICULTIES[player.difficulty];
    if (player.turn === finalTurn) {
        return player.glory >= gloryToWin ? 'glory' : 'forgotten';
    }
    return null;
}

function collectTurnIncome() {
    if (player.turn === 1) return;
    applyEffects({ gold: Math.floor(player.slaves / SLAVES_PER_GOLD_INCOME) });
    for (const wonder of player.builtWonders) {
        applyEffects(WONDERS[wonder].perTurn);
    }
}

function pickTurnEvent() {
    const { scriptedEvents, hasRandomEvents } = DIFFICULTIES[player.difficulty];
    const scriptedId = scriptedEvents[player.turn];
    if (scriptedId) return SCRIPTED_EVENTS[scriptedId];
    if (hasRandomEvents) return randomItem(RANDOM_EVENTS);
    return null;
}

function endGame(endingKey) {
    const ending = ENDINGS[endingKey];
    isGameOver = true;
    if (activeMenu) {
        closeMenu();
    }
    renderStats();
    setBackground(ending.image);
    showMessage(ending.text);
    deleteSave();
}

function canOpenMenu() {
    if (isGameOver) return false;
    if (activeMenu) {
        showMessage(ONE_MENU_MESSAGE);
        return false;
    }
    return true;
}

function openMenu(html, background) {
    elements.menuArea.innerHTML = html;
    activeMenu = elements.menuArea.firstElementChild;
    if (background) {
        setBackground(background);
    }
    return activeMenu;
}

function closeMenu() {
    activeMenu.remove();
    activeMenu = null;
    setBackground(BASE_BACKGROUND);
}

function hideButtons(menu) {
    menu.querySelectorAll('button').forEach(button => {
        button.style.display = 'none';
    });
}

function openEventMenu(event) {
    const heading = event.options.length > 1 ? 'Choose Wisely' : 'Fate is outside your hands!';
    const buttons = event.options
        .map((option, index) => `<button class="option-btn" data-option="${index}">${option.label}</button>`)
        .join('');
    const menu = openMenu(`
        <div id="event">
            <h2>${heading}</h2>
            <p id="event-desc">${event.description}</p>
            <div id="event-btn-container">${buttons}</div>
        </div>
    `, `./resources/events/${event.image}.png`);

    menu.querySelectorAll('[data-option]').forEach(button => {
        button.addEventListener('click', () => chooseEventOption(event.options[button.dataset.option]));
    });
}

function chooseEventOption(option) {
    closeMenu();
    if (option.isFatal) {
        endGame('death');
        return;
    }
    applyEffects(option.effects);
}

function openOracle() {
    if (!canOpenMenu()) return;
    if (player.hasReadOracle) {
        showMessage(ONCE_PER_TURN_MESSAGE);
        return;
    }
    player.hasReadOracle = true;

    const menu = openMenu(`
        <div id="oracle">
            <img id="tarot-card" alt="">
            <button id="tarot-btn" class="option-btn">Read the signs...</button>
        </div>
    `, ORACLE_BACKGROUND);
    menu.querySelector('#tarot-btn').addEventListener('click', drawTarotCard);
}

function drawTarotCard() {
    hideButtons(activeMenu);
    playSound(sounds.tarot);

    const cardIndex = randomInt(0, TAROT_CARDS.length - 1);
    const card = TAROT_CARDS[cardIndex];
    activeMenu.querySelector('#tarot-card').src = `./resources/tarot/${cardIndex}.png`;
    applyEffects(card.effects);
    showMessage(`${card.name} - ${describeEffects(card.effects)}`);

    setTimeout(closeMenu, ORACLE_CLOSE_DELAY_MS);
}

function openBattle() {
    if (!canOpenMenu()) return;
    if (player.hasFoughtBattle) {
        showMessage(ONCE_PER_TURN_MESSAGE);
        return;
    }
    player.hasFoughtBattle = true;

    const enemySoldiers = randomInt(ENEMY_ARMY_MIN / 100, ENEMY_ARMY_MAX / 100) * 100;
    const menu = openMenu(`
        <div id="battle">
            <div id="army-1">
                <p id="user-army">Soldiers: ${player.soldiers}</p>
                <p class="power" id="user-power">Power: </p>
                <img class="dice" id="dice-1" alt="">
            </div>
            <div id="army-2">
                <p id="enemy-army">Soldiers: ${enemySoldiers}</p>
                <p class="power" id="enemy-power">Power: </p>
                <img class="dice" id="dice-2" alt="">
            </div>
            <div id="event-btn-container">
                <button id="fight-btn" class="option-btn">Fight Battle!</button>
                <button id="run-btn" class="option-btn">RUN AWAY!</button>
            </div>
        </div>
    `, BATTLE_BACKGROUND);
    menu.querySelector('#fight-btn').addEventListener('click', () => fight(enemySoldiers));
    menu.querySelector('#run-btn').addEventListener('click', runAway);
}

function fight(enemySoldiers) {
    hideButtons(activeMenu);

    const playerRoll = randomInt(1, 6);
    const enemyRoll = randomInt(1, 6);
    const playerPower = playerRoll * player.soldiers;
    const enemyPower = enemyRoll * enemySoldiers;

    activeMenu.querySelector('#dice-1').src = `./resources/dice/${playerRoll}.png`;
    activeMenu.querySelector('#dice-2').src = `./resources/dice/${enemyRoll}.png`;
    activeMenu.querySelector('#user-power').textContent = `Power: ${playerPower}`;
    activeMenu.querySelector('#enemy-power').textContent = `Power: ${enemyPower}`;
    playSound(Math.max(playerPower, enemyPower) > POWER_LEVEL_MEME_THRESHOLD ? sounds.over9000 : sounds.battle);

    showMessage(playerPower >= enemyPower ? winBattle(enemySoldiers) : loseBattle(enemySoldiers));
    setTimeout(closeMenu, BATTLE_CLOSE_DELAY_MS);
}

function winBattle(enemySoldiers) {
    const spoils = Math.round(enemySoldiers / 400);
    const slavesGained = spoils * 1000;
    const soldiersLost = spoils * 100;
    const gloryGained = enemySoldiers / 10;
    applyEffects({ slaves: slavesGained, glory: gloryGained, soldiers: -soldiersLost });
    return `Hail the victor! You gained ${slavesGained} slaves and ${gloryGained} glory! ${soldiersLost} soldiers were lost in this encounter.`;
}

function loseBattle(enemySoldiers) {
    const soldiersLost = enemySoldiers / 2 + 500;
    applyEffects({ soldiers: -soldiersLost, glory: -BATTLE_LOSS_GLORY, authority: -BATTLE_LOSS_AUTHORITY });
    return `Death befalls your soldiers! You lost ${soldiersLost} soldiers, ${BATTLE_LOSS_AUTHORITY} authority and ${BATTLE_LOSS_GLORY} glory!`;
}

function runAway() {
    playSound(sounds.runAway);
    applyEffects({ soldiers: -RUN_AWAY_SOLDIER_LOSS });
    closeMenu();
    showMessage('Run away!');
}

function openArmyMenu() {
    if (!canOpenMenu()) return;

    const menu = openMenu(`
        <div id="army">
            <h2>Spend ${RECRUIT_COST} gold for ${RECRUIT_SOLDIERS} soldiers?</h2>
            <p id="army-size">Army size: ${player.soldiers}</p>
            <div id="event-btn-container">
                <button id="build-army" class="option-btn">Recruit</button>
                <button id="exit-army" class="option-btn">Exit Menu</button>
            </div>
        </div>
    `);
    menu.querySelector('#build-army').addEventListener('click', recruit);
    menu.querySelector('#exit-army').addEventListener('click', closeMenu);
}

function recruit() {
    if (player.gold < RECRUIT_COST) {
        showMessage('Not enough funds!');
        return;
    }
    applyEffects({ gold: -RECRUIT_COST, soldiers: RECRUIT_SOLDIERS });
    activeMenu.querySelector('#army-size').textContent = `Army size: ${player.soldiers}`;
}

function openWondersMenu() {
    if (!canOpenMenu()) return;

    const cards = Object.entries(WONDERS).map(([key, wonder]) => `
        <div>
            <img class="building" data-wonder-image="${key}" src="${wonder.image}" alt="${wonder.name}">
            <p>${wonder.name}</p>
            <p>Costs ${wonder.cost.slaves} slaves and ${wonder.cost.gold} gold</p>
            <p>Generates ${wonder.perTurnText} per turn</p>
            <button class="option-btn" data-wonder="${key}">Build</button>
        </div>
    `).join('');
    const menu = openMenu(`
        <div id="wonders">
            <h2>Build a Wonder!</h2>
            <div id="wonder-container">${cards}</div>
            <button id="exit-build" class="option-btn">Exit</button>
        </div>
    `);

    menu.querySelectorAll('[data-wonder]').forEach(button => {
        button.addEventListener('click', () => buildWonder(button.dataset.wonder));
    });
    menu.querySelector('#exit-build').addEventListener('click', closeMenu);
    player.builtWonders.forEach(markWonderBuilt);
}

function buildWonder(key) {
    const wonder = WONDERS[key];
    if (player.builtWonders.includes(key)) {
        showMessage(`You've already built the ${wonder.name}!`);
        return;
    }
    if (player.slaves < wonder.cost.slaves || player.gold < wonder.cost.gold) {
        showMessage('You don\'t have enough funds!');
        return;
    }
    player.builtWonders.push(key);
    applyEffects({ slaves: -wonder.cost.slaves, gold: -wonder.cost.gold });
    markWonderBuilt(key);
    showMessage(`You've built the ${wonder.name}!`);
}

function markWonderBuilt(key) {
    activeMenu.querySelector(`[data-wonder-image="${key}"]`).style.filter = 'grayscale(100%)';
}

document.querySelectorAll('.diff-btn').forEach(button => {
    button.addEventListener('click', handleDifficultyClick);
});
elements.endTurnButton.addEventListener('click', advanceTurn);
elements.saveButton.addEventListener('click', saveGame);
elements.loadButton.addEventListener('click', loadGame);
$('#game-fight').addEventListener('click', openBattle);
$('#game-build').addEventListener('click', openWondersMenu);
$('#game-manage').addEventListener('click', openArmyMenu);
$('#game-oracle').addEventListener('click', openOracle);

typeMessage('Begin your reign...');

// TODO: let the player pick a portrait.
// TODO: rename the stats while playing as Conan.
// TODO: add background music, changing it for events.
// TODO: replace the typewriter interval with a CSS animation.
