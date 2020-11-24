
module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('ProductSaleMirror', {
                packBought:  {type: DataTypes.STRING},
                looseBought:  {type: DataTypes.STRING},
                packPrice: {type: DataTypes.STRING},
                loosePrice: {type: DataTypes.STRING},
                total: {type: DataTypes.STRING},
	});

	Model.associate = function(models) {
                Model.belongsTo(models.Sale, {foreignKey: 'saleId', as: 'sales'}),
                Model.belongsTo(models.Product, {foreignKey: 'productId', as: 'product'})
        };
	return Model;
};