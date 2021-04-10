'use strict';
module.exports = function(app) {
  var dashboard = require('../controllers/dashboardController'),
  authController = require('../controllers/authController');


  	/*** V2 ***/
	/**
	 * Get a list of all indicators or post a new computation period for rebuilding
	 * RequiredRole: Administrator
	 * @section dashboard
	 * @type get post
	 * @url /v2/dashboard
	 * @param [string] rebuildPeriod
	 * 
	*/
	app.route('/v2/dashboard')
	.get(authController.verifyUser(["ADMINISTRATOR"]),dashboard.list_all_indicators)

	/**
	 * Get a list of last computed indicator
	 * RequiredRole: Administrator
	 * @section dashboard
	 * @type get
	 * @url /v2/dashboard/latest
	 * 
	*/
	app.route('/v2/dashboard/latest')
	.get(authController.verifyUser(["ADMINISTRATOR"]),dashboard.last_indicator);
};
