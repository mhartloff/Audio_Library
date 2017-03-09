
// An object in the scene which is designed to eventually be able to play more
// than one sound.
function SceneObject(soundSource /* SoundSource */, options)  {

	// Vars that can be set within options.
	this.position = new Vector(0, 0, 1);
	this.direction = new Vector(0, 0, 1);
	this.alias = null;	// A text string for casual identification
	this.soundType = this.soundTypeEnum['spatial'];

	if (options) {
		if (options.position) this.position = options.position.clone();
		if (options.direction) this.direction = options.direction.clone();
		if (options.alias) this.alias = options.alias;
		if (options.soundType !== undefined) this.soundType = options.soundType;
	}

	this.scene = null;	// populated when/if it is added to a scene.
	this.soundSource = soundSource;
	this.sounds = [];		// All currently playing sounds

	this.isPlaying = false;
}

SceneObject.prototype.soundTypeEnum = { normal: 0, panner: 1, spatial: 2 };

SceneObject.prototype.setAlias = function (alias /*String */) {
	this.alias = alias;
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


SceneObject.prototype.play = function (repeat) {

	try {

		var newSound = null;
		switch (this.soundType) {
			case 0: {
				newSound = new Sound(this.soundSource);
				break;
			}
			case 1: {
				newSound = new PannerSound(this.soundSource);
				break;
			}
			case 2: {
				newSound = new SpatialSound(this.soundSource, this.scene.earInfo);
				break;
			}
			default: {
				console.log("Unknown sound type");
				return;
			}
		}

		var self = this;
		newSound.onEnded = function (sound) { self.onEnded(sound); }
		newSound.setRepeat(repeat !== undefined ? repeat : false);

		// Update the sound if it has location specific functionality
		if (newSound.setLocation)
			newSound.setLocation(this.position, this.direction);

		newSound.play();
		this.isPlaying = true;

		this.sounds.push(newSound);

		if (this.scene)
			this.scene.needsRedraw = true;
	}
	catch (e) {
		alert(e.message);
	}
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

