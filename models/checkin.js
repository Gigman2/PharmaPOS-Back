
module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Checkin', {
        checkin: {type: DataTypes.STRING},
        checkout: {type: DataTypes.STRING},
    });

	Model.associate = function(models) {
                Model.belongsTo(models.User, {foreignKey: 'userId', as: 'user'})
        };
    
	return Model;
};