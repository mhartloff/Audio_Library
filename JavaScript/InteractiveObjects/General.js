define(function (require) {

	var SceneObject = require("SceneObject");
	var WebAudio = require("WebAudio");
	var Nothing = require("InteractiveObjects/behaviors/Nothing");

	function General(options) {
		SceneObject.call(this, options);
		this.behavior = null;
	}

	General.prototype = Object.create(SceneObject.prototype);
	General.prototype.constructor = General;


	General.prototype.onBehavior = function (scene) {
		if(this.behavior === null ){
			this.play(WebAudio.getSoundSource("inCharge"), true);
			var self = this;
			this.behavior = new ProximityBehavior(this, 2, function () {self.engage()});
		}
		this.behavior.onBehavior(scene);
	};

	General.prototype.engage = function () {
		console.log("engage");
		this.stop();
		this.play(WebAudio.getSoundSource("die"), false);
		this.play(WebAudio.getSoundSource("sword"), true, 1);
		this.behavior = new Nothing();
	};

	return General;
});