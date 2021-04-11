'use strict';

/*---------------TRIP----------------------*/
var mongoose = require('mongoose'),
  Trip = mongoose.model('Trips'),
  Actor = mongoose.model('Actors');

exports.list_all_trips = function (req, res) {
  Trip.find(function (err, trips) {
    if (err) {
      console.log(Date() + " - " + err);
      res.status(500).send(err);
    }
    else {
      res.json(trips);
    }
  });
};


exports.create_a_trip = function (req, res) {
  var new_trip = new Trip(req.body);
  var idToken = req.headers['idtoken'];

  admin.auth().verifyIdToken(idToken).then(function (decodedToken) {

    var uid = decodedToken.uid;

    Actor.findOne({ email: uid }, function (err, actor) {
      if (err) {
        res.send(err);
      } else {
        console.log(actor._id)
        new_trip.manager = actor;
        console.log(new_trip);
        new_trip.save(function (err, trip) {
          if (err) {
            console.log(Date() + " - " + err);
            if (err.name == 'ValidationError') {
              res.status(422).send(err);
            }
            else {
              res.status(500).send(err);
            }
          }
          else {
            res.json(trip);
          }
        });
      }
    });
  });
};

exports.search_trip = function (req, res) {
  console.log('Searching a trip depending on params');
  var title = req.query.title;
  var ticker = req.query.ticker;
  var description = req.query.description;
  Trip.find({ $or: [{ 'title': { '$regex': '.*' + title + '.*' } }, { 'ticker': { '$regex': '.*' + ticker + '.*' } }, { 'description': { '$regex': '.*' + description + '.*' } }] }
    //title:req.query.title
    , function (err, trips) {
      if (err) {
        res.send(err);
      }
      else {
        res.json(trips);
      }
    }).limit(10);
};


exports.read_a_trip = function (req, res) {
  Trip.findById(req.params.tripId, function (err, trip) {
    if (err) {
      res.status(500).send(err);
    }
    else {
      res.json(trip);
    }
  });
};


exports.update_a_trip = function (req, res) {
  if (req.body.applications) {
    for (let application of req.body.applications) {
      if (req.body.status == 'CANCELLED' && application.status.includes('ACCEPTED')) {
        res.status(422).send('You cannot cancel the trip because the trip has accepted applications!');
      }
    }
  }
  if (req.body.status == 'CANCELLED'
    && (!req.body.cancellationReason
      || Date.parse(req.body.dateStart) >= Date.now())) {
    res.status(422).send('You need to include a cancelation reason!');
  } else {
    Trip.findOne({ _id: req.params.tripId }, req.body, { new: true }, function (err, trip) {
      console.log(trip.status)
      if (trip.status !== 'PUBLISHED') {
        trip.save(function (err, trip) {
          var price = 0;
          console.log(req.params.tripId + "/" + trip)
          if (trip.stages) {
            for (let stage of trip.stages) {
              price = price + stage.price;
            }
            trip.price = price;
          }
          if (err) {
            if (err.name == 'ValidationError') {
              res.status(422).send(err);
            }
            else {
              res.status(500).send(err);
            }
          }
          else {
            console.log(trip)
            res.status(200).json(trip);
          }
        });
      } else {
        res.status(403).send("You cannot modify this trip as long as is PUBLISHED!");
      }
    });
  }
};

exports.delete_a_trip = function (req, res) {
  Trip.remove({ _id: req.params.tripId }, function (err, trip) {
    if (err) {
      res.status(500).send(err);
    }
    else {
      res.json({ message: 'Trip successfully deleted' });
    }
  });
};


/*---------------STAGES----------------------*/
var mongoose = require('mongoose'),
  Stage = mongoose.model('Stages');

exports.list_all_stages = function (req, res) {
  Stage.find({}, function (err, stages) {
    if (err) {
      res.status(500).send(err);
    }
    else {
      res.json(stages);
    }
  });
};

exports.create_a_stage = function (req, res) {
  var new_stage = new Stage(req.body);
  new_stage.save(function (err, stage) {
    if (err) {
      if (err.name == 'ValidationError') {
        res.status(422).send(err);
      }
      else {
        res.status(500).send(err);
      }
    }
    else {
      res.json(stage);
    }
  });
};

exports.search_stage = function (req, res) {
  //Check if title param exists (title: req.query.title)
  //Search depending on params but only if deleted = false
  console.log('Searching a stage depending on params');
  var title = req.query.title;
  if (!title) {
    logger.warn("New stage GET request without title, sending 400...");
    res.sendStatus(400); // bad request
  } else {
    Stage.find({ title: req.query.title }, function (err, stages) {
      if (err) {
        res.send(err);
      }
      else {
        res.json(stages);
      }
    });
  };
};

exports.read_a_stage = function (req, res) {
  Stage.findById(req.params.stageId, function (err, stage) {
    if (err) {
      res.send(err);
    }
    else {
      res.json(stage);
    }
  });
};

exports.update_a_stage = function (req, res) {
  Stage.findOneAndUpdate({ _id: req.params.stageId }, req.body, { new: true }, function (err, stage) {
    if (err) {
      if (err.name == 'ValidationError') {
        res.status(422).send(err);
      }
      else {
        res.status(500).send(err);
      }
    }
    else {
      res.json(stage);
    }
  });
};

exports.delete_a_stage = function (req, res) {
  Stage.remove({ _id: req.params.stageId }, function (err, stage) {
    if (err) {
      res.status(500).send(err);
    }
    else {
      res.json({ message: 'Stage successfully deleted' });
    }
  });
};