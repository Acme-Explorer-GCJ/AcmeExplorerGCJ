'use strict';
/*---------------ACTOR----------------------*/
var mongoose = require('mongoose'),
Actor = mongoose.model('Actors');

var authController = require('../controllers/authController');

const { auth } = require('firebase-admin');
var admin = require('firebase-admin');



exports.list_all_actors = function (req, res) {
  //Check if the role param exist
  var roleName;
  if (req.query.role) {
    roleName = req.query.role;
  }
  //Adapt to find the actors with the specified role
  Actor.find({}, function (err, actors) {
    if (err) {
      res.send(err);
    }
    else {
      res.json(actors);
    }
  });
};

exports.create_an_actor = function (req, res) {
  var new_actor = new Actor(req.body);

  const headerToken = req.headers.idtoken;
  console.log('starting verifying idToken');
  var idToken = req.headers['idtoken'];
  console.log('idToken: '+idToken);

  if(!headerToken){
    if ((new_actor.role.includes('EXPLORER'))) {
      new_actor.validated = false;
      new_actor.save(function (err, actor) {
        if (err) {
          res.send(err);
        }
        else {
          res.status(200);
          res.json(actor);
        }
      });
    }
    else {
      res.status(403); //Auth error
      res.send('The Actor is trying to create an Actor that is not himself!');
    }
  } else {
    admin.auth().verifyIdToken(idToken).then(function(decodedToken) {
      console.log('entra en el then de verifyIdToken: ');

      var uid = decodedToken.uid;

      Actor.findOne({ email: uid }, function (err, actor) {
        if (err) {
          res.send(err); 
        }else{
          console.log(actor.role)
          if (actor.role.includes('EXPLORER') || actor.role.includes('MANAGER')){

            res.status(403); //Auth error
            res.send('The Actor is trying to create an Actor that is not himself!');
          } else if (actor.role.includes('ADMINISTRATOR')){
              // If new_actor is a manager, validated = true;
              // If new_actor is a explorer, validated = false;
              if ((new_actor.role.includes( 'MANAGER' ))) {
                new_actor.validated = true;
                new_actor.save(function(err, actor) {
                  if (err){
                    res.send(err);
                  }
                  else{
                    res.json(actor);
                  }
                });
              } else if ((new_actor.role.includes( 'EXPLORER' ))){
                res.status(403);
                res.send('An Administrator cannot create an Explorer')
              } 
          }
    }
  });
});
}
};

exports.read_an_actor = function (req, res) {
  Actor.findById(req.params.actorId, function (err, actor) {
    if (err) {
      res.send(err);
    }
    else {
      res.json(actor);
    }
  });
};

exports.login_an_actor = async function (req, res) {
  console.log('starting login an actor');
  var emailParam = req.query.email;
  var password = req.query.password;
  console.log(emailParam + "/" + password);
  Actor.findOne({ email: emailParam }, function (err, actor) {
    if (err) { res.send(err); }

    // No actor found with that email as username
    else if (!actor) {
      res.status(401); //an access token isn’t provided, or is invalid
      res.json({ message: 'forbidden', error: err });
    }

    else if ((actor.role.includes('MANAGER')) && (actor.validated == false)) {
      res.status(403); //an access token is valid, but requires more privileges
      res.json({ message: 'forbidden', error: err });
    }
    else {
      // Make sure the password is correct
      //console.log('En actor Controller pass: '+password);
      actor.verifyPassword(password, async function (err, isMatch) {
        if (err) {
          res.send(err);
        }

        // Password did not match
        else if (!isMatch) {
          //res.send(err);
          res.status(401); //an access token isn’t provided, or is invalid
          res.json({ message: 'forbidden', error: err });
        }

        else {
          try {
            var customToken = await admin.auth().createCustomToken(actor.email);
          } catch (error) {
            console.log("Error creating custom token:", error);
          }
          actor.customToken = customToken;
          console.log('Login Success... sending JSON with custom token');
          res.json(actor);
        }
      });
    }
  });
};

exports.update_an_actor = function (req, res) {
  var idToken = req.headers['idtoken'];
  var authenticatedUserId = await authController.getUserId(idToken);
  
  //Check that the user is the proper actor and if not: res.status(403); "an access token is valid, but requires more privileges"
  Actor.findOneAndUpdate({ _id: req.params.actorId }, req.body, { new: true }, function (err, actor) {
    if (String(authenticatedUserId) === String(actor)) {
      if (err) {
        res.send(err);
      }
      else {
        res.json(actor);
      }
    }else{
      res.status(403); //an access token is valid, but requires more privileges
      res.json({ message: 'You only can modify your personal data', error: err });
    }
  });
};

exports.validate_an_actor = function (req, res) {
  //Check that the user is an Administrator and if not: res.status(403); "an access token is valid, but requires more privileges"
  console.log("Validating an actor with id: " + req.params.actorId)
  Actor.findOneAndUpdate({ _id: req.params.actorId }, { $set: { "validated": "true" } }, { new: true }, function (err, actor) {
    if (err) {
      res.send(err);
    }
    else {
      res.json(actor);
    }
  });
};

exports.update_a_verified_actor = function (req, res) {
  //Explorer and Managers can update theirselves, administrators can update any actor
  console.log('Starting to update the actor...');
  Actor.findById(req.params.actorId, async function (err, actor) {
    if (err) {
      res.send(err);
    }
    else {
      console.log('actor: ' + actor);
      var idToken = req.headers['idtoken'];//WE NEED the FireBase custom token in the req.header['idToken']... it is created by FireBase!!
      if (actor.role.includes('EXPLORER') || actor.role.includes('MANAGER')) {
        var authenticatedUserId = await authController.getUserId(idToken);
        if (authenticatedUserId == req.params.actorId) {
          Actor.findOneAndUpdate({ _id: req.params.actorId }, req.body, { new: true }, function (err, actor) {
            if (err) {
              res.send(err);
            }
            else {
              res.json(actor);
            }
          });
        } else {
          res.status(403); //Auth error
          res.send('The Actor is trying to update an Actor that is not himself!');
        }
      } else if (actor.role.includes('ADMINISTRATOR')) {
        Actor.findOneAndUpdate({ _id: req.params.actorId }, req.body, { new: true }, function (err, actor) {
          if (err) {
            res.send(err);
          }
          else {
            res.json(actor);
          }
        });
      } else {
        res.status(405); //Not allowed
        res.send('The Actor has unidentified roles');
      }
    }
  });
};

exports.delete_an_actor = function (req, res) {
  Actor.deleteOne({ _id: req.params.actorId }, function (err, actor) {
    if (err) {
      console.log(err)
      res.send(err);
    }
    else {
      res.json({ message: 'Actor successfully deleted' });
    }
  });
};