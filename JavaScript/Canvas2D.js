

function Canvas2D(canvasElement) {

    this.domElement = canvasElement;
    this.width = canvasElement.width;
    this.height = canvasElement.height;
    this.context = canvasElement.getContext('2d');

    this.audioStart = null;
    this.channelData = null;
    
    var self = this;
    //setInterval(function () { self.redraw(); }, 100);
}

Canvas2D.prototype.redraw = function()
{
    // clear the canvas
    var context = this.context;
    context.fillStyle = "white";
    context.fillRect(0, 0, this.width, this.height);

    // Draw the channel data
    var samplesPerPixel = 16;
    if (this.channelData) {

        var middle = this.height / 2;
        
        context.strokeStyle = "black";
        context.beginPath();
        context.moveTo(0, middle);
        context.lineTo(this.width, middle);
        context.stroke();

        context.strokeStyle = "red";
        context.beginPath();
        context.moveTo(0, middle);
        for (var i = 0; i < this.width; i++) {
            var nextSample = i * samplesPerPixel;
            if (nextSample > this.channelData.length)
                break;
            context.lineTo(i, middle - (this.channelData[nextSample] * middle));
        }
        context.stroke();
    }

}

//Canvas2D.prototype.startSoundDisplay = function () {
//   this.audioStart = Date.now();

//}

Canvas2D.prototype.setToChannelData = function (channelData) {
    this.channelData = channelData;
    this.redraw();
}