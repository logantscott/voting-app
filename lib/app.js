const express = require('express');
const app = express();
// const ensureAuth = require('./middleware/ensureAuth');

app.use(require('cookie-parser')());
app.use(require('cors')({
  origin: true,
  credentials: true
}));
app.use(express.json());

//
// app.use('/api/v1/memberships', ensureAuth);

app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/organizations', require('./routes/organizations'));
app.use('/api/v1/polls', require('./routes/polls'));
app.use('/api/v1/votes', require('./routes/votes'));
app.use('/api/v1/memberships', require('./routes/memberships'));

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
