
/* -- SPATIAL SOUND --------------------------------- */

// SpatialSound: An attempt to replicate and improve on the  functionality of the PannerNode.
function SpatialSound(source, earInfo) {
	Sound.call(this, source);

	this.position = new Vector(0, 1, 0);	// Location in the scene.
	this.direction = new Vector(0, 0, 1);	// Direction the noise is facing.  Always has a vector length of 1.
	this.earInfo = earInfo;
	this.earInfo.subscribe(this);			// Inform this object when earInfo changes, so the sound can be updated.

	this.gainNodeL = null;
	this.gainNodeR = null;
	this.delayNodeL = null;
	this.delayNodeR = null;

	this.createNodeGraph();
	this.update();
}
SpatialSound.prototype = Object.create(Sound.prototype);
SpatialSound.prototype.constructor = SpatialSound;

// Private. Create the node graph for this sound.
SpatialSound.prototype.createNodeGraph = function () {
	var context = WebAudio.context;

	var sourceNode = this.getSourceNode();
	var splitter = context.createChannelSplitter(2);
	this.delayNodeL = context.createDelay();
	this.delayNodeR = context.createDelay();
	this.gainNodeL = context.createGain();
	this.gainNodeR = context.createGain();
	var mergeNode = context.createChannelMerger(2);

	this.sourceNode.connect(splitter);
	splitter.connect(this.delayNodeL, 0);
	splitter.connect(this.delayNodeR, 1);
	this.delayNodeL.connect(this.gainNodeL);
	this.delayNodeR.connect(this.gainNodeR);
	this.gainNodeL.connect(mergeNode, 0, 0);
	this.gainNodeR.connect(mergeNode, 0, 1);
	mergeNode.connect(WebAudio.outputNode);
}

SpatialSound.prototype.onEarInfoChange = function () {
	this.update();
}

// Update the node values based on current information
SpatialSound.prototype.update = function () {

	var ei = this.earInfo;

	var relPos = ei.leftPos.subc(this.position);	// The location of the sound relative to the listener
	var angle = ei.leftDir.angle(relPos);		// The angle relative to the ear the sound is coming from, in radians.
	var distance = relPos.length();
	this.delayNodeL.delayTime.value = distance / 343;		// Speed of sound is 343 m/s
	this.gainNodeL.gain.value = 1.0 - this.earInfo.getAttenuation(angle);

	relPos = ei.rightPos.subc(this.position);	// The location of the sound relative to the listener
	angle = ei.rightDir.angle(relPos);		// The angle relative to the ear the sound is coming from
	distance = relPos.length();
	this.delayNodeR.delayTime.value = distance / 343;
	this.gainNodeR.gain.value = 1.0 - this.earInfo.getAttenuation(angle);
}


SpatialSound.prototype.setPosition = function (vec) {
	this.position.set(vec);
	this.update();
}

// Note: Safari does not support direct retrieval of the position from the node (ie this.pannerNode.positionX.value)
SpatialSound.prototype.getPosition = function () {
	return this.position;
}

SpatialSound.prototype.setDirection = function (vec) {
	this.direction.set(vec);
	this.direction.normalize();
	this.update();
}

SpatialSound.prototype.setLocation = function (pos, dir) {
	this.position.set(pos);
	this.direction.set(dir);
	this.direction.normalize();
	this.update();
}

// Note: Safari does not support direct retrieval of the orientation from the node (ie this.pannerNode.orientationX.value)
SpatialSound.prototype.getDirection = function () {
	return this.direction;
}

SpatialSound.prototype.play = function () {
	this.start(this.getSourceNode());
}

SpatialSound.prototype._onEnded = function () {
	this.earInfo.unsubscribe(this);
	Sound.prototype._onEnded.call(this);
}
