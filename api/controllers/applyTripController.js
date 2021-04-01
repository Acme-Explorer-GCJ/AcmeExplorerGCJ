'use strict';


var mongoose = require('mongoose'),
  ApplyTrip = mongoose.model('ApplyTrips');

exports.list_all_applications = function(req, res) {
  ApplyTrip.find({}, function(err, application) {
    if (err){
      res.status(500).send(err);
    }
    else{
      res.json(application);
    }
  });
};

exports.list_my_applications = function(req, res) {
  ApplyTrip.find(function(err, applications) {
    if (err){
      res.status(500).send(err);
    }
    else{
      res.json(applications);
    }
  });
};


exports.create_application = function(req, res) {
  var new_appl = new ApplyTrip(req.body);

  new_appl.save(function(error, application) {
    if (error){
      if(err.name=='ValidationError') {
          res.status(422).send(err);
        }
        else{
          res.status(500).send(err);
        }
      }
    else{
      res.json(application);
    }
  });
};

exports.search_application = function(req, res) {
  var query = {};
  //if managerId is null, i.e. parameter is not in the URL, the search retrieves applications not assined to any manager
  //else, the search retrieves applications assined to the specified application
  query.manager = req.query.managerId;

  if (req.query.cancelled=="true") {
    //retrieving applications with a statusUpdateMoment
    query.statusUpdateMoment = { $exists: true }
  }
  if (req.query.cancelled=="false") {
    //retrieving applications without a statusUpdateMoment
    query.statusUpdateMoment = { $exists: false };
  }
  if (req.query.accepted=="true") {
    //retrieving applications with a statusUpdateMoment
    query.acceptanceMoment = { $exists: true }
  }
  if (req.query.accepted=="false") {
    //retrieving applications without a statusUpdateMoment
    query.acceptanceMoment = { $exists: false };
  }

  var skip=0;
  if(req.query.startFrom){
    skip = parseInt(req.query.startFrom);
  }
  var limit=0;
  if(req.query.pageSize){
    limit=parseInt(req.query.pageSize);
  }

  var sort="";
  if(req.query.reverse=="true"){
    sort="-";
  }
  if(req.query.sortedBy){
    sort+=req.query.sortedBy;
  }

  console.log("Query: "+query+" Skip:" + skip+" Limit:" + limit+" Sort:" + sort);

  ApplyTrip.find(query)
       .sort(sort)
       .skip(skip)
       .limit(limit)
       .lean()
       .exec(function(err, application){
    console.log('Start searching applications');
    if (err){
      res.send(err);
    }
    else{
      res.json(application);
    }
    console.log('End searching applications');
  });
};

exports.read_application = function(req, res) {
  ApplyTrip.findById(req.params.applicationId, function(err, application) {
    if (err){
      res.status(500).send(err);
    }
    else{
      res.json(application);
    }
  });
};


exports.update_application = function(req, res) {
  //Check if the application has been previously assigned or not
  //Assign the application to the proper manager that is requesting the assigment
  //when updating delivery moment it must be checked the manager assignment and to check if it is the proper manager and if not: res.status(403); "an access token is valid, but requires more privileges"
  ApplyTrip.findById(req.params.applicationId, function(err, application) {
    if (err){
      if(err.name=='ValidationError') {
          res.status(422).send(err);
      }
      else{
        res.status(500).send(err);
      }
    }
    else{
        ApplyTrip.findOneAndUpdate({_id: req.params.applicationId}, req.body, {new: true}, function(err, application) {
          if (err){
            res.status(500).send(err);
          }
          else{
            res.json(application);
          }
        });
      }
  });
};


exports.delete_application = function(req, res) {
  //Check if the application were delivered or not and delete it or not accordingly
  //Check if the user is the proper customer that posted the application and if not: res.status(403); "an access token is valid, but requires more privileges"
  ApplyTrip.deleteOne({
    _id: req.params.orderId
  }, function(err, application) {
    if (err){
      res.status(500).send(err);
    }
    else{
      res.json({ message: 'ApplyTrip successfully deleted' });
    }
  });
};
