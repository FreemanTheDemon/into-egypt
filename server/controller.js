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
    seed: (req, res) => {
        // remove the drop table if exists for users at end
        sequelize.query(`
            DROP TABLE IF EXISTS rand_events;
            DROP TABLE IF EXISTS easy_events;
            DROP TABLE IF EXISTS medium_events;
            DROP TABLE IF EXISTS hard_events;
            DROP TABLE IF EXISTS users;

            CREATE TABLE rand_events (
                event_id SERIAL PRIMARY KEY,
                title VARCHAR,
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
                glory_2 INTEGER
            );

            CREATE TABLE scripted_events (
                event_id SERIAL PRIMARY KEY,
                title VARCHAR,
                img_id INTEGER,
                turn INTEGER,
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
                glory_2 INTEGER
            );

            CREATE TABLE users (
                user_id SERIAL PRIMARY KEY,
                difficulty VARCHAR,
                name VARCHAR,
                turn INTEGER,
                gold INTEGER,
                soldiers, INTEGER,
                slaves INTEGER,
                auth INTEGER,
                glory INTEGER,
                hasFoughtBattle BOOLEAN,
                hasReadOracle BOOLEAN
            );

            INSERT INTO rand_events (title, event_desc, img_id, option_1, option_2, gold_1, soldiers_1, slaves_1, auth_1, glory_1, gold_2, soldiers_2, slaves_2, auth_2, glory_2)
            VALUES
            ('example desc Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea nam quas dicta minima a voluptatem doloremque cum earum nisi dignissimos.',
            1, 'first opt', 'second opt', -3, 12, 3, -30, 0, -300, 12, 300, -50, 1000);

            INSERT INTO scripted_events (title, event_desc, img_id, turn, title, option_1, option_2, gold_1, soldiers_1, slaves_1, auth_1, glory_1, gold_2, soldiers_2, slaves_2, auth_2, glory_2)
            VALUES
            ('example desc Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea nam quas dicta minima a voluptatem doloremque cum earum nisi dignissimos.',
            1, 'first opt', 'second opt', -3, 12, 3, -30, 0, -300, 12, 300, -50, 1000);

            INSERT INTO users (difficulty, name, turn, gold, soldiers, slaves, auth, glory)
            VALUES
            (easy, 'test-user', 1, 1000, 1000, 1000, 1000, 100, 1000);
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