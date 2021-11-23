'use strict';

var utils = require('../utils/writer.js');
var constants = require('../utils/constants.js');
var Tasks = require('../service/TasksService.js');
var Assignments = require('../service/AssignmentsService.js');

module.exports.addTask = function addTask(req, res, next) {
    var task = req.body;
    var owner = req.user;
    Tasks.addTask(task, owner)
        .then(function(response) {
            utils.writeJson(res, response, 201);
        })
        .catch(function(response) {
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
        });
};

module.exports.deleteTask = function deleteTask(req, res, next) {
    Tasks.deleteTask(req.params.taskId, req.user)
        .then(function(response) {
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
        .catch(function(response) {
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
        });
};


module.exports.updateSingleTask = function updateSingleTask(req, res, next) {
    Tasks.updateSingleTask(req.body, req.params.taskId, req.user)
        .then(function(response) {
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
        .catch(function(response) {
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
        });
};

module.exports.getSingleTask = function getSingleTask(req, res, next) {
    Tasks.getSingleTask(req.params.taskId, req.user)
        .then(function(response) {
            if(response == 403){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner or an assignee of the task' }], }, 403);
            }
            else if (response == 404){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The task does not exist.' }], }, 404);
            }
            else {
                utils.writeJson(res, response);
            }
        })
        .catch(function(response) {
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
        });
};


module.exports.getPublicTasks = function getPublicTasks(req, res, next) {
    var numOfTasks = 0;
    var next=0;
    Tasks.getPublicTasksTotal()
        .then(function(response) {
            numOfTasks = response;
        });

    Tasks.getPublicTasks(req)
        .then(function(response) {
            if (req.query.pageNo == null) var pageNo = 1;
            else var pageNo = req.query.pageNo;
            var totalPage=Math.ceil(numOfTasks / constants.OFFSET);
            next = Number(pageNo) + 1;

            if (pageNo>totalPage) {
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The page does not exist." }], }, 404);
            } else if (pageNo == totalPage) {
                utils.writeJson(res, {
                    totalPages: totalPage,
                    currentPage: pageNo,
                    totalItems: numOfTasks,
                    tasks: response
                });
            } else {
                utils.writeJson(res, {
                    totalPages: totalPage,
                    currentPage: pageNo,
                    totalItems: numOfTasks,
                    tasks: response,
                    next: "/api/tasks/public?pageNo=" + next
                });
            }
        })
        .catch(function(response) {
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
        });
};


module.exports.getOwnedTasks = function getUserTasks(req, res, next) {
    
    if(req.user != req.params.userId){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not characterized by the specified userId.' }], }, 403);
        return;
    }

    var numOfTasks = 0;
    var next=0;

    var numOfTasks;
    Tasks.getOwnedTasksTotal(req)
        .then(function(response) {
            numOfTasks = response;
        });

    Tasks.getOwnedTasks(req)
        .then(function(response) {
            if (req.query.pageNo == null) var pageNo = 1;
            else var pageNo = req.query.pageNo;
            var totalPage=Math.ceil(numOfTasks / constants.OFFSET);
            
            next = Number(pageNo) + 1;

            if (pageNo>totalPage) {
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The page does not exist." }], }, 404);
            }   else if (pageNo == totalPage) {
                utils.writeJson(res, {
                    totalPages: totalPage,
                    currentPage: pageNo,
                    totalItems: numOfTasks,
                    tasks: response
                });
            } else {
                var nextLink = "/api/users/" + req.params.userId + "/tasks/created?pageNo=" + next;
                utils.writeJson(res, {
                    totalPages: totalPage,
                    currentPage: pageNo,
                    totalItems: numOfTasks,
                    tasks: response,
                    next: nextLink
                });
            }
        })
};


module.exports.getAssignedTasks = function getAssignedTasks(req, res, next) {
    
    if(req.user != req.params.userId){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not characterized by the specified userId.' }], }, 403);
        return;
    }

    var numOfTasks = 0;
    var next=0;

    var numOfTasks;
    Tasks.getAssignedTasksTotal(req)
        .then(function(response) {
            numOfTasks = response;
        });

    Tasks.getAssignedTasks(req)
        .then(function(response) {
            if (req.query.pageNo == null) var pageNo = 1;
            else var pageNo = req.query.pageNo;
            var totalPage=Math.ceil(numOfTasks / constants.OFFSET);
            
            next = Number(pageNo) + 1;

            if (pageNo>totalPage) {
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The page does not exist." }], }, 404);
            }   else if (pageNo == totalPage) {
                utils.writeJson(res, {
                    totalPages: totalPage,
                    currentPage: pageNo,
                    totalItems: numOfTasks,
                    tasks: response
                });
            } else {
                var nextLink = "/api/users/" + req.params.userId + "/tasks/assigned?pageNo=" + next;
                utils.writeJson(res, {
                    totalPages: totalPage,
                    currentPage: pageNo,
                    totalItems: numOfTasks,
                    tasks: response,
                    next: nextLink
                });
            }
        })
};


module.exports.completeTask = function completeTask(req, res, next) {
    Tasks.completeTask(req.params.taskId, req.user)
        .then(function(response) {
            if(response == 403){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not an assignee of the task' }], }, 403);
            }
            else if (response == 404){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The task does not exist.' }], }, 404);
            }
            else {
                utils.writeJson(res, response, 204);
            }
        })
        .catch(function(response) {
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
        });
};