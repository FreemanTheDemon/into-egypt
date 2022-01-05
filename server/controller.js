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
        sequelize.query(`
            DELETE FROM users
                WHERE users.name = '${name}';
        `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    saveUser: (req, res) => {
        let {difficulty, name, turn, gold, soldiers, slaves, authority, glory, hasFoughtBattle, hasReadOracle, hasBuiltPyramid, hasBuiltTemple, hasBuiltCanal} = req.body;
        sequelize.query(`
        SELECT * FROM users
            WHERE users.name = '${name}';`)
            .then(dbRes => {
                console.log(dbRes);
                console.log(name);
                if (dbRes[0].length > 0) {
                    sequelize.query(`
                    UPDATE users
                        SET difficulty = '${difficulty}', name = '${name}', turn = ${turn}, gold = ${gold}, soldiers = ${soldiers}, slaves = ${slaves}, auth = ${authority}, glory = ${glory}, hasFoughtBattle = ${hasFoughtBattle}, hasReadOracle = ${hasReadOracle}, hasBuiltPyramid = ${hasBuiltPyramid}, hasBuiltTemple = ${hasBuiltTemple}, hasBuiltCanal = ${hasBuiltCanal}
                        WHERE users.name = '${name}';
                    `)
                    .then(dbRes1 => res.status(200).send(dbRes1[0]))
                } else {
                    sequelize.query(`
                    INSERT INTO users (difficulty, name, turn, gold, soldiers, slaves, auth, glory, hasFoughtBattle, hasReadOracle, hasBuiltPyramid, hasBuiltTemple, hasBuiltCanal)
                        VALUES ('${difficulty}', '${name}', ${turn}, ${gold}, ${soldiers}, ${slaves}, ${authority}, ${glory}, ${hasFoughtBattle}, ${hasReadOracle}, ${hasBuiltPyramid}, ${hasBuiltTemple}, ${hasBuiltCanal});
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
                turn INTEGER,
                gold INTEGER,
                soldiers INTEGER,
                slaves INTEGER,
                auth INTEGER,
                glory INTEGER,
                hasFoughtBattle BOOLEAN,
                hasReadOracle BOOLEAN,
                hasBuiltPyramid BOOLEAN,
                hasBuiltTemple BOOLEAN,
                hasBuiltCanal BOOLEAN
            );

            INSERT INTO rand_events (event_desc, img_id, option_1, option_2, gold_1, soldiers_1, slaves_1, auth_1, glory_1, gold_2, soldiers_2, slaves_2, auth_2, glory_2, death_1, death_2)
            VALUES
            ('example desc Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea nam quas dicta minima a voluptatem doloremque cum earum nisi dignissimos.',
            1, 'first opt', 'second opt', -3, 12, 3, -30, 0, -300, 12, 300, -50, 1000, false, true);

            INSERT INTO scripted_events (event_desc, img_id, option_1, option_2, gold_1, soldiers_1, slaves_1, auth_1, glory_1, gold_2, soldiers_2, slaves_2, auth_2, glory_2, death_1, death_2)
            VALUES
            ('example desc Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea nam quas dicta minima a voluptatem doloremque cum earum nisi dignissimos.',
            1, 'first opt', 'second opt', -3, 12, 3, -30, 0, -300, 12, 300, -50, 1000, false, false);

            INSERT INTO users (difficulty, name, turn, gold, soldiers, slaves, auth, glory, hasFoughtBattle, hasReadOracle, hasBuiltPyramid, hasBuiltTemple, hasBuiltCanal)
            VALUES
            ('easy', 'test-user', 1, 1000, 1000, 1000, 100, 1000, false, false, false, false, false);
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


/*
SELECT user_id, '${difficulty}', '${name}', ${turn}, ${gold}, ${soldiers}, ${slaves}, ${authority}, ${glory}, ${hasFoughtBattle}, ${hasReadOracle}, ${hasBuiltPyramid}, ${hasBuiltTemple}, ${hasBuiltCanal}
            FROM users 
            WHERE users.name = '${name}'

`
        
        `
*/