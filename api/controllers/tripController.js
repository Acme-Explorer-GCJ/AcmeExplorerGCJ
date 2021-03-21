'use strict';

/*---------------TRIP----------------------*/
var mongoose = require('mongoose'),
  Trip = mongoose.model('Trips');

exports.list_all_trips = function(req, res) {
  Trip.find(function(err, trips) {
    if (err){
      console.log(Date() + " - " + err);
      res.status(500).send(err);
    }
    else{
      res.json(trips);
    }
  });
};


exports.create_a_trip = function(req, res) {
  var new_trip = new Trip(req.body);
  new_trip.save(function(err, trip) {
    if (err){
      console.log(Date() + " - " + err);
      if(err.name=='ValidationError') {
          res.status(422).send(err);
      }
      else{
        res.status(500).send(err);
      }
    }
    else{
      res.json(trip);
    }
  });
};

exports.search_trip = function(req, res) {
  //Check if title param exists (title: req.query.title)
  //Search depending on params but only if deleted = false
  console.log('Searching a trip depending on params');
  var title = req.query.title;
  if (!title) {
    logger.warn("New trip GET request without title, sending 400...");
    res.sendStatus(400); // bad request
  } else {
    Trip.find({ title:req.query.title }, function (err, trips) {
      if (err){
        res.send(err);
      }
      else{
        res.json(trips);
      }
    });
  };
};


exports.read_a_trip = function(req, res) {
    Trip.findById(req.params.tripId, function(err, trip) {
      if (err){
        res.status(500).send(err);
      }
      else{
        res.json(trip);
      }
    });
};


exports.update_a_trip = function(req, res) {
    Trip.findOneAndUpdate({_id: req.params.tripId}, req.body, {new: true}, function(err, trip) {
      if (err){
        if(err.name=='ValidationError') {
            res.status(422).send(err);
        }
        else{
          res.status(500).send(err);
        }
      }
      else{
        res.json(trip);
      }
    });
};

exports.delete_a_trip = function(req, res) {
    Trip.remove({_id: req.params.tripId}, function(err, trip) {
        if (err){
          res.status(500).send(err);
        }
        else{
            res.json({ message: 'Trip successfully deleted' });
        }
    });
};


/*---------------STAGES----------------------*/
var mongoose = require('mongoose'),
  Stage = mongoose.model('Stages');

exports.list_all_stages = function(req, res) {
  Stage.find({}, function(err, stages) {
    if (err){
      res.status(500).send(err);
    }
    else{
      res.json(stages);
    }
  });
};

exports.create_a_stage = function(req, res) {
  var new_stage = new Stage(req.body);
  new_stage.save(function(err, stage) {
    if (err){
      if(err.name=='ValidationError') {
          res.status(422).send(err);
      }
      else{
        res.status(500).send(err);
      }
    }
    else{
      res.json(stage);
    }
  });
};

exports.search_stage = function(req, res) {
  //Check if title param exists (title: req.query.title)
  //Search depending on params but only if deleted = false
  console.log('Searching a stage depending on params');
  var title = req.query.title;
  if (!title) {
    logger.warn("New stage GET request without title, sending 400...");
    res.sendStatus(400); // bad request
  } else {
    Stage.find({ title:req.query.title }, function (err, stages) {
      if (err){
        res.send(err);
      }
      else{
        res.json(stages);
      }
    });
  };
};

exports.read_a_stage = function(req, res) {
  Stage.findById(req.params.stageId, function(err, stage) {
    if (err){
      res.send(err);
    }
    else{
      res.json(stage);
    }
  });
};

exports.update_a_stage = function(req, res) {
  Stage.findOneAndUpdate({_id: req.params.stageId}, req.body, {new: true}, function(err, stage) {
    if (err){
      if(err.name=='ValidationError') {
          res.status(422).send(err);
      }
      else{
        res.status(500).send(err);
      }
    }
    else{
      res.json(stage);
  }
  });
};

exports.delete_a_stage = function(req, res) {
  Stage.remove({_id: req.params.stageId}, function(err, stage) {
    if (err){
      res.status(500).send(err);
    }
    else{
      res.json({ message: 'Stage successfully deleted' });
    }
  });
};