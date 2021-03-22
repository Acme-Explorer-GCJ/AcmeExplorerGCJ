var express = require('express'),
  app = express(),
  port = process.env.PORT || 8080,
  mongoose = require('mongoose'),
  Actor = require('./api/models/actorModel'),
  Trip = require('./api/models/tripModel'),
  ApplyTrip = require('./api/models/applyTripModel'),
  bodyParser = require('body-parser');
  admin = require('firebase-admin'),
  serviceAccount = require("./acme-explorer-96392-firebase-adminsdk-utn5s-1b91b25e0d");
  https = require("https"),
  fs = require("fs");

  const keys = {
    key: fs.readFileSync('./keys/server.key'),
    cert: fs.readFileSync('./keys/server.cert')
  };
// MongoDB URI building

var mongoDBUser = process.env.mongoDBUser || "yulipala";
var mongoDBPass = process.env.mongoDBPass || "jZAb9EXS0yCxX9Ks";
var mongoDBCredentials = (mongoDBUser && mongoDBPass) ? mongoDBUser + ":" + mongoDBPass + "@" : "";

var mongoDBHostname = process.env.mongoDBHostname || "localhost";
var mongoDBPort = process.env.mongoDBPort || "27017";
var mongoDBName = process.env.mongoDBName || "ACME-Explorer";

var mongoDBURI = "mongodb://" + mongoDBHostname + ":" + mongoDBPort + "/" + mongoDBName;

mongoose.connect(mongoDBURI, {
    // reconnectTries: 10,
    // reconnectInterval: 500,
    poolSize: 10, // Up to 10 sockets
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // skip trying IPv6
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, idToken" //ojo, que si metemos un parametro propio por la cabecera hay que declararlo aquí para que no de el error CORS
    );
    //res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    next();
});

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://acme-explorer-96392-default-rtdb.firebaseio.com/"
  });


var routesActors    = require('./api/routes/actorRoutes');
var routesTrip      = require('./api/routes/tripRoutes'); 
var routesApplyTrip = require('./api/routes/applyTripRoutes');
var routesStorage   = require('./api/routes/storageRoutes');
var routesLogin   = require('./api/routes/loginRoutes');


routesActors(app);
routesTrip(app);
routesApplyTrip(app);
routesStorage(app);
routesLogin(app);



console.log("Connecting DB to: " + mongoDBURI);
mongoose.connection.on("open", function (err, conn) {
    /*app.listen(port, function () {
        console.log('ACME-Explorer RESTful API server started on: ' + port);
    });*/
    https.createServer(keys, app).listen(port);
    console.log('ACME-Explorer RESTful API server started with HTTPS on: ' + port);
});

mongoose.connection.on("error", function (err, conn) {
    console.error("DB init error " + err);
});

module.exports = app;