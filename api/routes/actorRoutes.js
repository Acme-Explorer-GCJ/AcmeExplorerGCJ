'use strict';
module.exports = function(app) {
  var actors = require('../controllers/actorController');
  var authController = require('../controllers/authController');

  /**
   * Get an actor who is manager (any role)
   *    Required role: Administrator
   * Post an actor 
   *    RequiredRoles: None
   *    validated if explorer and not validated if manager
	 *
	 * @section actors
	 * @type get post
	 * @url /v1/actors
   * @param {string} role (manager|administrator|explorer) 
  */
  app.route('/v1/actors')
	  .get(actors.list_all_actors)
	  .post(actors.create_an_actor);

  /**
   * Put an actor
   *    RequiredRoles: to be the proper actor
   * Get an actor
   *    RequiredRoles: to be the proper actor or an Administrator
	 *
	 * @section actors
	 * @type get put
	 * @url /v1/actors/:actorId
  */  
  app.route('/v1/actors/:actorId')
    .get(actors.read_an_actor)
	  .put(actors.update_an_actor)
    .delete(actors.delete_an_actor);

  /**
	 * Put to Validate a manager by actorId
   *    RequiredRole: Administrator
	 *
	 * @section actors
	 * @type put
	 * @url /v1/actors/:actorId/validate
	 * @param {string} actorId
	*/
  app.route('/v2/actors/:actorId')
  .get(actors.read_an_actor)
  .put(authController.verifyUser(["ADMINISTRATOR",
                                  "MANAGER",
                                  "EXPLORER"]),actors.update_a_verified_actor) //Explorer y manager no pueden modificar la info de otro explorer/manager
      
 
   /**
    * Put to Validate a manager by actorId
    *    RequiredRole: Administrator
    *
    * @section actors
    * @type put
    * @url /v1/actors/:actorId/validate
    * @param {string} actorId
   */
   app.route('/v1/actors/:actorId/validate')
   .put(actors.validate_an_actor)
 };