function Guide(options, nextGuide) {
	SceneObject.call(this, options);
	this.behavior = null;
	this.nextGuide = nextGuide;
}

Guide.prototype = Object.create(SceneObject.prototype);
Guide.prototype.constructor = Guide;

Guide.prototype.startGuiding = function () {
	this.play(WebAudio.getSoundSource("overHere"), true);
	var self = this;
	this.behavior = new ProximityBehavior(this, 1, function () {self.engage()});
};

Guide.prototype.onBehavior = function (scene) {
	if(this.behavior !== null) {
		this.behavior.onBehavior(scene);
	}
};

Guide.prototype.engage = function () {
	console.log("engage");
	this.stop();
	this.play(WebAudio.getSoundSource("nextGuide"), false);
	if(this.nextGuide) {
		this.nextGuide.startGuiding();
	}
	var self = this;
	this.behavior = new EngagedBehavior(this, 2, function () {self.disengage()});
};

Guide.prototype.disengage = function () {
	console.log("disengage");
	this.stop();
	this.play(WebAudio.getSoundSource("power"), false);
	//this.play(WebAudio.getSoundSource("Scream"), true, 3);
	this.behavior = new Nothing();

};