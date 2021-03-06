﻿// Copywrite Hartloff Gaming 2017

define(function (require) {
	
	var Sound = require("Sound");
	var WebAudio = require("WebAudio");
	var Vector3 = require("Common/Vector3");
	var Matrix = require("Common/Matrix");

	// Example of playing a sound with the built-in Panner 3D spatial sound system.
	function PannerSound(source) {
		Sound.call(this, source);

		this.position = new Vector3(0, 1, 0);	// Location in the scene.
		this.direction = new Vector3(0, 0, 1);	// Always has a vector length of 1.
		this.directionMatrix = new Matrix();
		this.offset = new Vector3(0, 0, 0);			// Offset to apply to the position when the sound is being played.  In object space.
		this.soundOrigin = new Vector3(0, 0, 0);	

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

		this.dampenNode = WebAudio.context.createGain();
		this.dampenNode.gain.value = 1;
	};

	PannerSound.prototype = Object.create(Sound.prototype);
	PannerSound.prototype.constructor = PannerSound;

	// The apparent location of the sound when the offset is considered.
	PannerSound.prototype.updateSoundOrigin = function () {
		this.soundOrigin.set(this.position);
		var offset = this.offset.clone();
		this.soundOrigin.add(this.directionMatrix.applyToVector(offset));

		this.pannerNode.setPosition(this.soundOrigin.x, this.soundOrigin.y, this.soundOrigin.z);
		this.pannerNode.setOrientation(this.direction.x, this.direction.y, this.direction.z);  // forward direction x, y, z, up vector x, y, z
	};

	// Note: Safari does not support direct retrieval of the position from the node (ie this.pannerNode.positionX.value)
	PannerSound.prototype.getPosition = function () {
		return this.position;
	};

	PannerSound.prototype.setPosition = function (vec) {
		this.position.set(vec);

		this.updateSoundOrigin();
	};

	// Note: Safari does not support direct retrieval of the orientation from the node (ie this.pannerNode.orientationX.value)
	PannerSound.prototype.getDirection = function () {
		return this.direction;
	};

	PannerSound.prototype.setDirection = function (vec) {
		this.direction.set(vec);
		this.direction.normalize();
		this.directionMatrix.setFromOrientation(this.direction, Vector3.Y());
		this.updateSoundOrigin();	
	};

	PannerSound.prototype.setLocation = function (pos, dir) {
		this.setPosition(pos);
		this.setDirection(dir);
	};

	PannerSound.prototype.setGain = function (gain) {
		this.dampenNode.gain.value = gain;
	};

	PannerSound.prototype.setOffset = function (offset /* Vector3 */) {
		this.offset.set(offset);
		this.updateSoundOrigin();
	};

	PannerSound.prototype.play = function () {

		var sourceNode = this.getSourceNode();
		var delayNode = WebAudio.context.createDelay();
		delayNode.delayTime.value = this.delay;
		this.sourceNode.connect(this.pannerNode);
		this.pannerNode.connect(delayNode);
		delayNode.connect(this.dampenNode);
		this.dampenNode.connect(WebAudio.outputNode);
		this.start(sourceNode);
	};

	return PannerSound;
});