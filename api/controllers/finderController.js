'use strict';

var mongoose = require('mongoose'),
    Finder = mongoose.model('Finders'),
    Actor = mongoose.model('Actors');

var authController = require('./authController');


exports.read_a_finder = async function (req, res) {
    var idToken = req.headers['idtoken'];
    var authenticatedUserId = await authController.getUserId(idToken);
    Actor.findById(authenticatedUserId, async function (err, actor) {
        if (err) {
            res.send(err);
        }
        else {
            Finder.find({ explorer: actor._id }, function (err, read_a_finder) {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    console.log("Returning finders by userId");
                    res.json(read_a_finder);
                }
            });
        }
    });
}

exports.create_a_finder = async function (req, res) {
    var idToken = req.headers['idtoken'];
    var authenticatedUserId = await authController.getUserId(idToken);
    var new_finder = new Finder(req.body);

    Actor.findById(authenticatedUserId, function (err, actor) {
        if (err) {
            res.send(err);
        }
        else {
            new_finder.explorer = actor;
            new_finder.save(function (err, finder) {

                if (err) {
                    if (err.name == 'ValidationError') {
                        res.status(422).send(err);
                    }
                    else {
                        console.log(finder);
                        res.status(500).send(err);
                    }
                }
                else {
                    res.status(200).json(finder);
                }
            });
        }
    });
};

exports.update_a_finder = async function (req, res) {
    var idToken = req.headers['idtoken'];
    var authenticatedUserId = await authController.getUserId(idToken);
    Actor.findById(authenticatedUserId, function (err, actor) {
        if (err) {
            res.send(err);
        }
        else {
            Finder.findOneAndUpdate({explorer: actor._id }, req.body, { new: true }, function (err, finder) {
                console.log("2" + actor._id)
                if (err) {
                    if (err.name == 'ValidationError') {
                        res.status(422).send(err);
                    }
                    else {
                        res.status(500).send(err);
                    }
                }
                else {
                    res.json(finder);
                }
            });
        }
    });
};

exports.delete_a_finder = async function (req, res) {
    var idToken = req.headers['idtoken'];
    var authenticatedUserId = await authController.getUserId(idToken);

    Actor.findById(authenticatedUserId, function (err, actor) {
        if (err) {
            res.send(err);
        }
        else {
            Finder.find({ explorer: actor._id }, function (err, finder) {
                if (err) {
                    if (err.name == 'ValidationError') {
                        res.status(422).send(err);
                    }
                    else {
                        res.status(500).send(err);
                    }
                } else {
                    Finder.deleteOne({ keyword: req.params.keyword }, function (err, Finder) {
                        if (err) {
                            res.status(500).send(err);
                        }
                        else {
                            res.json({ message: 'Finder successfully deleted' });
                        }
                    });
                }
            });
        }
    });
};
