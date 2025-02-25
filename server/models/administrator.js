const { tm_connection_db } = require('../database');
const { DataTypes } = require('sequelize');

const Administrator = tm_connection_db.define('administrator', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    field: 'id'
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'username'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'email'
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'role'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password',
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'profile_image'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, { freezeTableName: true });

module.exports = Administrator;