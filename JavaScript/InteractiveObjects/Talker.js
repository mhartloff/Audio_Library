define(function (require) {
	// TODO: Add dependencies

	function Talker(options, firstGuide) {
		SceneObject.call(this, options);
		this.behavior = null;
		this.firstGuide = firstGuide;
	}

	Talker.prototype = Object.create(SceneObject.prototype);
	Talker.prototype.constructor = Talker;


	Talker.prototype.onBehavior = function (scene) {
		if(this.behavior === null){
			this.play(WebAudio.getSoundSource("Scream"), true);
			var self = this;
			this.behavior = new ProximityBehavior(this, 2, function () {self.engage()});
		}
		this.behavior.onBehavior(scene);
	};

	Talker.prototype.engage = function () {
		this.stop();
		//this.play(WebAudio.getSoundSource("openingDialog"), false);
		var self = this;
		this.behavior = new SoundBehavior(this, WebAudio.getSoundSource("openingDialog"), function(){
			self.firstGuide.startGuiding();
			self.behavior = new EngagedBehavior(self, 4, function () {self.disengage()});
		});
		this.behavior.play();
		//self = this;
		//setTimeout(function(){self.firstGuide.startGuiding()}, 17000);
		//var self = this;
		//this.behavior = new EngagedBehavior(this, 4, function () {self.disengage()});
	};

	Talker.prototype.disengage = function () {
		this.stop();
		this.play(WebAudio.getSoundSource("wasTalking"), false);
		this.play(WebAudio.getSoundSource("Scream"), true, 2);
		var self = this;
		this.behavior = new ProximityBehavior(this, 2, function () {self.engage()});
	};
	return Talker;
});