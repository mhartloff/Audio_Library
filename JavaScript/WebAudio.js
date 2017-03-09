
// Library for audio effects playable on a website.
// Thanks to: https://www.html5rocks.com/en/tutorials/webaudio/intro/

// --- SOUND SOURCE ------------------------------------------------------------------------- 

// SoundSource contains the actual data of the sound loaded from the files.  To play it, create a Sound object from it.
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
            self.response = null;

        		// Change all sounds to be 2 channels with the same information in each.  This will allow us to manipulate each
				// channel (L/R) individually.
            var origData = buffer.getChannelData(0);
            var newBuffer = WebAudio.context.createBuffer(2 /* num channels */, origData.length, buffer.sampleRate);	// 2 channel buffer from mono sound
            var newData = newBuffer.getChannelData(0);
            newData.set(origData);
				
            newData = newBuffer.getChannelData(1);
            newData.set(origData);
            
            self.buffer = newBuffer;
            self.loaded = true;
        },
        function (e) {     // Error
            console.log("Error decoding audio file: " + self.alias);
        });
}


SoundSource.prototype.displayInfo = function (domElement) {

	var msg = "Alias: " + this.alias + 
				 " Sample Rate: " + this.buffer.sampleRate +
				 " Channels: " + this.buffer.numberOfChannels +
				// " Length: " + this.buffer.length +
				 " Duration: " + this.buffer.duration.toFixed(2) + " sec";
	if (domElement)
		domElement.innerHTML = msg;
	else
		console.log(msg);

}

SoundSource.prototype.drawWaveOnCanvas = function (canvas) {

	if (!canvas)
		return;

	// clear the canvas
	var context = canvas.context;
	canvas.clear("white");
	
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
	var samplesPerPixel = 100;
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

// -- WEB AUDIO -------------------------------------------------------------------------------

var WebAudio = 
{
   context: null,
   soundSourceMap: [],        // Map of sound aliases to SoundSource objects.
	
	gainNode: null,				// Node that adjusts the universal volume
	outputNode: null,				// Node attached to the speakers.  Attach this to the end of all node graphs of sounds.
   
   init: function () {

      if (!window.AudioContext) {
         if (window.webkitAudioContext) {
               window.AudioContext = window.webkitAudioContext;
               console.log("Using webkit audio context");			// Safari considers the audio api as webkit (ie. experimental)
         }
         else {
               alert("Web Audio API is not supported in this browser");
         }
      }

      this.context = new AudioContext();
				
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
      this.outputNode = this.gainNode;
		
		var self = this;
		DeviceMotion.updateCallback = function () { self.onMotionUpdate(); }
   },

   setSceneCanvas: function (canvasElement) {
   	this.sceneCanvas = new SceneCanvas(canvasElement);
   },

	
	// Load a sound file such as a .wav or .mp3.  Assign an alias for easy future reference.
   loadSoundSource: function (url, alias) {
      var newSource = new SoundSource(url, alias);
      this.soundSourceMap[alias] = newSource;
      newSource.load();
   },

   getSoundSource: function (alias) {
   	var source = this.soundSourceMap[alias];
   	if (!source)
   		console.log("Sound alias '" + alias + "' does not exist");
   	return source;
   },

	// Generally gain should be between 0 and 1.  If it is higher than 1 the sounds risk being muffled as the waves are multiplied to their maximum aplitude.
   setGain: function (value) {
   	this.gainNode.gain.value = Number(value);
   },

   drawWaveOnCanvas: function (alias, canvas) {
   	var source = this.get(alias);
   	if (source)
   		source.drawOnCanvas();
   }

}

