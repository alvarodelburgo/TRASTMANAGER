const { tm_connection_db } = require('../database');
const { DataTypes } = require('sequelize');

const Offer = tm_connection_db.define('offer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    field: 'id'
  },
  administrator_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'administrator_id'
  },
  enterprise_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'enterprise_id'
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'owner_id'
  },
  premises_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'premises_id'
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'warehouse_id'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'title'
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'address'
  },
  size: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'size'
  },
  rental_price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    field: 'rental_price'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'description'
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    field: 'images'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'email'
  },
  phone_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'phone_number'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'status'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }, 
}, { freezeTableName: true });

module.exports = Offer;