'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const APP_SECRET = process.env.SECRET || 'secretstring';

const userSchema = (sequelize, DataTypes) => {
  let model = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'editor', 'writer'),
      allowNull: false,
      defaultValue: 'user',
    },
    token: {
      type: DataTypes.VIRTUAL,
      get() { // this is sequelizes syntax of defining a getter.
        return jwt.sign({ username: this.username }, APP_SECRET);
      },
    },
  });

  // user.token -> the getters ouput
  // user.token = 'jacob'

  model.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });

  // is you use a fat arrow function, this does not get bound.
  model.authenticateBasic = async function(username, password) {
    try {
      let user = await this.findOne({where: { username }});
      let validPassword = await bcrypt.compare(password, user.password);

      if (validPassword) {
        return user;
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (e) {
      console.log(e);
      throw new Error('Error validating user');
    }
  };

  model.authenticateBearer = async function(token) {
    try {
      let validToken = jwt.verify(token, APP_SECRET);
      let user = this.findOne({where: { username: validToken.username }});

      if (user) {
        return user;
      } else {
        throw new Error('Invalid token');
      }
    } catch (e) {
      console.log(e);
      throw new Error('Invalid credentials');
    }
  };

  return model;
};

module.exports = userSchema;