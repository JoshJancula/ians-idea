
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
    establishment: { 
        type: DataTypes.STRING,
         unique: false,
        allowNull: false,
    },
    sex: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dividers: { // their username
        type: DataTypes.STRING,
         unique: false,
        allowNull: true,
    },
    floor: { 
        type: DataTypes.STRING,
         unique: false,
        allowNull: false,
    },
    charge: { 
        type: DataTypes.STRING,
         unique: false,
        allowNull: false,
    },
    department: { 
        type: DataTypes.STRING,
         unique: false,
        allowNull: false,
    },
    seatCover: { 
        type: DataTypes.STRING,
         unique: false,
        allowNull: false,
    },
    tamponBox: { 
        type: DataTypes.STRING,
         unique: false,
        allowNull: false,
    },
    table: { 
        type: DataTypes.STRING,
         unique: false,
        allowNull: false,
    },
    createdBy: { 
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

