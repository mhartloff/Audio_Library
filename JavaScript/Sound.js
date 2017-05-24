
// Base class that plays a sound with no alterations.  To play more complex sounds subclass this.
function Sound (source) {
	this.source = source;
	this.repeat = false;	// Repeat the sound over and over, generally for testing.
	this.delay = 0.0;		// Delay to start playing the sound in seconds.
	
	this.onEnded = null;		// Callback function when the sound ends
	
	if (source)  {
		this.sourceNode = this.createSourceNode();
	}
}

// Create a new source node that will be attached to other nodes downstream.
Sound.prototype.createSourceNode = function () {
	var self = this;
	
	sourceNode = WebAudio.context.createBufferSource();
	sourceNode.buffer = this.source.buffer;			// Might be null if it has not been loaded.
	sourceNode.loop = this.repeat;
	sourceNode.onended = function () {
		if (self._onEnded)
			self._onEnded();	// Allow the sound to clean itself up.
		if (self.onEnded)
			self.onEnded(self);
	}
	return sourceNode;
}

Sound.prototype.getSourceNode = function () {
	return this.sourceNode;
}

Sound.prototype.setDelay = function (seconds) {
	//this.delayNode.delay.value = seconds;
	//this.delay = seconds;
}

Sound.prototype.setRepeat = function (repeat /* bool */) {
	this.sourceNode.loop = repeat;
}

Sound.prototype.isLoaded = function () {
	return this.sourceNode.isLoaded;
}

Sound.prototype.start = function () {
	this.sourceNode.start(WebAudio.context.currentTime + this.delay);
}

Sound.prototype.play = function () {

	if (!this.sourceNode) {
		console.error("Attempting to play a Sound more than once!");
		return;
	}
	
	if (this.sourceNode.buffer == null)	// may not have been loaded yet.
		this.sourceNode.buffer = this.source.buffer;
	if (!this.sourceNode.buffer)
		return;			// Still not loaded.  Don't try to play it.

	sourceNode.connect(WebAudio.context.destination);
	this.start(sourceNode);
}

Sound.prototype.stop = function () {
	this.sourceNode.stop();
	this.sourceNode = null;			// A source node can only be played once.
}

Sound.prototype._onEnded = function () {
	console.log("Sound: " + this.source.alias + " has ended");
}
