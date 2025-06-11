require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const {SERVER_PORT} = process.env;
const {seed, getRandom, getScript, getUser, saveUser, deleteUser} = require('./controller.js');

app.use(express.json());
app.use(cors());

// seed
app.post('/seed', seed);

// get requests for events
app.get('/randevent', getRandom);
app.get('/scriptevent/:id', getScript);

// make requests for users
app.post('/user', saveUser);
app.get('/user', getUser);
app.delete('/user', deleteUser);

app.listen(SERVER_PORT, () => console.log(`Listening on ${SERVER_PORT}`));


// axios request comes in from react ->
    // send the request to the server (app.post(url, function to trigger))
        // function itself
            // query INSERT INTO [table name] ([columns to add to]) VALUES ([values that correspond to the columns])