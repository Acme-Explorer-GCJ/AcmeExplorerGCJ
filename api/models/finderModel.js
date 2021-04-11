'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TripsFinderSchema = new Schema({
    ticker: {
        type: String,
        //This validation does not run after middleware pre-save
        validate: {
            validator: function(v) {
                return /\d{6}-[A-Z]{4}/.test(v);
            },
            message: 'ticker is not valid!, Pattern("\d(6)-[A-Z](4)")'
        }
    },
    title: {
        type: String,
        required: 'Kindly enter the title of the trip'
    },
    description: {
        type: String,
        required: 'Kindly enter the description of the trip'
    },
    price: {
        type: Number,
        min: 0
    },
    dateStart:{
        type: Date
    },
    dateEnd:{
        type: Date
    }
});

var FinderSchema = new Schema({
    explorer: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    keyword: {
        type: String,
        default: null
    },
    dateMin: {
        type: Date,
        default: null
    },
    dateMax: {
        type: Date,
        default: null
    },
    price: {
        type: Number,
        default: null
    },
    maxPrice: {
        type: Number,
        default: null
    },
    finderResults: {
        type: [TripsFinderSchema]
    }
}, {strict:false, timestamps: true });

FinderSchema.pre('save', function(callback){
    var timestamp = new Date();
    var newFinder = this;
    newFinder.timestamp = timestamp;
    callback();
});

FinderSchema.pre('updateOne', function(callback){
    var timestamp = new Date();
    var newFinder = this;
    newFinder.timestamp = timestamp;

    callback();
});

FinderSchema.index({timestamp: -1});
FinderSchema.index({explorer: 1});

module.exports = mongoose.model('TripSchemaFinder', TripsFinderSchema);
module.exports = mongoose.model('Finders', FinderSchema);
