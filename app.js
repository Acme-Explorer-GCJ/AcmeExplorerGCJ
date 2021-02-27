var express = require('express'),
  app = express(),
  port = process.env.PORT || 8080,
  mongoose = require('mongoose'),
  Actor = require('./api/models/actorModel'),
  Trip = require('./api/models/tripModel'),
  ApplyTrip = require('./api/models/applyTripModel'),
  bodyParser = require('body-parser');

// MongoDB URI building
//var mongoDBHostname = process.env.mongoDBHostname || "localhost";
//var mongoDBPort = process.env.mongoDBPort || "27017";
//var mongoDBName = process.env.mongoDBName || "ACME-Market";
//var mongoDBURI = "mongodb://" + mongoDBHostname + ":" + mongoDBPort + "/" + mongoDBName;
//¿Cómo podemos hacer la conexión con el puerto si no lo tenemos?
var mongoDBURI = "mongodb+srv://admin:BACKacme1@cluster0.ugodt.mongodb.net/acme_explorer?retryWrites=true&w=majority"


mongoose.connect(mongoDBURI, {
    reconnectTries: 10,
    reconnectInterval: 500,
    poolSize: 10, // Up to 10 sockets
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // skip trying IPv6
    useNewUrlParser: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routesActors = require('./api/routes/actorRoutes');
var routesTrip = require('./api/routes/tripRoutes'); 
var routesApplyTrip = require('./api/routes/applyTripRoutes');


routesActors(app);
routesTrip(app);
routesApplyTrip(app);


console.log("Connecting DB to: " + mongoDBURI);
mongoose.connection.on("open", function (err, conn) {
    app.listen(port, function () {
        console.log('ACME-Explorer RESTful API server started on: ' + port);
    });
});

mongoose.connection.on("error", function (err, conn) {
    console.error("DB init error " + err);
});