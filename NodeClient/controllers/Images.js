'use strict';

var utils = require('../utils/writer.js');
var fs = require('fs');
var Images = require('../service/ImageService.js');

module.exports.addImage = function addImage (req, res, next) {
  Images.addImage(req.params.taskId, req.file, req.user)
    .then(function (response) {
        utils.writeJson(res, response, 201);
    })
    .catch(function (response) {
      if(response == 403){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the task' }], }, 403);
      }
      else if (response == 404){
          utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The task does not exist.' }], }, 404);
      }
      else if(response == 415){
        utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': 'Unsupported Media Type'}],}, 415);
      } 
      else {
        utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
      }
    });
};

module.exports.getSingleImage = function getSingleImage (req, res, next) {

  Images.getSingleImage(req.params.imageId, req.params.taskId, req.user)
    .then(function (response) {
       utils.writeJson(res, response);
    })
    .catch(function (response) {
      if(response == 403){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner or assignee of the task' }], }, 403);
      }
      else if (response == 404){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The resource does not exist.' }], }, 404);
      }
      else {
        utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
      }
    });
};


module.exports.getSingleImageFile = function getSingleImageFile (req, res, next) {
  
  var mediaType = req.get('Accept');
  if(mediaType != 'image/png' && mediaType != 'image/jpg' && mediaType != 'image/gif'){
    utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': 'Media Type not supported'}],}, 415);
    return;
  }
  var imageType = mediaType.substring(mediaType.lastIndexOf("/") );
  var imageType = imageType.replace('/', '');

  Images.getSingleImageFile(req.params.imageId, imageType, req.params.taskId, req.user)
    .then(function (response) {
      res.sendFile(response, {root: './uploads'});
    })
    .catch(function (response) {
      if(response == 403){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the task' }], }, 403);
      }
      else if (response == 404){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The resource does not exist.' }], }, 404);
      }
      else {
        utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
      }
    });
};


module.exports.deleteSingleImage = function deleteSingleImage (req, res, next) {
  Images.deleteSingleImage(req.params.taskId, req.params.imageId, req.user)
    .then(function (response) {
       utils.writeJson(res, null, 204);
    })
    .catch(function (response) {
      if(response == 403){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the task' }], }, 403);
      }
      else if (response == 404){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The resource does not exist.' }], }, 404);
      }
      else {
        utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
      }
    });
};



