module.exports = (sequelize, DataTypes) => {
    const Model = sequelize.define('Discount', {
        discountID: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        code: { type: DataTypes.STRING },
        timesUsed: { type: DataTypes.INTEGER },
        useLimit: { type: DataTypes.INTEGER },
        discount: { type: DataTypes.DOUBLE },

    });



    return Model;
};