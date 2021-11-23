'use strict';

var path = require('path');
var http = require('http');
var fs = require("fs");
var passport = require('passport');
var { Validator, ValidationError } = require('express-json-validator-middleware');

var oas3Tools = require('oas3-tools');
var serverPort = 3000;

var taskController = require(path.join(__dirname, 'controllers/Tasks'));
var userController = require(path.join(__dirname, 'controllers/Users'));
var assignmentController = require(path.join(__dirname, 'controllers/Assignments'));
var imageController = require(path.join(__dirname, 'controllers/Images'));

var storage = require(path.join(__dirname, './components/storage'));

// swaggerRouter configuration
var options = {
    controllers: path.join(__dirname, './controllers')
};
var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
expressAppConfig.addValidator();
var app = expressAppConfig.getApp();

// Set validator middleware
var taskSchema = JSON.parse(fs.readFileSync(path.join('.', 'json_schemas', 'task_schema.json')).toString());
var userSchema = JSON.parse(fs.readFileSync(path.join('.', 'json_schemas', 'user_schema.json')).toString());
var validator = new Validator({ allErrors: true });
validator.ajv.addSchema([userSchema, taskSchema]);
var validate = validator.validate;

//Set authentication middleware
app.use(passport.initialize());

var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies)
    {
        token = req.cookies['jwt'];
    }
    return token;
  };
  
var JwtStrategy = require('passport-jwt').Strategy;
var opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    return done(null, jwt_payload.user);
   })
);


//route methods

app.post('/api/users/authenticator', userController.authenticateUser);
app.get('/api/tasks/public', taskController.getPublicTasks);
app.post('/api/tasks', passport.authenticate('jwt', { session: false }), validate({ body: taskSchema }), taskController.addTask);
app.get('/api/tasks/:taskId', passport.authenticate('jwt', { session: false }), taskController.getSingleTask);
app.delete('/api/tasks/:taskId', passport.authenticate('jwt', { session: false }), taskController.deleteTask);
app.put('/api/tasks/:taskId', passport.authenticate('jwt', { session: false }), validate({ body: taskSchema }), taskController.updateSingleTask);
app.put('/api/tasks/:taskId/completion', passport.authenticate('jwt', { session: false }), taskController.completeTask);
app.post('/api/tasks/:taskId/assignees', passport.authenticate('jwt', { session: false }), validate({ body: userSchema }), assignmentController.assignTaskToUser);
app.get('/api/tasks/:taskId/assignees', passport.authenticate('jwt', { session: false }), assignmentController.getUsersAssigned);
app.delete('/api/tasks/:taskId/assignees/:userId', passport.authenticate('jwt', { session: false }), assignmentController.removeUser);
app.post('/api/tasks/assignments', passport.authenticate('jwt', { session: false }), assignmentController.assignAutomatically);
app.get('/api/users', passport.authenticate('jwt', { session: false }), userController.getUsers);
app.get('/api/users/:userId', passport.authenticate('jwt', { session: false }), userController.getSingleUser);
app.get('/api/users/:userId/tasks/created', passport.authenticate('jwt', { session: false }), taskController.getOwnedTasks);
app.get('/api/users/:userId/tasks/assigned', passport.authenticate('jwt', { session: false }), taskController.getAssignedTasks);
app.post('/api/tasks/:taskId/images', passport.authenticate('jwt', { session: false }), storage.uploadImg, imageController.addImage);
app.get('/api/tasks/:taskId/images/:imageId', passport.authenticate('jwt', { session: false }), imageController.getSingleImage);
app.delete('/api/tasks/:taskId/images/:imageId', passport.authenticate('jwt', { session: false }), imageController.deleteSingleImage);
app.get('/api/tasks/:taskId/images/:imageId/imageFile', passport.authenticate('jwt', { session: false }), imageController.getSingleImageFile);

// Error handlers for validation and authentication errors

app.use(function(err, req, res, next) {
    if (err instanceof ValidationError) {
        res.status(400).send(err);
    } else next(err);
});

app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        var authErrorObj = { errors: [{ 'param': 'Server', 'msg': 'Authorization error' }] };
        res.status(401).json(authErrorObj);
    } else next(err);
});


// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function() {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});