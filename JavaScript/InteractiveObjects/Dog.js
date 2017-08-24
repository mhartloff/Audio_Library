define(function (require) {

	function Dog(options, owner) {
		SceneObject.call(this, options);
		this.behavior = new FollowBehavior(this, owner, 3, 1);
	}

	Dog.prototype = Object.create(SceneObject.prototype);
	Dog.prototype.constructor = Dog;


	Dog.prototype.onBehavior = function (scene) {
		if(this.numSoundsPlaying() === 0 && Math.random() < 0.1){
			this.play(WebAudio.getSoundSource("bark2"));
		}
		this.behavior.onBehavior(scene);
	};

	return Dog;
});