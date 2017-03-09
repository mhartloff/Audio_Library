
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
            //var channelLength = buffer.length;
            var origData = buffer.getChannelData(0);
            //var origData = new Float32Array(channelLength);
            //buffer.copyFromChannel(data, 0, 0);		// Copy data from the first channel
            var newBuffer = WebAudio.context.createBuffer(2 /* num channels */, origData.length, buffer.sampleRate);	// 2 channel buffer from mono sound
            var newData = newBuffer.getChannelData(0);
            newData.set(origData);
				
            newData = newBuffer.getChannelData(1);
            newData.set(origData);
            //newBuffer.copyToChannel(data, 0);
            //newBuffer.copyToChannel(data, 1);

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
	
	headWidth: 12 / 39.3,					// Distance between ears, in meters.
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

   getPosition: function () {
   	return new Vector(this.position.x, this.position.y, this.position.z);
   },
	
   getLeftEarInfo: function (position /* Vector */, direction /* Vector */) {
   	var leftVec = this.getLeftVec();
   	if (direction)
   		direction.set(leftVec);
   	if (position) {
   		var pos = this.getPosition();
   		leftVec.setLength(this.headWidth / 2.0);
   		position.set(pos.x + leftVec.x, pos.y + leftVec.y, pos.z + leftVec.z);
   	}
   },

   getRightEarInfo: function (position /* Vector */, direction /* Vector */) {
   	var rightVec = this.getLeftVec();
   	rightVec.reverse();		// now it's a right vec
   	if (direction)
   		direction.set(rightVec);
   	if (position) {
   		var pos = this.getPosition();
   		rightVec.setLength(this.headWidth / 2.0);
   		position.set(pos.x + rightVec.x, pos.y + rightVec.y, pos.z + rightVec.z);
   	}
   },
	
   setSceneCanvas: function (canvasElement) {
   	this.sceneCanvas = new SceneCanvas(canvasElement);
   },

	// Set the head width, in meters
   setHeadWidth: function (width) {
   	this.headWidth = width;
   	this.updateSpatialSounds();
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
   },

  			
	/* --- PRIVATE FUNCTIONS ---------------------------- */

	updateSceneCanvas: function() {
		if (sceneCanvas) {
			sceneCanvas.drawScene();
		}
	},

	// Add a Sound object to the list of sounds that are playing
	addSound: function (id, sound) {
		this.activeSounds[id] = sound;
		//this.updateSceneCanvas();
	},

	removeSound: function (id) {
		delete this.activeSounds[id];
		//this.updateSceneCanvas();
	},
}


/* --- SCENE CANVAS ------------------------------------------------------- */

// Displays the current state of the WebAudio API as a 2D map.  The canvas is interactive with the mouse and is derived from Canvas2D.
function SceneCanvas(canvasElement) {
	Canvas2D.call(this, canvasElement);

	this.selectedPos = null;		// The last position selected by the user, in scene space.
	this.setProjection(0, 0, 40);

	this.drawScene();
}

SceneCanvas.prototype = Object.create(Canvas2D.prototype);
SceneCanvas.prototype.constructor = SceneCanvas;

SceneCanvas.prototype.getSelectedPosition = function () {
	return this.selectedPos;
}

SceneCanvas.prototype.drawScene = function () {
	
	var context = this.context;
	this.clear('rgb(200, 200, 200)');

	// Draw the axes and the tics.
	this.drawLine(-1000, 0, 1000, 0, "rgb(50, 50, 50)");
	this.drawLine(0, -1000, 0, 1000, "rgb(50, 50, 50)");

	var tic = .25;
	this.drawLine(-tic, 5, tic, 5, "rgb(100, 100, 100)");	// draw a tick at 5.
	this.drawText("+5X", 4.6, -tic * 1.25);
	this.drawLine(-tic, -5, tic, -5, "rgb(100, 100, 100)");	// draw a tick at 5.
	
	this.drawLine(5, -tic, 5, tic, "rgb(100, 100, 100)");	// draw a tick at 5.
	this.drawText("+5Z", tic * 1.25, 4.9);
	this.drawLine(-5, -tic, -5, tic, "rgb(100, 100, 100)");	// draw a tick at 5.
		
		
	// Draw the listener
	var pos = WebAudio.getPosition();
	var dir = WebAudio.getDirection();
	dir.setLength(1.0);
	this.drawCircle(pos.x, pos.z, 6 /* radius */, "rgb(10, 10, 10)", "rgb(50, 50, 200)");
	this.drawLine(pos.x, pos.z, pos.x + dir.x, pos.z + dir.z, "rgb(255, 0, 0)");

	// Draw the selected position
	if (this.selectedPos) {
		var p = this.selectedPos;
		this.drawLine(p.x - 0.2, p.y - 0.2, p.x + 0.2, p.y + 0.2, "rgb(200, 40, 40)");
		this.drawLine(p.x + 0.2, p.y - 0.2, p.x - 0.2, p.y + 0.2, "rgb(200, 40, 40)");
	}

	// Draw each active sound
	for (var soundId in WebAudio.activeSounds) {
		if (WebAudio.activeSounds.hasOwnProperty(soundId)) {
			var sound = WebAudio.activeSounds[soundId];
			var pos = sound.getPosition();
			this.drawCircle(pos.x, pos.z, 6, "rgb(10, 10, 10)", "rgb(200, 50, 50)");
			var dir = sound.getDirection();
			dir.mult(0.50);	// Set the length of the line
			this.drawLine(pos.x, pos.z, pos.x + dir.x, pos.z + dir.z, "rgb(20, 20, 100)");
		}
	}
},

SceneCanvas.prototype.onMouseDown = function (p /* pick point */) {
	this.selectedPos = p;
	this.drawScene();
}
	
SceneCanvas.prototype.onMouseUp = function (p) {
	//console.log("Mouse Up: " + p.x + ", " + p.y);
}

SceneCanvas.prototype.onMouseMove = function (p) {
	//console.log("Mouse Move: " + p.x + ", " + p.y);
}
