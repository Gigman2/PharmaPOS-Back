module.exports = (sequelize, DataTypes) => {
	const Model = sequelize.define('Business', {
        name:  {type: DataTypes.STRING},
        address:  {type: DataTypes.STRING},
        email:  {type: DataTypes.STRING},
        phone:  {type: DataTypes.STRING},
        manager:  {type: DataTypes.STRING},
        logo:  {type: DataTypes.STRING},
	});

	Model.associate = function(models) {

    };
        
	return Model;
};