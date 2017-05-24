// Copywright Hartloff Gaming and Mike 2017

// A sound that consists of the original sound source and the echoes created from the echo object.
function EchoSound(source, echoObjects, listenerPosition) {
	
	this.origSound = new PannerSound(source);

	var self = this;
	this.origSound.onEnded = function (sound) { self.onEnded && self.onEnded(self);  }

	this.echoObjects = echoObjects;
	this.listenerPos = listenerPosition;
	this.echoSounds = [];			// PannerSound[]
};

EchoSound.prototype.setLocation = function (pos, dir) {
	this.origSound.setLocation(pos, dir);

	for (var i = 0; i < this.echoObjects.length; i++) {
		var echoes = this.echoObjects[i].createEchoes(this.origSound, this.listenerPos);
		for (var j = 0; j < this.echoes; j++) {
			this.echoSounds.push(echoes[j]);
		}
	}

};

EchoSound.prototype.play = function () {
	this.origSound.play();

	for (var i = 0; i < this.echoSounds.length; i++) {
		this.echoSounds[i].play();
	}
}

EchoSound.prototype.stop = function () {
	this.origSound.stop();

	for (var i = 0; i < this.echoSounds.length; i++) {
		this.echoSounds[i].stop();		// delay stopping?
	}
}