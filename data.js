// Soldiers move in hundreds (Ramses II had 20,000); slaves in thousands (~200,000 in the New Kingdom).
const STARTING_STATS = {
    gold: 400,
    soldiers: 3000,
    slaves: 10000,
    authority: 100,
    glory: 0,
};

const MAX_AUTHORITY = 100;
const SLAVES_PER_GOLD_INCOME = 1000;

const RECRUIT_COST = 20;
const RECRUIT_SOLDIERS = 100;

const ENEMY_ARMY_MIN = 500;
const ENEMY_ARMY_MAX = 5000;
const BATTLE_LOSS_GLORY = 300;
const BATTLE_LOSS_AUTHORITY = 10;
const RUN_AWAY_SOLDIER_LOSS = 100;

const CONAN_NAME = 'Conan';

// scriptedEvents maps a turn number to a SCRIPTED_EVENTS id.
const DIFFICULTIES = {
    easy: {
        finalTurn: 21,
        gloryToWin: 1000,
        hasRandomEvents: true,
        scriptedEvents: { 12: 1, 14: 2 },
    },
    medium: {
        finalTurn: 36,
        gloryToWin: 1500,
        hasRandomEvents: true,
        scriptedEvents: { 12: 3, 14: 4, 16: 5 },
    },
    hard: {
        finalTurn: 51,
        gloryToWin: 2600,
        hasRandomEvents: true,
        scriptedEvents: { 12: 6, 14: 7, 16: 8, 18: 9, 20: 10 },
    },
    // TODO: write Conan's ten scripted events (with pictures) and an end condition; until then his reign has no events and never ends.
    conan: {
        displayName: 'Conan the Barbarian',
        portrait: './resources/conan_pic.png',
        background: './resources/conan_background.png',
        intro: 'Between the time when the oceans drank Atlantis, and the rise of the sons of Aryas, there was an age undreamed of. And unto this, Conan, destined to wear the jeweled crown of Aquilonia upon a troubled brow. It is I, his chronicler, who alone can tell thee of his saga...',
        hasRandomEvents: false,
        scriptedEvents: {},
    },
};

const TAROT_CARDS = [
    { name: 'The Fool', effects: { gold: 20, slaves: -1000 } },
    { name: 'The Magician', effects: { authority: 10, gold: -10 } },
    { name: 'The High Priestess', effects: { glory: 200, gold: -10 } },
    { name: 'The Empress', effects: { gold: 20, glory: -100 } },
    { name: 'The Emperor', effects: { authority: 10, soldiers: -200 } },
    { name: 'The Hierophant', effects: { glory: 200, soldiers: -200 } },
    { name: 'The Lovers', effects: { slaves: 2000, gold: -10 } },
    { name: 'The Chariot', effects: { soldiers: 500, gold: -10 } },
    { name: 'Strength', effects: { soldiers: 500, authority: -5 } },
    { name: 'The Hermit', effects: { glory: 200, gold: -10 } },
    { name: 'Wheel of Fortune', effects: { gold: 100 } },
    { name: 'Justice', effects: { authority: 10, slaves: -1000 } },
    { name: 'The Hanged Man', effects: { glory: 200, slaves: -1000 } },
    { name: 'Death', effects: { slaves: -5000 } },
    { name: 'Temperance', effects: { slaves: 2000, glory: -100 } },
    { name: 'The Devil', effects: { gold: 20, authority: -5 } },
    { name: 'The Tower', effects: { gold: 20, soldiers: -200 } },
    { name: 'The Star', effects: { authority: 10, gold: -10 } },
    { name: 'The Moon', effects: { soldiers: 500, glory: -100 } },
    { name: 'The Sun', effects: { soldiers: 500, slaves: -1000 } },
    { name: 'Judgement', effects: { slaves: 2000, soldiers: -200 } },
    { name: 'The World', effects: { glory: 500 } },
];

const WONDERS = {
    temple: {
        name: 'Temple of Luxor',
        image: './resources/luxor.png',
        cost: { slaves: 10000, gold: 200 },
        perTurn: { authority: 1 },
        perTurnText: '1 authority',
    },
    pyramid: {
        name: 'Great Pyramid',
        image: './resources/pyramid.png',
        cost: { slaves: 20000, gold: 400 },
        perTurn: { glory: 100 },
        perTurnText: '100 glory',
    },
    canal: {
        name: 'Canal of the Pharaohs',
        image: './resources/canal.png',
        cost: { slaves: 30000, gold: 600 },
        perTurn: { gold: 50, slaves: 1000 },
        perTurnText: '50 gold and 1000 slaves',
    },
};

const ENDINGS = {
    death: {
        text: 'And the Pharaoh\'s whole host was consumed by the waves... GAME OVER',
        image: './resources/endings/end_death.png',
    },
    invasion: {
        text: 'Egypt has fallen, trampled by its enemies... GAME OVER',
        image: './resources/endings/end_invasion.png',
    },
    collapse: {
        text: 'Your power crumbles, and so do your dreams... GAME OVER',
        image: './resources/endings/end_collapse.png',
    },
    bankrupt: {
        text: 'Considering your current funds, it\'s clear that you\'re no King Midas... GAME OVER',
        image: './resources/endings/end_bankrupt.png',
    },
    forgotten: {
        text: 'You\'ve won! However, you didn\'t get enough glory to be remembered in history... GAME OVER',
        image: './resources/endings/end_boring.png',
    },
    glory: {
        text: 'Eternal victory! You\'ll be remembered for generations to come!... GAME OVER',
        image: './resources/endings/end_glory.png',
    },
};

const RANDOM_EVENTS = [
    {
        description: "Our merchants bring great wealth to Khmet!",
        image: 1,
        options: [
            { label: "GOLD!", effects: { gold: 100 } },
        ],
    },
    {
        description: "Our priests have made word known of the great times to come!",
        image: 2,
        options: [
            { label: "Glorious!", effects: { authority: 5, glory: 100 } },
        ],
    },
    {
        description: "The Nile gives us a great harvest! Our population rises!",
        image: 3,
        options: [
            { label: "Wonderful!", effects: { gold: 20, soldiers: 300, slaves: 3000 } },
        ],
    },
    {
        description: "A slave merchant offers to sell you 5000 slaves for 50 gold!",
        image: 4,
        options: [
            { label: "Buy", effects: { gold: -50, slaves: 5000 } },
            { label: "Decline", effects: {} },
        ],
    },
    {
        description: "The priests say that it is about time for a sacrifice. It would cost the nation 50 gold.",
        image: 5,
        options: [
            { label: "Sacrifice", effects: { gold: -50, authority: 10, glory: 100 } },
            { label: "Not now", effects: {} },
        ],
    },
    {
        description: "A band of 500 mercenaries offer their services in exchange for a large one-time payment of 50 gold.",
        image: 6,
        options: [
            { label: "Hire them", effects: { gold: -50, soldiers: 500 } },
            { label: "Decline", effects: {} },
        ],
    },
    {
        description: "A distant wealthy family member has died without a will! What shall we do with his wealth?",
        image: 7,
        options: [
            { label: "Seize assets", effects: { gold: 50 } },
            { label: "Bury him", effects: { authority: 5, glory: 100 } },
        ],
    },
    {
        description: "One of our trading vessels has sunk to the bottom of the ocean! We may not recover from this.",
        image: 8,
        options: [
            { label: "Terrible!", effects: { gold: -100 } },
        ],
    },
    {
        description: "Disaster! The Nile has flooded far more than usual and has caused great destruction!",
        image: 9,
        options: [
            { label: "Horrific!", effects: { gold: -20, soldiers: -300, slaves: -3000 } },
        ],
    },
    {
        description: "A madman has preached of the end times, and people are listening!",
        image: 2,
        options: [
            { label: "Stop him!", effects: { authority: -5, glory: -100 } },
        ],
    },
];

const SCRIPTED_EVENTS = {
    1: {
        description: "A weary traveler named Abram enters Egypt. His half-sister is desired by the Pharaoh.",
        image: 11,
        options: [
            { label: "Take Sarai", effects: { gold: -30, slaves: -1000, glory: 100 } },
        ],
    },
    2: {
        description: "A plague has befallen upon Egypt! The priests have discovered that Sarai is the wife of Abram and say that she must be given back to end the plagues!",
        image: 12,
        options: [
            { label: "Bad luck", effects: { authority: -10 } },
        ],
    },
    3: {
        description: "Dreams of evil to come have been troubling the Pharaoh. Is there no one who can interpret these dreams?",
        image: 13,
        options: [
            { label: "Bad Tidings", effects: { authority: -5 } },
        ],
    },
    4: {
        description: "Joseph, once a slave, has interpreted the dreams, which warn of a famine to come! He claims to know how to ease the nation through this famine.",
        image: 14,
        options: [
            { label: "Make him Vizier", effects: { gold: -10, authority: 10, glory: 100 } },
        ],
    },
    5: {
        description: "The famine has come, but we are prepared. Egypt prospers because of Joseph!",
        image: 15,
        options: [
            { label: "Glory!", effects: { authority: 10, glory: 200 } },
        ],
    },
    6: {
        description: "Moses has become an asset to the nation. He offers to contribute to managing the workforce or leading the army.",
        image: 16,
        options: [
            { label: "Slaves", effects: { slaves: 3000, authority: 5, glory: 100 } },
            { label: "Soldiers", effects: { soldiers: 500, authority: 5, glory: 100 } },
        ],
    },
    7: {
        description: "Moses has been found conspiring with the slaves to overthrow the Kingdom of Egypt!",
        image: 17,
        options: [
            { label: "Exile him!", effects: { authority: -10 } },
        ],
    },
    8: {
        description: "Moses has returned from exile and demands his people freed. He warns of destruction that will come to Egypt if we do not comply.",
        image: 18,
        options: [
            { label: "Never!", effects: { authority: 10 } },
        ],
    },
    9: {
        description: "Plague after plague has overtaken Egypt. We must let the Israelites go!",
        image: 19,
        options: [
            { label: "Let them go", effects: { gold: -50, soldiers: -200, slaves: -1000, authority: -50, glory: -100 } },
        ],
    },
    10: {
        description: "Moses has taken the camp of Israel through the Red Sea!",
        image: 20,
        options: [
            { label: "AFTER HIM", effects: { soldiers: -1000, glory: 100 }, isFatal: true },
            { label: "Good riddance", effects: { slaves: -10000, authority: 10, glory: 500 } },
        ],
    },
};
