class Image{    
    constructor(imageId, taskId, name) {

        this.id = imageId;
        this.name = name;
        this.fileURI =  "/api/tasks/" + taskId + '/images/' + imageId + '/imageFile';
        this.self =  "/api/tasks/" + taskId + '/images/' + imageId;
    }
}

module.exports = Image;
