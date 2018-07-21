require('dotenv').config();
const http = require('http');
const express = require('express');
const path = require('path');

const app = require('./routes/index');

app.server = http.createServer(app);

app.server.listen(process.env.PORT, () => {
	console.log(`Started on port ${app.server.address().port}`);
});
