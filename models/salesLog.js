module.exports = (sequelize, DataTypes) => {
    const Model = sequelize.define('SalesLog',
        {
            action:  {type: DataTypes.STRING},
            beforeID:  {type: DataTypes.STRING},
            afterID: {type: DataTypes.STRING},
        }
    );

	Model.associate = function(models) {
        Model.belongsTo(models.User, {foreignKey: 'userId', as: 'actionBy'})
    };
    return Model;
};