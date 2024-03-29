module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Sale', {
                transactionID:  {type: DataTypes.STRING},
                grossTotal:  {type: DataTypes.STRING},
                netTotal: {type: DataTypes.STRING},
                itemTotal: {type: DataTypes.STRING}, 
                tax: {type: DataTypes.STRING},
                discount: {type: DataTypes.STRING},
                cashAmount: {type: DataTypes.STRING},  
                momoAmount: {type: DataTypes.STRING},
                changeGiven: {type: DataTypes.STRING},
                state: {type: DataTypes.ENUM('holding', 'processing', 'complete', 'refunded', 'returned')},
                stockWorth: {type: DataTypes.STRING},
	});

	Model.associate = function(models) {
                Model.hasMany(models.ProductSale, {foreignKey: 'saleId', as: 'products'})
                Model.belongsTo(models.User, {foreignKey: 'userId', as: 'soldby'})
                Model.belongsTo(models.Customer, {foreignKey: 'customerId', as: 'boughtBy'})
                Model.belongsTo(models.Discount, {foreignKey: 'discountId', as: 'enjoyed'})
        };

        return Model;
};