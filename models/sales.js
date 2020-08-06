module.exports = (sequelize, DataTypes) => {
        const Model = sequelize.define('Sale', {
                transactionID: { type: DataTypes.STRING },
                product: { type: DataTypes.STRING },
                netPrice: { type: DataTypes.FLOAT },
                itemNoTotal: { type: DataTypes.INTEGER },
                customer: { type: DataTypes.STRING },
                action:  {type: DataTypes.STRING},
                tax: { type: DataTypes.FLOAT },
                discount: { type: DataTypes.FLOAT },
        });

        Model.associate = function (models) {
                Model.belongsTo(models.User, { foreignKey: 'userId', as: 'soldby' })
        };

        return Model;
};