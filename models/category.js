module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Category', {
        name:  {type: DataTypes.STRING},
	});

	Model.associate = function(models) {
        Model.belongsTo(models.User, {foreignKey: 'userId', as: 'addedby'}),
        Model.hasMany(models.Product, {foreignKey: 'categoryId', as: 'products'})
    };
        
	return Model;
};