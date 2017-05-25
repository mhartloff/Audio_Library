function LandMine(options, scene) {
	SceneObject.call(this, options);
	this.behavior = null;
	this.scene = scene;
}

LandMine.prototype = Object.create(SceneObject.prototype);
LandMine.prototype.constructor = LandMine;


LandMine.prototype.onBehavior = function (scene) {
	if(this.behavior === null){
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
	this.behavior = new DelayedBehavior(this, 3000, function () {self.detonate()});
	//this.behavior = new EngagedBehavior(this, 3, function () {self.disengage()});
};

LandMine.prototype.detonate = function () {
	console.log("detonated");
	this.stop();
	this.play(WebAudio.getSoundSource("explosion"), false);
	var distanceToPlayer = this.scene.getPlayerPosition().distance(this.getPosition());
	if( distanceToPlayer < 3){
		console.log("You dead");
	}
	this.behavior = new Nothing();
	this.scene.removeObject(this);
};

LandMine.prototype.disengage = function () {
	console.log("disengage");
	this.stop();
	//this.play(WebAudio.getSoundSource("wasTalking"), false);
	//this.play(WebAudio.getSoundSource("Scream"), true, 2);
	var self = this;
	this.behavior = new ProximityBehavior(this, 2, function () {self.engage()});
};