
// An object in the scene which is designed to eventually be able to play more
// than one sound.
function SceneObject(options)  {

	// Vars that can be set within options.
	this.position = new Vector(0, 0, 1);
	this.direction = new Vector(0, 0, 1);
	this.alias = null;	// A text string for casual identification
	this.soundType = SceneObject.SoundTypeEnum['echo'];
	this.soundOptions = null;		// A canvas to output information about the sound playing, if the sound supports it.
	this.scene = null;	// populated when/if it is added to a scene.  Can also be added under 'options'

	$.extend(this, options);
	if (options) {
		if (options.position) this.position = options.position.clone();		// Clone these because they would be passed by reference.
		if (options.direction) this.direction = options.direction.clone();
	}

	
	this.sounds = [];		// All currently playing sounds

	// Callback function called on every physics update, which is generally less frequent than redraw.
	// function is passed in one parameter, the scene.
	//this.onBehavior = null;

	// Callback function called before every draw update. Passed (scene, interval). Interval is ms since last redraw.
	this.onPredraw = null;			// Called before every draw

	this.isPlaying = false;
}

SceneObject.prototype.onBehavior = function (scene) {

};

SceneObject.SoundTypeEnum = { normal: 0, panner: 1, spatial: 2, test: 3, echo: 4 };	

SceneObject.prototype.setAlias = function (alias /*String */) {
	this.alias = alias;
}

SceneObject.prototype.numSoundsPlaying = function () {
	return this.sounds.length;
}

SceneObject.prototype.isPlaying = function () {
	return this.isPlaying;
}

SceneObject.prototype.getPosition = function () {
	return this.position;
}

SceneObject.prototype.setPosition = function (pos) {
	this.position = pos;
	for (var i = 0; i < this.sounds.length; i++)
		if (this.sounds[i].setPosition)
			this.sounds[i].setPosition(pos);
	if (this.scene)
		this.scene.needsRedraw = true;
}

SceneObject.prototype.getDirection = function () {
	return this.direction;
}

SceneObject.prototype.setDirection = function (dir) {
	this.direction = dir;
	for (var i = 0; i < this.sounds.length; i++)
		if (this.sounds[i].setDirection)
			this.sounds[i].setDirection(dir);
	if (this.scene)
		this.scene.needsRedraw = true;
}

SceneObject.prototype.draw = function (canvas) {
	var fillColor = this.isPlaying ? "rgb(200, 100, 100)" : "rgb(100, 200, 100)";
	var outlineColor = "rgb(100,100,100)";

	var pos = this.getPosition();
	canvas.drawCircle(pos.x, pos.z, 0.4, outlineColor, fillColor);
	
	// Draw a line indicating the direction the object is facing.
	var dir = this.getDirection().clone();		
	dir.mult(0.50);	// Set the length of the line
	canvas.drawLine(pos.x, pos.z, pos.x + dir.x, pos.z + dir.z, "rgb(20, 20, 100)");
	if (this.alias)
		canvas.drawText(this.alias, pos.x - 0.3, pos.z - 0.3, "rgb(60, 60, 120)");

	// Here we could draw each sound individually, such as an echo sound.
}

// Options:
//		offset (Vector):  Position offset from the source position.  For instance, coming from an object's head or feet instead of its center.
SceneObject.prototype.play = function (soundSource, repeat, delay, options) {

	if (!soundSource) {
		console.error("Trying to play an invalid sound source!");
		return;
	}

	//try {
		var newSound = null;
		switch (this.soundType) {
			case 0: {
				newSound = new Sound(soundSource);
				break;
			}
			case 1: {
				newSound = new PannerSound(soundSource);
				break;
			}
			case 2: {
				newSound = new SpatialSound(soundSource, this.scene.earInfo);
				break;
			}
			case 3: {
				newSound = new TestSound(soundSource, this.soundOptions);
				break;
			}
			case 4: {
				newSound = new EchoSound(soundSource, this.scene);
				break;
			}
			default: {
				console.log("Unknown sound type");
				return;
			}
		}

		var self = this;
		newSound.onEnded = function (sound) { self.onEnded(sound); };
		//newSound.setRepeat(repeat !== undefined ? repeat : false);
		newSound.setRepeat && newSound.setRepeat(repeat);
		newSound.setDelay && delay && newSound.setDelay(delay);
		newSound.setLocation && newSound.setLocation(this.position, this.direction);
		if (options) {
			newSound.setOffset && options.offset && newSound.setOffset(options.offset);
		}

		newSound.play();
		this.isPlaying = true;

		this.sounds.push(newSound);

		if (this.scene)
			this.scene.needsRedraw = true;
	//}
	//catch (e) {
	//	alert(e.message);
	//}
}

SceneObject.prototype.stop = function () {
	for (var i = 0; i < this.sounds.length; i++)
		this.sounds[i].stop();
}

SceneObject.prototype.onEnded = function (sound) {
	
	for (var i = 0; i < this.sounds.length; i++) {
		if (this.sounds[i] == sound) {
			this.sounds.splice(i, 1);
			break;
		}
	}
	this.isPlaying = this.sounds.length > 0;
	if (this.scene)
		this.scene.needsRedraw = true;
}

