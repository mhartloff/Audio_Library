

// Base class that plays a sound with no alterations.  To play more complex sounds subclass this.
function Sound (source) {
	this.source = source;
	this.repeat = false;	// Repeat the sound over and over, generally for testing.
	this.delay = 0.0;		// Delay to start playing the sound in seconds.
	
	this.onEnded = null;		// Callback function when the sound ends
	
	this.sourceNode = this.createSourceNode();
}

Sound.prototype.createSourceNode = function () {
	var self = this;
	sourceNode = WebAudio.context.createBufferSource();
	sourceNode.buffer = this.source.buffer;
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
	this.delayNode.delay.value = seconds;
}

Sound.prototype.setRepeat = function (repeat /* bool */) {
	this.sourceNode.loop = repeat;
}

Sound.prototype.start = function () {
	if (!this.sourceNode)
		return;
	
	this.sourceNode.start(WebAudio.context.currentTime + this.delay);
}

Sound.prototype.play = function () {
	var sourceNode = this.getSourceNode();
	sourceNode.connect(WebAudio.context.destination);
	this.start(sourceNode);
}

Sound.prototype.stop = function () {
	this.sourceNode.stop();
	this.sourceNode = null;
}

Sound.prototype._onEnded = function () {
	console.log("Sound: " + this.source.alias + " has ended");
}
