module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Customer', {
        firstname:  {type: DataTypes.STRING},
        lastname: {type: DataTypes.STRING},
        email: {type: DataTypes.STRING},
        phone: {type: DataTypes.STRING},
        lastPurchase: {type: DataTypes.DATE},
	});

	Model.associate = function(models) {
                Model.hasMany(models.Sale, {foreignKey: 'customerId', as: 'purchases'})
        };
        
	return Model;
};