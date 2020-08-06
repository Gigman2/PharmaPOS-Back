module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Sale', {
                grossTotal:  {type: DataTypes.STRING},
                netTotal: {type: DataTypes.STRING},
                itemTotal: {type: DataTypes.STRING},
                tax: {type: DataTypes.STRING},
                discount: {type: DataTypes.STRING},
	});

	Model.associate = function(models) {
                Model.belongsTo(models.User, {foreignKey: 'userId', as: 'soldby'})
                Model.belongsTo(models.Customer, {foreignKey: 'customerId', as: 'boughtBy'})
        };
        
	return Model;
};