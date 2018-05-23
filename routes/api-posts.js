// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = function(app) {

  // GET route for getting all saved recipes
  app.get("/api/posts", function(req, res) {
    var query = {};
    if (req.query.id) {
      query.id = req.query.id;
    }

    db.Post.findAll({
      where: query,
      include: [db.bathUser]
    }).then(function(dbPost) {
      res.json(dbPost);
    });
  });

  // Get rotue for retrieving a single post
  app.get("/api/posts/:id", function(req, res) {

    db.Recipe.findOne({
      where: {
        id: req.params.id
      },
      include: [db.bathUser]
    }).then(function(dbRecipe) {
      res.json(dbRecipe);
    });
  });

  // POST route for saving a new post
  app.post("/api/posts", function(req, res) {
    db.Post.create(req.body).then(function(dbRecipe) {
      res.json(dbRecipe);
    });
  });

  // DELETE route for deleting post
  app.delete("/api/posts/:id", function(req, res) {
    db.Post.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(dbPost) {
      res.json(dbPost);
    });
  });


};
