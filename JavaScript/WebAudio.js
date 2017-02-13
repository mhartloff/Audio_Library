
// Library for audio effects playable on a website.
// Thanks to: https://www.html5rocks.com/en/tutorials/webaudio/intro/

// --- SOUND --------------------------------------------------------------------------------

function Sound(source) {
	this.source = source;
	this.delay = 0.0;		// in seconds
	this.temp = false;
}

Sound.prototype.play = function () {

	var context = WebAudio.context;
	
	var source = new AudioBufferSourceNode(context, { buffer: this.source.buffer });
		
	// Run it through the universal gain node
	var gainNode = WebAudio.gainNode;
	source.connect(WebAudio.gainNode);
	var lastNode = gainNode;

	if (!this.temp) {
		var panNode = WebAudio.panNode;
		gainNode.connect(WebAudio.panNode);
		lastNode = panNode;
	}
	
	lastNode.connect(context.destination);       // connect the source to the context's destination (the speakers)
	source.start(context.currentTime + this.delay);
}


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
            delete self.response;
            self.response = null;
            self.buffer = buffer;
            self.loaded = true;
        },
        function (e) {     // Error
            console.log("Error decoding audio file: " + self.alias);
        });
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

// -- WEB AUDIO -------------------------------------------------------------------------------

var WebAudio = 
{
   context: null,
   soundSourceMap: [],           // Map of sound aliases to SoundSource objects.
   gainNode: null,
	panNode: null,

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
      this.gainNode = this.context.createGain();
      this.panNode = this.context.createStereoPanner();
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

	// Generally gain should be between 0 and 1.  If it is higher than 1 the sounds risk being muffled as the waves are multiplied to their maximum aplitude.
   setGain: function (value) {
   	this.gainNode.gain.value = value;
   },

	// Panning values between -1 (full left) and 1 (full right).
   setPan: function (value) {
   	this.panNode.pan.value = value;
   },

   // Play the sound with the passed alias.  
   //play: function (alias) {
   //	var source = this.get(alias);
   //	if (source)
   //		source.play();
   //},

   drawOnCanvas: function (alias, canvas) {
   	var source = this.get(alias);
   	if (source)
   		source.drawOnCanvas();
   }
	

}