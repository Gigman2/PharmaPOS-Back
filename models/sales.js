module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Sale', {
                transactionID:  {type: DataTypes.STRING},
                grossTotal:  {type: DataTypes.STRING},
                netTotal: {type: DataTypes.STRING},
                itemTotal: {type: DataTypes.STRING},
                tax: {type: DataTypes.STRING},
                discount: {type: DataTypes.STRING},
                state: {type: DataTypes.ENUM('holding', 'processing', 'complete')}
	});

	Model.associate = function(models) {
                Model.hasMany(models.ProductSale, {foreignKey: 'saleId', as: 'products'})
                Model.belongsTo(models.User, {foreignKey: 'userId', as: 'soldby'})
                Model.belongsTo(models.Customer, {foreignKey: 'customerId', as: 'boughtBy'})
        };

        return Model;
};