var async = require("async");
var mongoose = require('mongoose'),
  Trip = mongoose.model('Trips'),
  Application = mongoose.model('ApplyTrips'),
  Dashboard = mongoose.model('Dashboard');

exports.list_all_indicators = function(req, res) {
  console.log('Requesting indicators');
  
  Dashboard.find().sort("-computationMoment").exec(function(err, indicators) {
    if (err){
      res.send(err);
    }
    else{
      res.json(indicators);
    }
  });
};

exports.last_indicator = function(req, res) {
  
  Dashboard.find().sort("-computationMoment").limit(1).exec(function(err, indicators) {
    if (err){
      res.send(err);
    }
    else{
      res.json(indicators);
    }
  });
};

//The average, the minimum, the maximum, and the standard deviation of the number of trips managed per manager
function computeTripsPerManager(callback){
  Trip.aggregate([
    {$group: {_id:"$manager", TripsPerManager:{$sum:1}}},
    {$group: { _id:0,
        average: {$avg:"$TripsPerManager"},
        min: {$min:"$TripsPerManager"},
        max: {$max:"$TripsPerManager"},
        stdev : {$stdDevSamp : "$TripsPerManager"}
        }}
  ], function(err, res){
    callback(err, res)
  });
}

//The average, the minimum, the maximum, and the standard deviation of the number of applications per trip.
function computeApplicationsPerTrip(callback){
  Application.aggregate([
    { 
        $group : { 
            _id : "$manager", 
            contador : { 
                $sum : 1.0
            }
        }
    }, 
    { 
        $group : { 
            _id : 0.0, 
            average : { 
                $avg : "$contador"
            }, 
            min : { 
                $min : "$contador"
            }, 
            max : { 
                $max : "$contador"
            }, 
            stdev : { 
                $stdDevSamp : "$contador"
            }
        }
    }
  ],function(err,res){
    callback(err,res)
  });
}

//The average, the minimum, the maximum, and the standard deviation of the price of the trips.
function computePriceTrip(callback){
  Trip.aggregate([
    { 
        "$group" : { 
            "_id" : { 
                "manager" : "$manager"
            }, 
            "COUNT(*)" : { 
                "$sum" : { "$toInt": "1" }
            }, 
            "MIN(price)" : { 
                "$min" : "$price"
            }, 
            "MAX(price)" : { 
                "$max" : "$price"
            }, 
            "AVG(price)" : { 
                "$avg" : "$price"
            }, 
            "STDEV(price)" : { 
                "$stdDevSamp" : "$price"
            }
        }
    }, 
    { 
        "$project" : { 
            "manager" : "$_id.manager", 
            "count" : "$COUNT(*)", 
            "min" : "$MIN(price)", 
            "max" : "$MAX(price)", 
            "avg" : "$AVG(price)", 
            "stdev" : "$STDEV(price)"
        }
    }
], function(err,res){
  callback(err,res);
})
}

//The ratio of applications grouped by status.
function computeRatioApplications(callback){
  Application.aggregate([
    {$facet:{
          totalByStatusPending: [
            {$match : {"status" : "PENDING"}}, // 'PENDING','REJECTED','DUE','ACCEPTED','CANCELLED'
            {$group : {_id:null, totalStatus:{$sum:1}}}
          ],
          totalByStatusRejected: [
            {$match : {"status" : "REJECTED"}}, // 'PENDING','REJECTED','DUE','ACCEPTED','CANCELLED'
            {$group : {_id:null, totalStatus:{$sum:1}}}
          ],
          totalByStatusDue: [
            {$match : {"status" : "DUE"}}, // 'PENDING','REJECTED','DUE','ACCEPTED','CANCELLED'
            {$group : {_id:null, totalStatus:{$sum:1}}}
          ],
          totalByStatusAccepted: [
            {$match : {"status" : "ACCEPTED"}}, // 'PENDING','REJECTED','DUE','ACCEPTED','CANCELLED'
            {$group : {_id:null, totalStatus:{$sum:1}}}
          ],
          totalByStatusCancelled: [
            {$match : {"status" : "CANCELLED"}}, // 'PENDING','REJECTED','DUE','ACCEPTED','CANCELLED'
            {$group : {_id:null, totalStatus:{$sum:1}}}
          ],
          total:         [{$group : {_id:null, totalApplication:{$sum:1}}}]

          }
    },
          
    {$project: {_id:0,                            
              total : {$arrayElemAt: ["$total.totalApplication", 0 ]},
              totalByStatusPending : {$arrayElemAt: ["$totalByStatusPending.totalStatus", 0 ]},
              totalByStatusRejected : {$arrayElemAt: ["$totalByStatusRejected.totalStatus", 0 ]},
              totalByStatusDue : {$arrayElemAt: ["$totalByStatusDue.totalStatus", 0 ]},
              totalByStatusAccepted : {$arrayElemAt: ["$totalByStatusAccepted.totalStatus", 0 ]},
              totalByStatusCancelled : {$arrayElemAt: ["$totalByStatusCancelled.totalStatus", 0 ]},
              ratioApplicationsPending: { $divide: [
                  {$arrayElemAt: ["$totalByStatusPending.totalStatus", 0 ]}, 
                  {$arrayElemAt: ["$total.totalApplication", 0 ]} 
                ]
              },
              ratioApplicationsRejected: { $divide: [
                  {$arrayElemAt: ["$totalByStatusRejected.totalStatus", 0 ]}, 
                  {$arrayElemAt: ["$total.totalApplication", 0 ]} 
                ]
              },
              ratioApplicationsDue: { $divide: [
                  {$arrayElemAt: ["$totalByStatusDue.totalStatus", 0 ]}, 
                  {$arrayElemAt: ["$total.totalApplication", 0 ]} 
                ]
              },
              ratioApplicationsAccepted: { $divide: [
                  {$arrayElemAt: ["$totalByStatusAccepted.totalStatus", 0 ]}, 
                  {$arrayElemAt: ["$total.totalApplication", 0 ]} 
                ]
              },
              ratioApplicationsCancelled: { $divide: [
                  {$arrayElemAt: ["$totalByStatusCancelled.totalStatus", 0 ]}, 
                  {$arrayElemAt: ["$total.totalApplication", 0 ]} 
                ]
              }
            }

    }   
  ], function(err,res){
    callback(err,res);
  })
}
var CronJob = require('cron').CronJob;
var CronTime = require('cron').CronTime;

//'0 0 * * * *' una hora
//'*/30 * * * * *' cada 30 segundos
//'*/10 * * * * *' cada 10 segundos
var rebuildPeriod = '*/10 * * * * *';  //El que se usará por defecto
var computeDashboardJob;

exports.rebuildPeriod = function(req, res) {
  //console.log('Updating rebuild period. Request: period:'+req.query.rebuildPeriod);
  rebuildPeriod = req.query.rebuildPeriod;
  computeDashboardJob.setTime(new CronTime(rebuildPeriod));
  computeDashboardJob.start();

  res.json(req.query.rebuildPeriod);
};

function createDashboardJob(){
      computeDashboardJob = new CronJob(rebuildPeriod,  function() {
      
      var new_dashboard = new Dashboard();
      async.parallel([
        computeTripsPerManager,
        computeApplicationsPerTrip,
        computePriceTrip,
        computeRatioApplications
      ], function (err, results) {
        if (err){
          console.log("Error computing dashboard: "+err);
        }
        else{
          new_dashboard.TripsPerManager = results[0];
          new_dashboard.ApplicationsPerTrip = results[1];
          new_dashboard.PriceTrip = results[2];
          new_dashboard.ratioApplications = results[3];
          new_dashboard.rebuildPeriod = rebuildPeriod;
    
          new_dashboard.save(function(err, datawarehouse) {
            if (err){
              console.log("Error saving dashboard: "+err);
            }
            else{
              console.log("new dashboard succesfully saved. Date: "+new Date());
            }
          });
        }
      });
    }, null, true, 'Europe/Madrid');
  }
exports.averagePriceFinders = async (req, res) => {
  try {
      const docs = await Finderschema.aggregate([
          {$project:{
            _id: 0,
            minimun: {$arrayElemAt: ["$priceRange", 0 ]},
            maximun: {$arrayElemAt: ["$priceRange", 1 ]}
          }},
          {$group:{
            _id: 0,
            avg_min: {$avg: "$minimun"},
            avg_max: {$avg: "$maximun"}
          }},  
      ]).exec();

      if (docs.length > 0) {
          return res.status(200).json(docs);
      } else {
          return res.sendStatus(404);
      }

  } catch (err) {
      res.status(500).json({ reason: "Database error" });
  }
};


//Get the top 10 key words that the explorers indicate in their finders.
exports.topTenKeywordsFinders = async (req, res) => {
  try {
      const docs = await FinderSchema.aggregate([
          
      ]).exec();

      if (docs.length > 0) {
          return res.status(200).json(docs);
      } else {
          return res.sendStatus(404);
      }

  } catch (err) {
      res.status(500).json({ reason: "Database error" });
  }
};
module.exports.createDashboardJob = createDashboardJob;
