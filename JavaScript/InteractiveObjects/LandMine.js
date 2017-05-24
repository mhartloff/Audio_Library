function LandMine(options) {
	SceneObject.call(this, options);
	this.behavior = null;
}

LandMine.prototype = Object.create(SceneObject.prototype);
LandMine.prototype.constructor = LandMine;


LandMine.prototype.onBehavior = function (scene) {
	if(this.behavior === null){
		//this.play(WebAudio.getSoundSource("shortBeep"), false);
		var self = this;
		this.behavior = new ProximityBehavior(this, 2, function () {self.engage()});
	}
	this.behavior.onBehavior(scene);
};

LandMine.prototype.engage = function () {
	console.log("engage");
	this.stop();
	this.play(WebAudio.getSoundSource("shortBeep"), true);
	var self = this;
	this.behavior = new EngagedBehavior(this, 3, function () {self.disengage()});
};

LandMine.prototype.disengage = function () {
	console.log("disengage");
	this.stop();
	//this.play(WebAudio.getSoundSource("wasTalking"), false);
	//this.play(WebAudio.getSoundSource("Scream"), true, 2);
	var self = this;
	this.behavior = new ProximityBehavior(this, 2, function () {self.engage()});
};