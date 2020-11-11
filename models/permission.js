module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Permission', {
        state:  {type: DataTypes.STRING},
	}); 

	Model.associate = function(models) { 
        Model.belongsTo(models.User, {foreignKey: 'userId', as: 'user'})
        Model.belongsTo(models.Role, {foreignKey: 'roleId', as: 'role'})
        Model.belongsTo(models.Resource, {foreignKey: 'resourceId', as: 'resources'})
    };
        
	return Model;
};