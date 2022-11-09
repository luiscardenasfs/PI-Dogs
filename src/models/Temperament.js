const { DataTypes } = require('sequelize');
// Export a functiond that defines de model and then we connect it with sequelize.

module.exports = (sequelize) => {
  // define the model
  sequelize.define('temperament', {

    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      }
  });
};
