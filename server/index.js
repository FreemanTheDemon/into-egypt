require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const {SERVER_PORT} = process.env;
const {} = require('./controller.js');

app.use(express.json());
app.use(cors());

// make server requests here (use controller)

// app.post('/seed', seed);


app.listen(SERVER_PORT, () => console.log(`Listening on ${SERVER_PORT}`));