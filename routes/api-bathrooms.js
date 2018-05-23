// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = function(app) {

  // GET route for getting all bathroom locations
  app.get("/api/bathrooms", function(req, res) {
    var query = {};
    if (req.query.id) {
      query.id = req.query.id;
    }

    db.Bathroom.findAll({
      where: query,
      include: [db.Post]
    }).then(function(dbBath) {
      res.json(dbBath);
    });
  });

  // Get rotue for retrieving a single bathroom
  app.get("/api/bathrooms/:id", function(req, res) {

    db.Bathroom.findOne({
      where: {
        id: req.params.id
      },
      include: [db.Post]
    }).then(function(dbBath) {
      res.json(dbBath);
    });
  });

  // POST route for saving a new bathroom
  app.post("/api/bathrooms", function(req, res) {
    db.Bathroom.create(req.body).then(function(dbBath) {
      res.json(dbBath);
    });
  });

  // DELETE route for deleting a bathroom location
  app.delete("/api/bathrooms/:id", function(req, res) {
    db.Bathroom.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(dbBath) {
      res.json(dbBath);
    });
  });


};
