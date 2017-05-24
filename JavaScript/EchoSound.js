// Copyright Hartloff Gaming and Mike 2017

// A sound that consists of the original sound source and the echoes created from the echo object.
function EchoSound(source, scene) {

	this.source = source;
	this.scene = scene;
	this.loop = false;

	this.position = new Vector(0, 1, 0);	// Location in the scene.
	this.direction = new Vector(0, 0, 1);	// Always has a vector length of 1.

	//this.origSound = new PannerSound(source);

	//var self = this;
	//this.origSound.onEnded = function (sound) {
	//	self.onEnded && self.onEnded(self);
	//};

	//this.echoObjects = echoObjects;
	//this.listenerPos = listenerPosition;
	this.echoSounds = [];			// {PannerSound: delay}
}


// Note: Safari does not support direct retrieval of the position from the node (ie this.pannerNode.positionX.value)
EchoSound.prototype.getPosition = function () {
	return this.position;
};

EchoSound.prototype.setPosition = function (vec) {
	this.position.set(vec);
	//this.pannerNode.setPosition(this.position.x, this.position.y, this.position.z);
};

// Note: Safari does not support direct retrieval of the orientation from the node (ie this.pannerNode.orientationX.value)
EchoSound.prototype.getDirection = function () {
	return this.direction;
};

EchoSound.prototype.setDirection = function (vec) {
	this.direction.set(vec);
	this.direction.normalize();
	//this.pannerNode.setOrientation(this.direction.x, this.direction.y, this.direction.z);  // forward direction x, y, z, up vector x, y, z
};


EchoSound.prototype.setLocation = function (pos, dir) {
	this.position = pos;
	this.setDirection(dir);

	// TODO: update all sounds. Echos will be different after movement

	//this.origSound.setLocation(pos, dir);
	//
	//for (var i = 0; i < this.echoObjects.length; i++) {
	//	var echoes = this.echoObjects[i].createEchoes(this.origSound, this.listenerPos);
	//	for (var j = 0; j < this.echoes; j++) {
	//		this.echoSounds.push(echoes[j]);
	//	}
	//}

};

EchoSound.prototype.setRepeat = function (repeat /* bool */) {
	this.loop = repeat;
}

EchoSound.prototype.play = function () {
	//this.origSound.play();
	var OG = new PannerSound(this.source);
	OG.setLocation(this.position, this.direction);
	OG.setRepeat(this.loop);
	this.echoSounds.push(OG);

	var echoObjects = this.scene.echoObjects;
	var listenerLocation = this.scene.position;

	var midpoint = new Vector2((listenerLocation.x + this.position.x) / 2, (listenerLocation.y + this.position.y) / 2);

	for (var index = 0; index < echoObjects.length; index++) {
		var echoObject = echoObjects[index];

		// TODO: if echoObject in echo position
		if (true) {
			// TODO: get echo point
			var echoPoint = echoObject.getLineSegment().getCenter();
			//var echoPoint = new Vector2(1, 2);
			var distance1 = this.position.distance(new Vector(echoPoint.x, 0, echoPoint.y));
			var echoSound = new PannerSound(this.source);
			echoSound.setPosition(new Vector(echoPoint.x, 0, echoPoint.y));
			//echoSound.setLocation(echoPoint, echoPoint.angleBetween(listenerLocation));
			echoSound.setDelay(distance1/343.0);
			//echoSound.setDelay(distance1/3.0);
			echoSound.setRepeat(this.loop);
			echoSound.setGain(0.5);
			this.echoSounds.push(echoSound);
		}
	}

	for (var i = 0; i < this.echoSounds.length; i++) {
		this.echoSounds[i].play();
	}

};

EchoSound.prototype.stop = function () {
	//this.origSound.stop();

	for (var i = 0; i < this.echoSounds.length; i++) {
		var echoSound = this.echoSounds[i];
		setTimeout(echoSound.stop(), echoSound.delay);
		//this.echoSounds[i].stop();		// delay stopping?
	}
};