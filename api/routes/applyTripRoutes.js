'use strict';
module.exports = function(app) {
  var applications = require('../controllers/applyTripController');
  
  /**
   * Manage catalogue of applications: 
   * Post applications
   *    RequiredRoles: Administrator
   * Get applications
   *    RequiredRoles: Administrator
   *
   * @section applications
   * @type put 
   * @url /v1/applications
  */
  app.route('/v1/applications')
	  .get(applications.list_all_applications)
	  .post(applications.create_application);
    
  /**
   * get results from a search of applications groupBy title
   *    RequiredRoles: None
   *
   * @section applications
   * @type get
   * @url /v1/applications/search
   * @param {string} sortedBy (title)
  */
    app.route('/v1/applications/search')
    .get(applications.search_application);
	
  /**
   * Read, update or delete an application: 
   * Delete an application
   *    RequiredRoles: Administrator
   * Get an application
   *    RequiredRoles: Administrator
   *
   * @section applications
   * @type get put delete
   * @url /v1/applications/:applicationId
  */
   app.route('/v1/applications/:applicationId')
    .get(applications.read_application) 
    .put(applications.update_application) 
    .delete(applications.delete_application);
};
