'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Sequelize, DataTypes } = require('sequelize');
const userSchema = require('./model/userSchema.js');
const bearerAuth = require('./middleware/bearer-auth.js');
const acl = require('./middleware/access-control.js');

const app = express();

const sequelize = new Sequelize('sqlite:memory');
const UserModel = userSchema(sequelize, DataTypes);

// app level middleware
app.use(express.json());
app.use(morgan('tiny')); // this is a third party logger
app.use(cors());

app.post('/signup', async (req, res) => {

  let { username, password } = req.body;
  console.log(username, password);

  let user = await UserModel.create({username, password});

  res.status(201).send({
    user: {id: user.id, username: user.username},
    token: user.token,
  });
});

app.get('/posts', bearerAuth(UserModel), acl('read'), (req, res) => {
  console.log('You made it!');
  res.status(200).send('Incoming Posts');
});

app.post('/posts', bearerAuth(UserModel), acl('create'), (req, res) => {
  console.log('You made it!');
  res.status(200).send('Post Created');
});

sequelize.sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('App is running on port 3000');
    });
  });