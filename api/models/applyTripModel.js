'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApplyTripSchema = new Schema({
  startMoment: {
    type: Date,
    default: Date.now,
    required: 'Start date required'
  },
  status: [{
    type: String,
    required: 'Status required',
    enum: ['PENDING', 'REJECTED', 'DUE', 'ACCEPTED', 'CANCELLED'],
    default: 'PENDING'
  }],
  cancellationMoment: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  explorer: {
    type: Schema.Types.ObjectId,
    required: 'explorer id required'
  },
  manager: {
    type: Schema.Types.ObjectId
  },
  comments: [String],
  total:{
    type: Number,
    min: 0
  },
  explorer: {
    type: Schema.Types.ObjectId,
    required: 'explorer id required'
  },
  trip: {
    type: Schema.Types.ObjectId,
    required: 'trip id required'
  },
}, { strict: false });

ApplyTripSchema.index({ explorer: 1 }); 
ApplyTripSchema.index({ trip: 1 });
ApplyTripSchema.index({ status: 1});

  // Execute before each item.save() call
  ApplyTripSchema.pre('save', function(callback) {
  var new_applyTrip = this;
  var date = new Date;
  var day=dateFormat(new Date(), "yymmdd");

  var generator = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);
  var generatedTickerPart = generator();
  var generated_ticker = [day, generatedTickerPart].join('-');
  new_applyTrip.ticker = generated_ticker;
  callback();
});

module.exports = mongoose.model('ApplyTrips', ApplyTripSchema);
