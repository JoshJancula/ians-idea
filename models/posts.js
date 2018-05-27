module.exports = function(sequelize, DataTypes) {
  var Post = sequelize.define("Post", {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      len: [1]
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: true,
      len: [1]
    },
    airQuality: {
      type: DataTypes.TEXT,
      allowNull: true,
      len: [1]
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      isUrl: true
    },
  });

  Post.associate = function(models) {
   
    Post.belongsTo(models.bathUser, {
      foreignKey: {
        allowNull: false
      }
    });
    Post.belongsTo(models.Bathroom, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Post;
};
