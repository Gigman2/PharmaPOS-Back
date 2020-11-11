module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Role', {
		name:  {type: DataTypes.STRING},
		deletable:  {type: DataTypes.BOOLEAN,  defaultValue: false},
	});

	Model.associate = function(models) {
		// Model.belongsTo(models.User, {foreignKey: 'userId', as: 'addedby'})
		Model.hasMany(models.User, {foreignKey: 'roleId', as: 'accounts'})
    };
        
	return Model;
};