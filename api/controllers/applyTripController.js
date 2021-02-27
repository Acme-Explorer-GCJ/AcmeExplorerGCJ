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


exports.create_an_application = function(req, res) {
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


exports.read_an_application = function(req, res) {
  Order.findById(req.params.applId, function(err, appl) {
    if (err){
      res.send(err);
    }
    else{
      res.json(appl);
    }
  });
};


exports.update_an_application = function(req, res) {
  Order.findById(req.params.applId, function(err, appl) {
      if (err){
        res.send(err);
      }
      else{
          Order.findOneAndUpdate({_id: req.params.applId}, req.body, {new: true}, function(err, appl) {
            if (err){
              res.send(err);
            }
            else{
              res.json(appl);
            }
          });
        }
    });
};


exports.delete_an_application = function(req, res) {
  Order.remove({
    _id: req.params.applId
  }, function(err, appl) {
    if (err){
      res.send(err);
    }
    else{
      res.json({ message: 'Trip application successfully deleted' });
    }
  });
};
