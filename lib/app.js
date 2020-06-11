const express = require('express');
const app = express();

app.use(express.json());

app.use('/api/v1/user', require('./routes/user'));
app.use('/api/v1/organization', require('./routes/organization'));


app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
