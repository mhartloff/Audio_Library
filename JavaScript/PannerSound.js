
// Example of playing a sound with the built-in Panner 3D spatial sound system.
function PannerSound(source) {
	Sound.call(this, source);

	this.position = new Vector(0, 1, 0);	// Location in the scene.
	this.direction = new Vector(0, 0, 1);	// Always has a vector length of 1.

	var panner = WebAudio.context.createPanner();
	panner.panningModel = 'HRTF';	// 'head-related transfer function'
	panner.distanceModel = 'inverse';	// [linear, inverse, exponential]
	panner.refDistance = 1;
	panner.maxDistance = 10000;
	panner.rolloffFactor = 1;
	panner.coneInnerAngle = 360;
	panner.coneOuterAngle = 0;
	panner.coneOuterGain = 0;
	panner.setPosition(this.position.x, this.position.y, this.position.z);
	panner.setOrientation(this.direction.x, this.direction.y, this.direction.z);
	this.pannerNode = panner;
}

PannerSound.prototype = Object.create(Sound.prototype);
PannerSound.prototype.constructor = PannerSound;

// Note: Safari does not support direct retrieval of the position from the node (ie this.pannerNode.positionX.value)
PannerSound.prototype.getPosition = function () {
	return this.position;
}

PannerSound.prototype.setPosition = function (vec) {
	this.position.set(vec);
	this.pannerNode.setPosition(this.position.x, this.position.y, this.position.z);
}

// Note: Safari does not support direct retrieval of the orientation from the node (ie this.pannerNode.orientationX.value)
PannerSound.prototype.getDirection = function () {
	return this.direction;
}

PannerSound.prototype.setDirection = function (vec) {
	this.direction.set(vec);
	this.direction.normalize();
	this.pannerNode.setOrientation(this.direction.x, this.direction.y, this.direction.z);  // forward direction x, y, z, up vector x, y, z
}

PannerSound.prototype.setLocation = function (pos, dir) {
	this.setPosition(pos);
	this.setDirection(dir);
}

PannerSound.prototype.play = function () {

	var sourceNode = this.getSourceNode();
	this.sourceNode.connect(this.pannerNode);
	this.pannerNode.connect(WebAudio.outputNode);
	this.start(sourceNode);

	//for(var i in echoObjects){
	//	var echoObject = echoObjects[i];

	//}
}
