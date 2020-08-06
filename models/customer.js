module.exports = (sequelize, DataTypes) => {
    const Model = sequelize.define('Customer', {
        name: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING },
        phone: { type: DataTypes.STRING },
        lastPurchase: { type: DataTypes.STRING },
        customerID: {
            type: DataTypes.UUID,
            primaryKey: true
        },
    });

    return Model;
}