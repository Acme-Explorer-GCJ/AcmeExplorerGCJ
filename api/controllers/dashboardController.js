var mongoose = require('mongoose'),
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
  Trips.aggregate([
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
  Applications.aggregate([
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
  Trips.aggregate([
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
  Applications.aggregate([
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