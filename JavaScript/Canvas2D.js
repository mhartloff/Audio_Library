

function Canvas2D(canvasElement) {

    this.domElement = canvasElement;
    this.width = canvasElement.width;
    this.height = canvasElement.height;
    this.context = canvasElement.getContext('2d');

  
    
    var self = this;
    //setInterval(function () { self.redraw(); }, 100);
}

Canvas2D.prototype.redraw = function()
{
    // clear the canvas
    var context = this.context;
    context.fillStyle = "white";
    context.fillRect(0, 0, this.width, this.height);

    
}

Canvas2D.prototype.setToChannelData = function (channelData) {
    
}