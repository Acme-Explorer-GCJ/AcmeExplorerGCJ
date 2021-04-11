'use strict';

const { list_all_trips } = require('./tripController');
var authController = require('../controllers/authController');
const { set } = require('../../app');

var mongoose = require('mongoose'),
  ApplyTrip = mongoose.model('ApplyTrips'),
  Trip = mongoose.model('Trips'),
  Actor = mongoose.model('Actors');

exports.list_all_applications = function (req, res) {
  ApplyTrip.find({}, function (err, application) {
    if (err) {
      res.status(500).send(err);
    }
    else {
      res.json(application);
    }
  });
};

exports.list_my_applications = async function (req, res) {
  var listAppl = [];
  var idToken = req.headers['idtoken'];
  var authenticatedUserId = await authController.getUserId(idToken);
  await Trip.find({ manager: authenticatedUserId }, async function (err, trips) {
    for (let trip of trips) {
      if (trip.applications !== []) {
        await ApplyTrip.findOne({ trip: trip._id }, function (err, appl) {
          if (err) {
            console.log(Date() + " - " + err);
            res.status(500).send(err);
          }
          else {
            if (appl) {
              console.log("1")
              listAppl.push(appl);
            }
          }
        });
      } else {
        console.log("2")
        res.json(listAppl);
      }
    }
    if (err) {
      console.log(Date() + " - " + err);
      res.status(500).send(err);
    }
    else {
      console.log("3")
      await res.json(listAppl);
    }
  });
};

exports.create_application = async function (req, res) {
  var new_appl = new ApplyTrip(req.body);
  var idToken = req.headers['idtoken'];
  var authenticatedUserId = await authController.getUserId(idToken);

  Actor.findOne({ _id: authenticatedUserId }, function (err, actor) {
    if (err) {
      res.send(err);
    } else {
      if (req.body.trip) {
        Trip.findById(req.body.trip, function (err, trip) {
          if (err) {
            //res.status(500).send(err);
            res.status(403);
            res.json("Application cannot be created. Trip does not exist!");

          } else {
            if (trip.status.includes('PUBLISHED')) {
              if (Date.parse(trip.dateStart) < Date.now()) {
                res.status(403);
                res.json("Application cannot be created. Trip has been started!");

              } else {

                if (!trip.applications) {
                  trip.applications = []
                }
                trip.applications.push(new_appl)
                trip.save(function (err, updated_trip) {
                  if (err) {
                    console.log(updated_trip)
                    console.log(Date() + " - " + err);
                    if (err.name == 'ValidationError') {
                      res.status(422).send(err);
                    }
                    else {
                      res.status(500).send(err);
                    }
                  }
                });
                new_appl.explorer = actor;
                new_appl.save(function (err, appl) {
                  if (err) {
                    console.log(new_appl)
                    console.log(Date() + " - " + err);
                    if (err.name == 'ValidationError') {
                      res.status(422).send(err);
                    }
                    else {
                      res.status(500).send(err);
                    }
                  }
                  else {
                    res.json(appl);
                  }
                });
              }
            } else {
              res.status(403).send('The trip is not published! You cannot create an application.');
            }
          }
        });
      }
    }
  });
};

exports.search_application = async function (req, res) {
  var query = {};
  var idToken = req.headers['idtoken'];
  var authenticatedUserId = await authController.getUserId(idToken);

  var skip = 0;
  if (req.query.startFrom) {
    skip = parseInt(req.query.startFrom);
  }
  var limit = 0;
  if (req.query.pageSize) {
    limit = parseInt(req.query.pageSize);
  }

  var sort = "";
  if (req.query.reverse == "true") {
    sort = "-";
  }
  if (req.query.sortedBy) {
    sort += req.query.sortedBy;
  }
  console.log(req.query.status);
  console.log("Query: " + query + " Skip:" + skip + " Limit:" + limit + " Sort:" + sort);
  ApplyTrip.find({'explorer': authenticatedUserId,'status': req.query.status})
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean()
    .exec(function (err, application) {
      console.log('Start searching applications');
      if (err) {
        res.send(err);
      }
      else {
        res.json(application);
      }
      console.log('End searching applications');
    });
};

exports.read_application = function (req, res) {
  ApplyTrip.findById(req.params.applicationId, function (err, application) {
    if (err) {
      res.status(500).send(err);
    }
    else {
      res.json(application);
    }
  });
};


exports.update_application = async function (req, res) {

  var idToken = req.headers['idtoken'];
  var authenticatedUserId = await authController.getUserId(idToken);
  var new_appl = new ApplyTrip(req.body);

  console.log(authenticatedUserId)
  Actor.findOne({ _id: authenticatedUserId }, function (err, actor) {
    if (actor.role.includes('EXPLORER')) {
      if (err) {
        res.send(err);
      } else {
        ApplyTrip.findById(req.params.applicationId, function (err, application) {
          if (err) {
            if (err.name == 'ValidationError') {
              res.status(422).send(err);
            }
            else {
              res.status(500).send(err);
            }
          }
          else {
            if (String(actor._id) == String(application.explorer)) {
              ApplyTrip.findOneAndUpdate({ _id: req.params.applicationId }, req.body, { new: true }, function (err, application) {
                if (err) {
                  res.status(500).send(err);
                }
                else {
                  res.json(application);
                }
              });
            } else {
              res.status(403);
              res.json("You cannot edit others explorers applications!")
            }
          }
        });
      }
    } else if (actor.role.includes('MANAGER')) {
      ApplyTrip.findOne({ _id: req.params.applicationId }, function (err, application) {
        if (err) {
          res.status(500).send(err);
        }
        else {
          Trip.findById(application.trip, function (err, trip) {
            if (err) {
              res.status(500).send(err);
            }
            else {
              if (String(trip.manager._id) == String(actor.id)) {
                if (application.status == 'PENDING'
                  && (new_appl.startMoment !== ''
                    || new_appl.cancellationMoment !== ''
                    || new_appl.cancellationReason !== ''
                    || new_appl.explorer !== ''
                    || new_appl.comments !== []
                    || new_appl.total !== ''
                    || new_appl.trip !== '')) {
                  if (new_appl.status == 'REJECTED' || new_appl.status == 'DUE') {
                    console.log("1" + new_appl.status)
                    application.status = new_appl.status;
                    application.save(function (err, appl) {
                      if (err) {
                        res.status(500).send(err);
                      }
                      else {
                        res.status(200);
                        res.json(appl);
                      }
                    }
                    );

                  } else {
                    res.status(403).send('You only can edit the status of pending applications to rejected or due!')
                  }
                } else {
                  res.status(403).send('You only can edit the status of pending applications!')
                }
              } else {
                res.status(403).send('You cannot edit this application, you are not the manager of the trip!')
              }
            }
          });
        }
      });
    } else {
      res.status(403);
      res.json("You cannot edit others applications!")
    }
  });
};


exports.delete_application = function (req, res) {
  //Check if the application were delivered or not and delete it or not accordingly
  //Check if the user is the proper customer that posted the application and if not: res.status(403); "an access token is valid, but requires more privileges"
  ApplyTrip.deleteOne({
    _id: req.params.orderId
  }, function (err, application) {
    if (err) {
      res.status(500).send(err);
    }
    else {
      res.json({ message: 'ApplyTrip successfully deleted' });
    }
  });
};
