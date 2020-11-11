
module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Product', {
                id: {allowNull: false, primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
                name:  {type: DataTypes.STRING},
                barcode: {type: DataTypes.STRING},
                sku: {type: DataTypes.STRING, allowNull: true},
                shelf: {type: DataTypes.STRING},
                price: {type: DataTypes.STRING},
                quantity: {type: DataTypes.INTEGER}, 
                generics: {type: DataTypes.STRING},
                timesSold:{type: DataTypes.INTEGER},
                restock: {type: DataTypes.INTEGER},
                left: {type: DataTypes.INTEGER},
                active:{type: DataTypes.BOOLEAN},
                variant: {type: DataTypes.STRING},
                image: {type: DataTypes.STRING},
                manufacturer: {type: DataTypes.STRING},
                expiry: {type: DataTypes.DATE},
                batch: {type: DataTypes.DATE},
                hasloose: {type: DataTypes.BOOLEAN, defaultValue: false},
                lprice: {type: DataTypes.STRING},
                lquantity: {type: DataTypes.INTEGER},
                hastabs: {type: DataTypes.BOOLEAN, defaultValue: false},
                tprice: {type: DataTypes.STRING},
                tquantity: {type: DataTypes.INTEGER},
        });

	Model.associate = function(models) {
                Model.belongsTo(models.Category, {foreignKey: 'categoryId', as: 'category'})
                Model.belongsTo(models.Supplier, {foreignKey: 'supplierId', as: 'supplier'})
                Model.belongsTo(models.User, {foreignKey: 'userId', as: 'added'})
        };
    
	return Model;
};