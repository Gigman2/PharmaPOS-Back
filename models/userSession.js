
module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('UserSession', {
        checkin: {type: DataTypes.DATE},
        checkout: {type: DataTypes.DATE},
    });

	Model.associate = function(models) {
                Model.belongsTo(models.User, {foreignKey: 'userId', as: 'user'})
        };
    
	return Model;
};