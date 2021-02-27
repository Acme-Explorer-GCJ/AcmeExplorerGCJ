'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApplyTripSchema = new Schema({
  startMoment: {
    type: Date,
    required: 'Start data required'
  },
  status: [{
    type: String,
    required: 'Status required',
    enum: ['PENDING', 'REJECTED', 'DUE', 'ACCEPTED', 'CANCELLED']
  }],
  cancellationReason: {
    type: String
  },
  comment: {
    type: String,
  }
}, { strict: false });

module.exports = mongoose.model('ApplyTrips', ApplyTripSchema);
