
module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('ProductSale', {
                quantity:  {type: DataTypes.STRING},
                unit: {type: DataTypes.STRING},
                total: {type: DataTypes.STRING},
	});

	Model.associate = function(models) {
                Model.belongsTo(models.Sale, {foreignKey: 'saleId', as: 'sales'}),
                Model.belongsTo(models.Product, {foreignKey: 'productId', as: 'product'})
        };
	return Model;
};