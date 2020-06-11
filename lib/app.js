const express = require('express');
const app = express();

app.use(express.json());

app.use('/api/v1/users', require('./routes/user'));
app.use('/api/v1/organizations', require('./routes/organization'));
app.use('/api/v1/polls', require('./routes/poll'));

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
