require('dotenv').config();
const Sequelize = require('sequelize');
const {CONNECTION_STRING} = process.env;
const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
});

module.exports = {
    deleteUser: (req, res) => {
        let {name} = req.body;
        console.log(req.body);
        sequelize.query(`
            DELETE FROM users
                WHERE users.name = '${name}';
        `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    saveUser: (req, res) => {
        let {difficulty, name, profilePic, turn, gold, soldiers, slaves, authority, glory, enemySize, hasFoughtBattle, hasReadOracle, hasBuiltPyramid, hasBuiltTemple, hasBuiltCanal} = req.body;
        sequelize.query(`
        SELECT * FROM users
            WHERE users.name = '${name}';`)
            .then(dbRes => {
                console.log(dbRes);
                console.log(name);
                if (dbRes[0].length > 0) {
                    sequelize.query(`
                    UPDATE users
                        SET difficulty = '${difficulty}', name = '${name}', profile_pic = ${profilePic} turn = ${turn}, gold = ${gold}, soldiers = ${soldiers}, slaves = ${slaves}, auth = ${authority}, glory = ${glory}, enemy_size = ${enemySize}, has_fought_battle = ${hasFoughtBattle}, has_read_oracle = ${hasReadOracle}, has_built_pyramid = ${hasBuiltPyramid}, has_built_temple = ${hasBuiltTemple}, has_built_canal = ${hasBuiltCanal}
                        WHERE users.name = '${name}';
                    `)
                    .then(dbRes1 => res.status(200).send(dbRes1[0]))
                } else {
                    sequelize.query(`
                    INSERT INTO users (difficulty, name, profile_pic, turn, gold, soldiers, slaves, auth, glory, enemy_size, has_fought_battle, has_read_oracle, has_built_pyramid, has_built_temple, has_built_canal)
                        VALUES ('${difficulty}', '${name}', ${profilePic}, ${turn}, ${gold}, ${soldiers}, ${slaves}, ${authority}, ${glory}, ${enemySize}, ${hasFoughtBattle}, ${hasReadOracle}, ${hasBuiltPyramid}, ${hasBuiltTemple}, ${hasBuiltCanal});
                    `)
                    .then(dbRes1 => res.status(200).send(dbRes1[0]))
                }
            })
            .catch(err => console.log(err))
    },

    getUser: (req, res) => {
        sequelize.query(`SELECT * FROM users;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    getScript: (req, res) => {
        let {id} = req.params;
        sequelize.query(`
        SELECT * FROM scripted_events
            WHERE scripted_events.event_id = ${id};
        `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    getRandom: (req, res) => {
        sequelize.query(`SELECT * FROM rand_events;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    seed: (req, res) => {
        // remove the drop table if exists for users at end
        sequelize.query(`
            DROP TABLE IF EXISTS rand_events;
            DROP TABLE IF EXISTS scripted_events;
            DROP TABLE IF EXISTS users;

            CREATE TABLE rand_events (
                event_id SERIAL PRIMARY KEY,
                img_id INTEGER,
                event_desc VARCHAR,
                option_1 VARCHAR,
                option_2 VARCHAR,
                gold_1 INTEGER,
                soldiers_1 INTEGER,
                slaves_1 INTEGER,
                auth_1 INTEGER,
                glory_1 INTEGER,
                gold_2 INTEGER,
                soldiers_2 INTEGER,
                slaves_2 INTEGER,
                auth_2 INTEGER,
                glory_2 INTEGER,
                death_1 BOOLEAN,
                death_2 BOOLEAN
            );

            CREATE TABLE scripted_events (
                event_id SERIAL PRIMARY KEY,
                img_id INTEGER,
                event_desc VARCHAR,
                option_1 VARCHAR,
                option_2 VARCHAR,
                gold_1 INTEGER,
                soldiers_1 INTEGER,
                slaves_1 INTEGER,
                auth_1 INTEGER,
                glory_1 INTEGER,
                gold_2 INTEGER,
                soldiers_2 INTEGER,
                slaves_2 INTEGER,
                auth_2 INTEGER,
                glory_2 INTEGER,
                death_1 BOOLEAN,
                death_2 BOOLEAN
            );

            CREATE TABLE users (
                user_id SERIAL PRIMARY KEY,
                difficulty VARCHAR,
                name VARCHAR,
                profile_pic INTEGER,
                turn INTEGER,
                gold INTEGER,
                soldiers INTEGER,
                slaves INTEGER,
                auth INTEGER,
                glory INTEGER,
                enemy_size INTEGER,
                has_fought_battle BOOLEAN,
                has_read_oracle BOOLEAN,
                has_built_pyramid BOOLEAN,
                has_built_temple BOOLEAN,
                has_built_canal BOOLEAN
            );

            INSERT INTO rand_events (event_desc, img_id, option_1, option_2, gold_1, soldiers_1, slaves_1, auth_1, glory_1, gold_2, soldiers_2, slaves_2, auth_2, glory_2, death_1, death_2)
            VALUES
            ('Our merchants bring great wealth to Khmet!', 1, 'GOLD!', '', 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, false, false),
            ('Our priests have made word known of the great times to come!', 2, 'Glorious!', '', 0, 0, 0, 5, 100, 0, 0, 0, 0, 0, false, false),
            ('The Nile gives us a great harvest! Our population rises!', 3, 'Wonderful!', '', 20, 300, 3000, 0, 0, 0, 0, 0, 0, 0, false, false),
            ('A slave merchant offers to sell you 5000 slaves for 50 gold!', 4, 'Buy', 'Decline', -50, 0, 5000, 0, 0, 0, 0, 0, 0, 0, false, false),
            ('The priests say that it is about time for a sacrifice. It would cost the nation 50 gold.', 5, 'Sacrifice', 'Not now', -50, 0, 0, 10, 100, 0, 0, 0, 0, 0, false, false),
            ('A band of 500 mercenaries offer their services in exchange for a large one-time payment of 50 gold.', 6, 'Hire them', 'Decline', -50, 500, 0, 0, 0, 0, 0, 0, 0, 0, false, false),
            ('A distant wealthy family member has died without a will! What shall we do with his wealth?', 7, 'Sieze assets', 'Burry him', 50, 0, 0, 0, 0, 0, 0, 0, 5, 100, false, false),
            ('One of our trading vessels has sunk to the bottom of the ocean! We may not recover from this.', 8, 'Terrible!', '', -100, 0, 0, 0, 0, 0, 0, 0, 0, 0, false, false),
            ('Disaster! The Nile has flooded far more than usual and has caused great destruction!', 9, 'Horrific!', '', -20, -300, -3000, 0, 0, 0, 0, 0, 0, 0, false, false),
            ('A madman has preached of the end times, and people are listening!', 2, 'Stop him!', '', 0, 0, 0, -5, -100, 0, 0, 0, 0, 0, false, false);

            INSERT INTO scripted_events (event_desc, img_id, option_1, option_2, gold_1, soldiers_1, slaves_1, auth_1, glory_1, gold_2, soldiers_2, slaves_2, auth_2, glory_2, death_1, death_2)
            VALUES
            ('A weary traveler named Abram enters Egypt. His half-sister is desired by the Pharaoh.', 11, 'Take Sarai', '', -30, 0, -1000, 0, 100, 0, 0, 0, 0, 0, false, false),
            ('A plague has befallen upon Egypt! The priests have discovered that Sarai is the wife of Abram and say that she must be given back to end the plagues!', 12, 'Bad luck', '', 0, 0, 0, -10, 0, 0, 0, 0, 0, 0, false, false),
            ('Dreams of evil to come have been troubling the Pharaoh. Is there no one who can interpret these dreams?', 13, 'Bad Tidings', '', 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, false, false),
            ('Joseph, once a slave, has interpreted the dreams, which warn of a famine to come! He claims to know how to ease the nation through this famine.', 14, 'Make him Viser', '', -10, 0, 0, 10, 100, 0, 0, 0, 0, 0, false, false),
            ('The famine has come, but we are prepared. Egypt prospers because of Joseph!', 15, 'Glory!', '', 0, 0, 0, 10, 200, 0, 0, 0, 0, 0, false, false),
            ('Moses has become an asset to the nation. He offers to contribute to managing the workforce or leading the army.', 16, 'Slaves', 'Soldiers', 0, 0, 3000, 5, 100, 0, 500, 0, 5, 100, false, false),
            ('Moses has been found conspiring with the slaves to overthrow the Kingdom of Egypt!', 17, 'Exile him!', '', 0, 0, 0, -10, 0, 0, 0, 0, 0, 0, false, false),
            ('Moses has returned from exile and demands his people freed. He warns of destruction that will come to Egypt if we do not comply.', 18, 'Never!', '', 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, false, false),
            ('Plague after plague has overtaken Egypt. We must let the Israelites go!', 19, 'Let them go', '', -50, -200, -1000, -50, -100, 0, 0, 0, 0, 0, false, false),
            ('Moses has taken the camp of Israel through the Red Sea!', 20, 'AFTER HIM', 'Good riddance', 0, -1000, 0, 0, 100, 0, 0, -10000, 10, 500, true, false);

            INSERT INTO users (difficulty, name, profile_pic, turn, gold, soldiers, slaves, auth, glory, enemy_size, has_fought_battle, has_read_oracle, has_built_pyramid, has_built_temple, has_built_canal)
            VALUES
            ('easy', 'test-user', 1, 1, 1000, 1000, 1000, 100, 1000, 1000, false, false, false, false, false);
        `).then(() => {
            console.log('DB seeded!')
            res.sendStatus(200)
        }).catch(err => console.log('error seeding DB', err))
    }
}


/*
 INSERT INTO rand_events (event_desc, img_id, option_1, option_2, gold_1, soldiers_1, slaves_1, auth_1, glory_1, gold_2, soldiers_2, slaves_2, auth_2, glory_2)
            VALUES
            ('A sorcerer offers his services!', 1, 'Welcome Him', 'Kill Him', -20, 0, 0, -5, 100, 0, 0, 0, 5, 0);

            gold: number, generally always have some in the hundreds
            soldiers: increment/decrement by 100
            slaves: increment/decrement by 1000
            authority: max is 100, anything less than 0 is game over
            glory: points - more points mean a better ending

*/

    // easy scripted turns: 12, 14
        // 12 Abram enters Egypt 1
        // 14 Plagues happen and Abram leaves 2
    // medium scripted turns: 12, 14, 16
        // 12 Strange visions 3
        // 14 Appoint Joseph as Viser 4
        // 16 Famine 5
    // hard scripted turns: 12, 14, 16, 18, 20
        // 12 Moses, an asset to the Kingdom 6
        // 14 Moses, exiled! 7
        // 16 Moses returns 8
        // 18 Ten Plagues upon Egypt 9
        // 20 Revenge? 10

    // Positive events (3)
        // Successful Trade - money increases 1
        // Glorious omen - authority increases 2
        // Great Harvest - slave and soldiers increase 3
    // Neutral events (4)
        // Slave market - pay money for slaves 4
        // Sacrifice to the gods? - gold for authority vs authority for gold 5
        // Mercenaries offer service - gold for soldiers or no change 6
        // Distant family member dies - confiscate assets or auth 7
    // Negative events (3)
        // Disasterous trade - lose gold 8
        // Nile floods - lose slaves and soldiers 9
        // Bad omen - lose authority 10

        
