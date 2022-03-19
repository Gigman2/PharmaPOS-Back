
module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('ProductSale', {
                quantity:  {type: DataTypes.INTEGER},
                retail:  {type: DataTypes.INTEGER},
                price: {type: DataTypes.STRING},
                wprice: {type: DataTypes.STRING},
                dispensation: {type: DataTypes.STRING},
                total: {type: DataTypes.STRING},
	});

	Model.associate = function(models) {
                Model.belongsTo(models.Sale, {foreignKey: 'saleId', as: 'sales'}),
                Model.belongsTo(models.Product, {foreignKey: 'productId', as: 'product'})
        };
	return Model;
};