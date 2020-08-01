
module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Product', {
        id: {allowNull: false, primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        name:  {type: DataTypes.STRING},
        category: {type: DataTypes.STRING},
        brand: {type: DataTypes.STRING},
        generics: {type: DataTypes.STRING},
        dosageForm: {type: DataTypes.STRING},
        typeOfProduct: {type: DataTypes.STRING},
        quantity: {type: DataTypes.INTEGER},
        numTimesSold:{type: DataTypes.BOOLEAN},
        saleThreshold: {type: DataTypes.INTEGER},
        active:{type: DataTypes.BOOLEAN}
	});

	Model.associate = function(models) {
        
    };
    
	return Model;
};