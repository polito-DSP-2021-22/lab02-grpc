'use strict';

var utils = require('../utils/writer.js');
var Assignments = require('../service/AssignmentsService');

module.exports.assignAutomatically = function assignAutomatically (req, res, next) {
  Assignments.assignBalanced(req.user)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
    });
};

module.exports.assignTaskToUser = function assignTaskToUser (req, res, next) {
  Assignments.assignTaskToUser(req.body.id, req.params.taskId, req.user)
    .then(function (response) {
        if(response == 403){
          utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the task' }], }, 403);
        }
        else if (response == 404){
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The task does not exist.' }], }, 404);
        }
        else {
            utils.writeJson(res, response, 204);
        }
    })
    .catch(function (response) {
      utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
    });
};

module.exports.getUsersAssigned = function getUsersAssigned (req, res, next) {
  Assignments.getUsersAssigned(req.params.taskId, req.user)
    .then(function (response) {
      if(response == 403){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the task' }], }, 403);
      }
      else if (response == 404){
          utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The task does not exist.' }], }, 404);
      }
      else {
          utils.writeJson(res, response);
      }
    })
    .catch(function (response) {
      utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
    });
};

module.exports.removeUser = function removeUser (req, res, next) {
  Assignments.removeUser(req.params.taskId, req.params.userId, req.user)
    .then(function (response) {
      if(response == 403){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the task' }], }, 403);
      }
      else if (response == 404){
          utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The task does not exist.' }], }, 404);
      }
      else {
          utils.writeJson(res, response, 204);
      }
    })
    .catch(function (response) {
      utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
    });
};
