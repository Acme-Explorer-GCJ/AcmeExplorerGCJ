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
  trip: { type: Schema.ObjectId, ref: 'Trips' }
}, { strict: false });

ApplyTripSchema.index({ consumer: 1});
ApplyTripSchema.index({ explorer: 1 }); 
ApplyTripSchema.index({ statusUpdateMoment: 1 });

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
