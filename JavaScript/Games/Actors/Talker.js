function Talker(options) {
	SceneObject.call(this, options);
	this.behavior = new ProximityBehavior(this, 1);
}

Talker.prototype = Object.create(SceneObject.prototype);
Talker.prototype.constructor = Talker;


Talker.prototype.onBehavior = function (scene) {
	this.behavior.onBehavior(scene);
};

Talker.prototype.engage = function (scene) {
	this.play(WebAudio.getSoundSource("creek"), true);
	this.behavior = new EngagedBehavior(this, 2, null);
};

Talker.prototype.disengage = function (scene) {
	console.log(this.sounds);
	this.stop();
	this.behavior = new ProximityBehavior(this, 1);
};