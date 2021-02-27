'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
   required: 'Trip ticker required'
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

module.exports = mongoose.model('Trips', TripSchema);
module.exports = mongoose.model('Stages', StageSchema);
