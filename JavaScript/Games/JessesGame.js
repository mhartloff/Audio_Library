function JessesGame(canvas) {
	Game.call(this, canvas);
	this.createScene();
}

JessesGame.prototype = Object.create(Game.prototype);
JessesGame.prototype.constructor = JessesGame;

// Override
JessesGame.prototype.loadAllSounds = function () {

	WebAudio.loadSoundSource("Sounds/Owl.wav", "owl");
	WebAudio.loadSoundSource("Sounds/Bird1.wav", "bird1");
	WebAudio.loadSoundSource("Sounds/Bird2.wav", "bird2");
	WebAudio.loadSoundSource("Sounds/Sword.wav", "sword");
	WebAudio.loadSoundSource("Sounds/Creek water sounds02 video03.mp3", "creek");
	WebAudio.loadSoundSource("Sounds/Scream.wav", "Scream");
	WebAudio.loadSoundSource("Sounds/1000htz.wav", "1000htz");
}


JessesGame.prototype.createScene = function () {

	this.scene.addEchoObject(new EchoObject(new Vector2(-4, -4), new Vector2(4, -4)));
	this.scene.addEchoObject(new EchoObject(new Vector2(4, -4), new Vector2(4, 4)));
	this.scene.addEchoObject(new EchoObject(new Vector2(4, 4), new Vector2(-4, 4)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-4, 4), new Vector2(-4, 1)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-4, -1), new Vector2(-4, -4)));

	this.scene.addObject(new Talker(
		{
			position: new Vector(-10, 0, -10),
			soundType: SceneObject.SoundTypeEnum.echo,
			alias: 'talker'
		}
	));

	var obj = new SceneObject({
		position: new Vector(-3, 0, 0),
		soundType: SceneObject.SoundTypeEnum.echo,
		alias: 'creek'
	});

	this.scene.addObject(obj);

	obj.onBehavior = function (scene) {
		var pos = scene.getPlayerPosition();
		if (this.numSoundsPlaying() == 0 && pos.distance(this.getPosition()) < 40)
			this.play(WebAudio.getSoundSource("creek"), true);
		else if (this.numSoundsPlaying() > 0 && pos.distance(this.getPosition()) >= 40)
			this.stop();
	};

};