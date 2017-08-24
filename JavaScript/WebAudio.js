
define(function (require) {
		
	var SoundSource = require("SoundSource");
	var DeviceMotion = require("Common/DeviceMotion");

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

	
		// Load a sound file such as a .wav or .mp3.  Assign an alias for easy future reference.
		loadSoundSource: function (url, alias) {
			var newSource = new SoundSource(url, alias);
			this.soundSourceMap[alias] = newSource;
			newSource.load(this.context);
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

	};

	return WebAudio;
});
