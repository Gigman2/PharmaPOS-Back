
module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Stock', {
        productName:  {type: DataTypes.STRING},
        initialStock: {type: DataTypes.INTEGER},
        currentStock: {type: DataTypes.INTEGER},
    });

	Model.associate = function(models) {
        Model.belongsTo(models.Product, {foreignKey: 'productId', as: 'stock'})
        Model.belongsTo(models.Supplier, {foreignKey: 'supplierId', as: 'supplier'})
        Model.belongsTo(models.User, {foreignKey: 'userId', as: 'signed'})
    };
    
	return Model;
};