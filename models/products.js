
module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Product', {
                id: {allowNull: false, primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
                name:  {type: DataTypes.STRING},
                barcode: {type: DataTypes.STRING},
                sku: {type: DataTypes.STRING},
                shelf: {type: DataTypes.STRING},
                price: {type: DataTypes.STRING},
                quantity: {type: DataTypes.INTEGER},
                numTimesSold:{type: DataTypes.BOOLEAN},
                saleThreshold: {type: DataTypes.INTEGER},
                active:{type: DataTypes.BOOLEAN},
                image: {type: DataTypes.STRING},
                manufacturer: {type: DataTypes.STRING}
        });

	Model.associate = function(models) {
                Model.belongsTo(models.Category, {foreignKey: 'categoryId', as: 'category'})
                Model.belongsTo(models.Supplier, {foreignKey: 'supplierId', as: 'supplier'})
                Model.belongsTo(models.User, {foreignKey: 'userId', as: 'added'})
        };
    
	return Model;
};