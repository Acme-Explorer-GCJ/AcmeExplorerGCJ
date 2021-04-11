'use strict'
module.exports = function(app){
    var finder = require('../controllers/finderController'),
     authController = require('../controllers/authController');
    
     /**
     * Get the actor's finder.
     *     Required role: Explorer
     * 
     * Update the finder.
     *     Required role: Explorer.
     * 
     * @section finders
     * @type get, put
     * @url /v1/finders/:actorId
     */

    app.route('/v1/finders')
        .get(authController.verifyUser(["EXPLORER"]), finder.read_a_finder)
        .post(authController.verifyUser(["EXPLORER"]), finder.create_a_finder)
        .put(authController.verifyUser(["EXPLORER"]), finder.update_a_finder)
        .delete(authController.verifyUser(["EXPLORER"]), finder.delete_a_finder);
}