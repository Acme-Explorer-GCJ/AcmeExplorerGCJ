'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var en = require("nanoid-good/locale/en"); // you should add locale of your preferred language
var customAlphabet  = require("nanoid-good").customAlphabet(en);
const dateFormat = require('dateformat');
const { db } = require('./actorModel');

var RequirementSchema = new Schema({
  name: {
    type: String,
    required: 'Requirement name required'
  }
}, { strict: false });

var StageSchema = new Schema({

  title: {
    type: String,
    required: 'Stage name required'
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    min: 0
  }
}, { strict: false });

var PictureSchema = new Schema({
  name: {
    type: String,
    required: 'Picture name required'
  },
  picture: {
    data: Buffer, contentType: String
  }
}, { strict: false });

var TripSchema = new Schema({
  ticker: {
   type: String,
   unique: true,
   //This validation does not run after middleware pre-save
   validate: {
    validator: function(v) {
        return /\d{6}-\w{4}/.test(v);
    },
    message: 'ticker is not valid!, Pattern("\d(6)-\w(4)")'
  }
},
  title: {
    type: String,
    required: 'Trip title required'
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    min: 0
  },
  status: [{
    type: String,
    required: 'Status required',
    enum: ['CREATED', 'PUBLISHED', 'CANCELLED'],
    default: 'CREATED'
  }],
   dateStart: {
    required: 'start date required',
    type: Date,
    validate: function(dateStart) {
      return dateStart < this.dateEnd;
  },
  message: 'startDate can\'t be greater than endDate'
  },
  dateEnd: {
    required: 'end date required',
   type: Date,
 },
 cancellationMoment: {
  type: Date,
},
cancellationReason: {
 type: String,
},
manager:{
  type: Schema.Types.ObjectId,
  required: 'Kindle enter a manager of the trip'
},
stages: [StageSchema],
requirements: [RequirementSchema],
pictures: [PictureSchema],
applications: [{type: Schema.ObjectId, ref: 'ApplyTrips' }]
}, { strict: false });


// Execute before each trip.save() call
TripSchema.pre('save', function(callback) {
  var new_trip = this;
  var date = new Date;
  var day=dateFormat(new Date(), "yymmdd");

  var generator = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);
  var generatedTickerPart = generator();
  var generated_ticker = [day, generatedTickerPart].join('-');

  var price = 0
  for (let stage of new_trip.stages) {
    price = price + stage.price;
  }
  new_trip.ticker = generated_ticker;
  new_trip.price = price;
  callback();
});
TripSchema.index({ dateStart: 1, price: 1 }); //1 ascending,  -1 descending
TripSchema.index({ title: 'text', description: 'text'});


module.exports = mongoose.model('Trips', TripSchema);
module.exports = mongoose.model('Stages', StageSchema);
