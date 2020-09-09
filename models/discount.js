module.exports = (sequelize, DataTypes) => {
    const Model = sequelize.define('Discount', {
        code: { type: DataTypes.STRING },
        timesUsed: { type: DataTypes.INTEGER },
        useLimit: { type: DataTypes.INTEGER },
        discount: { type: DataTypes.DOUBLE },
        expires: { type: DataTypes.DATE},
        description: { type: DataTypes.TEXT },
        customerOnly: { type: DataTypes.BOOLEAN, defaultValue: false},
        perCustomerUse: {type: DataTypes.INTEGER}
 
    });


 
    return Model;
};