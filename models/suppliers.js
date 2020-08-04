module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Supplier', {
        name:  {type: DataTypes.STRING},
        email: {type: DataTypes.STRING},
        phone: {type: DataTypes.STRING},
	});

	Model.associate = function(models) {
        Model.hasMany(models.Product, {foreignKey: 'supplierId', as: 'products'})
    };
        
	return Model;
};