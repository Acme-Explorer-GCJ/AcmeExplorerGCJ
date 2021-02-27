'use strict';
module.exports = function(app) {
  var applyTrip = require('../controllers/applyTripController');
  
  app.route('/applyTrips')
	  .get(applyTrip.list_all_applications)
	  .post(applyTrip.create_an_application);
	
  app.route('/applyTrip/:applyTripId')
    .get(applyTrip.read_an_application) 
    .put(applyTrip.update_an_application) 
    .delete(applyTrip.delete_an_application);
};
