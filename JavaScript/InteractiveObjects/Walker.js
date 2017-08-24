define(function (require) {
	// TODO: Add dependencies

	function Walker(options) {
		SceneObject.call(this, options);
		this.behavior = new Nothing();
	}

	Walker.prototype = Object.create(SceneObject.prototype);
	Walker.prototype.constructor = Walker;


	Walker.prototype.onBehavior = function (scene) {
		this.behavior.onBehavior(scene);
	};

	Walker.prototype.walk = function (destination, speed) {
		var self = this;
		this.behavior = new MoveBehavior(self, destination, speed, function () {self.doneWalking()});
	};

	Walker.prototype.doneWalking = function () {
		this.stop();
		this.play(WebAudio.getSoundSource("openingDialog"), false);
		this.behavior = new Nothing();
	};
	return Walker;
});