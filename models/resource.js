module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Resource', {
		name:  {type: DataTypes.STRING},
		group: {type: DataTypes.STRING},
	});

	Model.associate = function(models) {
        Model.belongsTo(models.User, {foreignKey: 'userId', as: 'addedby'})
    };
        
	return Model;
};