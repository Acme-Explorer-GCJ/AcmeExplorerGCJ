'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var en = require("nanoid-good/locale/en"); // you should add locale of your preferred language
var customAlphabet  = require("nanoid-good").customAlphabet(en);
const dateFormat = require('dateformat');

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
        return /\d{6}-\w{6}/.test(v);
    },
    message: 'ticker is not valid!, Pattern("\d(6)-\w(6)")'
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
   dateStart: {
    type: Date,
  },
  dateEnd: {
   type: Date,
 },
 cancellationMoment: {
  type: Date,
},
cancellationReason: {
 type: String,
},
requirements: [RequirementSchema],
pictures: [PictureSchema]
}, { strict: false });

// Execute before each item.save() call
TripSchema.pre('save', function(callback) {
  var new_trip = this;
  var date = new Date;
  var day=dateFormat(new Date(), "yymmdd");

  var generator = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6);
  var generatedTickerPart = generator();
  var generated_ticker = [day, generatedTickerPart].join('-');
  
  new_trip.ticker = generated_ticker;
  callback();
});
TripSchema.index({ dateStart: 1, price: 1 }); //1 ascending,  -1 descending
TripSchema.index({ title: 'text', description: 'text'});


module.exports = mongoose.model('Trips', TripSchema);
module.exports = mongoose.model('Stages', StageSchema);
