'use strict';
module.exports = function(app) {
  var trips = require('../controllers/tripController'),
  authController = require('../controllers/authController');

  /**
   * Manage catalogue of trips:
   * Post trips
   *    RequiredRoles: Administrator
   * Get trips
   *    RequiredRoles: Administrator
   *
   * @section trips
   * @type put 
   * @url /v1/trips
   */
  app.route('/v1/trips')
  .get(trips.list_all_trips)
  .post(authController.verifyUser(["MANAGER"]),trips.create_a_trip);

  /**
   * Manage catalogue of managers trips:
   * Get trips
   *    RequiredRoles: Manager
   *
   * @section trips
   * @type get 
   * @url /v1/mytrips
   */
  app.route('/v1/mytrips')
  .get(authController.verifyUser(["MANAGER"]),trips.list_my_trips);

  /**
   * get results from a search of applications groupBy title
   *    RequiredRoles: None
   *
   * @section trips
   * @type get
   * @url /v1/trips/search
   * @param {string} sortedBy (title)
  */
   app.route('/v1/trips/search')
    .get(trips.search_trip);
  
  /**
   * Read, update or delete a trip: 
   * Delete a trip
   *    RequiredRoles: Administrator
   * Get a trip
   *    RequiredRoles: Administrator
   *
   * @section trips
   * @type get put delete
   * @url /v1/trips/:tripId
  */
  app.route('/v1/trips/:tripId')
    .get(trips.read_a_trip)
	  .put(authController.verifyUser(["MANAGER"]),trips.update_a_trip)
    .delete(authController.verifyUser(["MANAGER"]),trips.delete_a_trip);

  // var trips = require('../controllers/tripController');

  /**
   * Manage catalogue of stages:
   * Post stages
   *    RequiredRoles: Administrator
   * Get stages
   *    RequiredRoles: Administrator
   *
   * @section stages
   * @type put 
   * @url /v1/stages
   */
  app.route('/v1/stages')
  .get(trips.list_all_stages)
  .post(trips.create_a_stage)
  .delete(trips.delete_a_stage);
  
  /**
   * get results from a search of applications groupBy title
   *    RequiredRoles: None
   *
   * @section stages
   * @type get
   * @url /v1/stages/search
   * @param {string} sortedBy (title)
  */
    app.route('/v1/stages/search')
    .get(trips.search_stage);
  
  /**
   * Read, update or delete a trip: 
   * Delete a stage
   *    RequiredRoles: Administrator
   * Get a stage
   *    RequiredRoles: Administrator
   *
   * @section stages
   * @type get put delete
   * @url /v1/trips/:stageId
  */

   app.route('/v1/stages/:stageId')
   .get(trips.read_a_stage)
   .put(trips.update_a_stage)
   .delete(trips.delete_a_stage);

};
