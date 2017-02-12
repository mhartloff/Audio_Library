
// Library for audio effects playable on a website.
// Based on: https://www.html5rocks.com/en/tutorials/webaudio/intro/

function Sound(source) {
	this.source = source;
	this.delay = 0.0;		// in seconds
}

Sound.prototype.play = function () {

	var context = WebAudio.context;
	
	var source = new AudioBufferSourceNode(context, { buffer: this.source.buffer });
	source.connect(context.destination);       // connect the source to the context's destination (the speakers)
	source.start(context.currentTime + this.delay);
}


// SoundSource contains the actual data of the sound loaded from the files.
function SoundSource(url, alias)  {
    this.url = url;
    this.alias = alias;
    this.response = null;
    this.buffer = null;     // AudioBuffer object
    this.loaded = false;
    
}

SoundSource.prototype.load = function () {
    if (!this.url)
        console.log("No URL defined in Source object");

    var self = this;

    var request = new XMLHttpRequest();
    request.open('GET', this.url, true /* async */);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        self.response = request.response;
        self.decode();
    };
    request.onerror = function (msg) {
        console.log(msg);
    };
    request.send();
}

SoundSource.prototype.decode = function () {
    if (this.response == null)
        return;

    var self = this;
    WebAudio.context.decodeAudioData(self.response,
        function (buffer /* AudioBuffer */) {   // Success
            delete self.response;
            self.response = null;
            self.buffer = buffer;
            self.loaded = true;
        },
        function (e) {     // Error
            console.log("Error decoding audio file: " + self.alias);
        });
}

// Optionally pass a Canvas2D object to display the channel information.
SoundSource.prototype.play = function () {

   //if (!this.loaded) {
   //   console.log("SoundSource " + this.alias + "not yet loaded.");
   //   return;
   //}
	  
   //var context = WebAudio.context;

   //var delay = Number(document.getElementById("delay").value);

   //var source = new AudioBufferSourceNode(context, { buffer: this.buffer });
   //source.connect(context.destination);       // connect the source to the context's destination (the speakers)
    
   ////var source2 = new AudioBufferSourceNode(context, { buffer: this.buffer });
   ////source2.connect(context.destination);

   //if (canvas) {
   //   canvas.setToChannelData(this.buffer.getChannelData(0 /* channel number */));
   //}

   //source.start(context.currentTime);         // play the source now
   //source2.start(context.currentTime + delay);    
}

SoundSource.prototype.displayInfo = function (domElement) {

	var msg = "Sample Rate: " + this.buffer.sampleRate +
				 " Channels: " + this.buffer.numberOfChannels +
				// " Length: " + this.buffer.length +
				 " Duration: " + this.buffer.duration.toFixed(2) + " sec";
	if (domElement)
		domElement.innerHTML = msg;
	else
		console.log(msg);

}

SoundSource.prototype.drawOnCanvas = function (canvas) {

	if (!canvas)
		return;

	// clear the canvas
	var context = canvas.context;
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);

	// Draw the channel data
	// The center line, dividing the two channels.
	var y = canvas.height / 2;
	context.strokeStyle = "black";
	context.beginPath();
	context.moveTo(0, y);
	context.lineTo(canvas.width, y);
	context.stroke();

	// The center lines of each channel
	context.strokeStyle = "#BBBBFF";
	context.beginPath();
	context.moveTo(0, canvas.height * 0.25);
	context.lineTo(canvas.width, canvas.height * 0.25);
	context.moveTo(0, canvas.height * 0.75);
	context.lineTo(canvas.width, canvas.height * 0.75);
	context.stroke();
		
	var numChannels = this.buffer.numberOfChannels;
	var samplesPerPixel = 2;
	for (var i = 0; i < numChannels; i++) {
		if (i > 1)
			break;		// no graphical support for greater than 2 channels
	
		var channelData = this.buffer.getChannelData(i /* channel number */)
		var middle = i == 0 ? canvas.height * 0.25 : canvas.height * 0.75;
		var height = canvas.height * 0.45;
				
		// Draw the waveform as a red line.
		context.strokeStyle = "red";
		context.beginPath();
		context.moveTo(0, middle);
		for (var j = 0; j < canvas.width; j++) {
			var nextSample = j * samplesPerPixel;
			if (nextSample > channelData.length)
				break;
			// Each piece of channel data is between -1 and 1.
			context.lineTo(j, middle - (channelData[nextSample] * height));
		}
		context.stroke();
	}
}


var WebAudio = 
{
   context: null,
   soundSourceMap: [],           // Map of sound aliases to SoundSource objects.

   init: function () {

      if (!window.AudioContext) {
         if (window.webkitAudioContext) {
               window.AudioContext = window.webkitAudioContext;
               console.log("Using webkit audio context");
         }
         else {
               alert("Web Audio API is not supported in this browser");
         }
      }
      this.context = new AudioContext();
   },

   load: function (url, alias) {
        
      var newSource = new SoundSource(url, alias);
      this.soundSourceMap[alias] = newSource;
      newSource.load();
   },

   get: function (alias) {
   	var source = this.soundSourceMap[alias];
   	if (!source)
   		console.log("Sound alias '" + alias + "' does not exist");
   	return source;
   },

   // Play the sound with the passed alias.  
   play: function (alias) {

   	var source = this.get(alias);
   	if (source)
   		source.play();
   },

   drawOnCanvas: function (alias, canvas) {
   	var source = this.get(alias);
   	if (source)
   		source.drawOnCanvas();
   }
	

}