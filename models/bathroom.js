
module.exports = function(sequelize, DataTypes) {
  var Bathroom = sequelize.define("Bathroom", {
    location: { // email address
     id: { // we will use this as primary key
      type: DataTypes.INTEGER,
      primaryKey: true
    },
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    establishment: { // their username
        type: DataTypes.STRING,
         unique: false,
        allowNull: false,
    },
    sex: { // the users password
        type: DataTypes.STRING,
        allowNull: false,
    },
    department: { // their username
        type: DataTypes.STRING,
         unique: false,
        allowNull: false,
    },
    table: { // their username
        type: DataTypes.STRING,
         unique: false,
        allowNull: false,
    }
    
  });
   Bathroom.associate = function(models) {
    // Associating the user with their saved recipes
    Bathroom.hasMany(models.Post, {
      onDelete: "cascade"
    });
  };
  return Bathroom;
};

