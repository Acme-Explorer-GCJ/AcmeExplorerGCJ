'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DashboardSchema = new Schema({
    //The average, the minimun, the maximum, and the standard deviation of the number of trips managed per manager
    TripsPerManager:{
        average: Number,
        minimum: Number,
        maximum: Number,
        stdev: Number,
    },
    //The average, the minimum, the maximum, and the standard deviation of the number of applications per trip
    ApplicationsPerTrip:{
        average: Number,
        minimum: Number,
        maximum: Number,
        stdev: Number,
    },
    //The average, the minimum, the maximum, and the standard deviation of the price of the trip
    PriceTrip:{
        average: Number,
        minimum: Number,
        maximum: Number,
        stdev: Number,
    },
    //The ratio of applications grouped by status
    ratioApplications: {
      total: Number,
      totalByStatusPending : Number,
      totalByStatusRejected : Number,
      totalByStatusDue : Number,
      totalByStatusAccepted : Number,
      totalByStatusCancelled : Number,
      ratioApplicationsPending: Number,
      ratioApplicationsRejected: Number,
      ratioApplicationsDue: Number,
      ratioApplicationsAccepted: Number,
      ratioApplicationsCancelled: Number
    },
    computationMoment: {
      type: Date,
      default: Date.now
    },
    rebuildPeriod: {
      type: String
    }
}, { strict: false });

DashboardSchema.index({ computationMoment: -1 });

module.exports = mongoose.model('Dashboard', DashboardSchema);
