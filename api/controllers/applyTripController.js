'use strict';


var mongoose = require('mongoose'),
  ApplyTrip = mongoose.model('ApplyTrips');

exports.list_all_applications = function(req, res) {
  ApplyTrip.find({}, function(err, appl) {
    if (err){
      res.send(err);
    }
    else{
      res.json(appl);
    }
  });
};

exports.list_my_applications = function(req, res) {
  ApplyTrip.find(function(err, appls) {
    if (err){
      res.send(err);
    }
    else{
      res.json(appls);
    }
  });
};


exports.create_application = function(req, res) {
  var new_appl = new ApplyTrip(req.body);

  new_appl.save(function(error, appl) {
    if (error){
      res.send(error);
    }
    else{
      res.json(appl);
    }
  });
};

exports.search_application = function(req, res) {
  //Check if status param exists (status: req.query.status)
  //Search depending on params but only if deleted = false
  console.log('Searching an application depending on params');
  var status = req.query.status;
  if (!status) {
    logger.warn("New application GET request without status, sending 400...");
    res.sendStatus(400); // bad request
  } else {
    ApplyTrip.find({ status:req.query.status }, function (err, applications) {
      if (err){
        res.send(err);
      } else {
        res.json(applications);
      }
    });
  };
};

exports.read_application = function(req, res) {
  ApplyTrip.findById(req.params.applicationId, function(err, appl) {
    if (err){
      res.send(err);
    }
    else{
      res.json(appl);
    }
  });
};


exports.update_application = function(req, res) {
  ApplyTrip.findOneAndUpdate({_id: req.params.applicationId}, req.body, {new: true}, function(err, appl) {
    if (err){
      res.send(err);
    }
    else{
      res.json(appl);
    }
  });
};


exports.delete_application = function(req, res) {
  ApplyTrip.remove({
    _id: req.params.applicationId
  }, function(err, appl) {
    if (err){
      res.send(err);
    }
    else{
      res.json({ message: 'Trip application successfully deleted' });
    }
  });
};
