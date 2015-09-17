/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('wp_25_postmeta', { 
    meta_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    post_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    meta_key: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meta_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
    {
      timestamps: false
  });
};
