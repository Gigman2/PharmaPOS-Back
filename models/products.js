
module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Product', {
                id: {allowNull: false, primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
                name:  {type: DataTypes.STRING},
                barcode: {type: DataTypes.STRING},
                sku: {type: DataTypes.STRING, allowNull: true},
                shelf: {type: DataTypes.STRING},
                price: {type: DataTypes.STRING},
                cprice: {type: DataTypes.STRING},
                wprice: {type: DataTypes.STRING},
                quantity: {type: DataTypes.INTEGER}, 
                pack_q: {type: DataTypes.INTEGER},
                pack_l: {type: DataTypes.INTEGER},
                generics: {type: DataTypes.STRING},
                timesSold:{type: DataTypes.INTEGER},
                restock: {type: DataTypes.INTEGER},
                left: {type: DataTypes.INTEGER},
                active:{type: DataTypes.BOOLEAN},
                variant: {type: DataTypes.STRING},
                image: {type: DataTypes.STRING},
                manufacturer: {type: DataTypes.STRING},
                expiry: {type: DataTypes.DATE},
                dispensation: {type: DataTypes.STRING, defaultValue: 'single'}
        });

	Model.associate = function(models) {
                Model.belongsTo(models.Category, {foreignKey: 'categoryId', as: 'category'})
                Model.belongsTo(models.Supplier, {foreignKey: 'supplierId', as: 'supplier'})
                Model.belongsTo(models.User, {foreignKey: 'userId', as: 'added'})
        };
    
	return Model;
};