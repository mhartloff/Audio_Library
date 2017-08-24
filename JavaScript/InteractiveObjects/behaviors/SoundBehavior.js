
define(function (require) {

	// this is more of an event. Gives us a way to add a callback for the end of a sound
	function SoundBehavior(sceneObject, sound, triggerFunction) {

		this.sceneObject = sceneObject;
		this.sound = sound;
		this.triggerFunction = triggerFunction;
		this.playing = false;
	}

	SoundBehavior.prototype.play = function (){
		this.sceneObject.play(this.sound);
		this.playing = true;
	};

	SoundBehavior.prototype.onBehavior = function (scene) {
		if(this.playing && this.triggered(scene)){
			this.playing = false;
			this.triggerFunction();
		}
	};

	SoundBehavior.prototype.triggered = function (scene) {
		// hack for now. Would need a way to ask objects if a particular sound is playing
		return this.sceneObject.numSoundsPlaying() === 0;
	};

	return SoundBehavior;
});