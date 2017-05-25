function JessesGame(canvas) {
	Game.call(this, canvas);
	this.loadAllSounds();
	self = this;

	setTimeout(function () {
		self.createScene()
	}, 1000);
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

	WebAudio.loadSoundSource("Sounds/TextToSpeech/OpeningDialog.mp3", "openingDialog");
	WebAudio.loadSoundSource("Sounds/TextToSpeech/WasTalking.mp3", "wasTalking");
	WebAudio.loadSoundSource("Sounds/TextToSpeech/ShortBeep.mp3", "shortBeep");
	WebAudio.loadSoundSource("Sounds/TextToSpeech/OverHere.mp3", "overHere");
	WebAudio.loadSoundSource("Sounds/TextToSpeech/NextGuide.mp3", "nextGuide");
	WebAudio.loadSoundSource("Sounds/TextToSpeech/Power.mp3", "power");
	WebAudio.loadSoundSource("Sounds/TextToSpeech/Die.mp3", "die");
	WebAudio.loadSoundSource("Sounds/TextToSpeech/InCharge.mp3", "inCharge");
	WebAudio.loadSoundSource("Sounds/TextToSpeech/Explosion.mp3", "explosion");
};


JessesGame.prototype.createScene = function () {

	this.scene.addEchoObject(new EchoObject(new Vector2(-4, -4), new Vector2(4, -4)));
	this.scene.addEchoObject(new EchoObject(new Vector2(4, -4), new Vector2(4, 4)));
	this.scene.addEchoObject(new EchoObject(new Vector2(4, 4), new Vector2(-4, 4)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-4, 4), new Vector2(-4, 1)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-4, -1), new Vector2(-4, -4)));

	var guideLocations = [[-45, 30], [-30, 36], [-24, 24], [-30, 9], [-21, 6], [-15, 0]];

	var nextGuide = undefined;

	for(var j in guideLocations){
		var guideLocation = guideLocations[j];
		var guide = new Guide(
			{
				position: new Vector(guideLocation[0], 0, guideLocation[1]),
				soundType: SceneObject.SoundTypeEnum.echo
			}, nextGuide);
		this.scene.addObject(guide)
		nextGuide = guide;
	}


	//var guide6 = new Guide(
	//	{
	//		position: new Vector(-45, 0, 30),
	//		soundType: SceneObject.SoundTypeEnum.echo
	//	});
	//var guide5 = new Guide(
	//	{
	//		position: new Vector(-30, 0, 36),
	//		soundType: SceneObject.SoundTypeEnum.echo
	//	}, guide6);
	//var guide4 = new Guide(
	//	{
	//		position: new Vector(-24, 0, 24),
	//		soundType: SceneObject.SoundTypeEnum.echo
	//	}, guide5);
	//var guide3 = new Guide(
	//	{
	//		position: new Vector(-30, 0, 9),
	//		soundType: SceneObject.SoundTypeEnum.echo
	//	}, guide4);
	//var guide2 = new Guide(
	//	{
	//		position: new Vector(-21, 0, 6),
	//		soundType: SceneObject.SoundTypeEnum.echo
	//	}, guide3);
	//var guide1 = new Guide(
	//	{
	//		position: new Vector(-15, 0, 0),
	//		soundType: SceneObject.SoundTypeEnum.echo
	//	}, guide2);
	//
	//this.scene.addObject(guide6);
	//this.scene.addObject(guide5);
	//this.scene.addObject(guide4);
	//this.scene.addObject(guide3);
	//this.scene.addObject(guide2);
	//this.scene.addObject(guide1);


	this.scene.addObject(new Talker(
		{
			position: new Vector(-3, 0, 0),
			soundType: SceneObject.SoundTypeEnum.echo,
			alias: 'talker'
		}
		, nextGuide));


	var mineLocations = [[-12, 3], [-12, 3], [-10, 3], [-10, -3], [-8, 3], [-8, -3], [-6, 3], [-6, -3]];

	for(var i in mineLocations){
		var location = mineLocations[i];
		this.scene.addObject(new LandMine(
			{
				position: new Vector(location[0], 0, location[1]),
				soundType: SceneObject.SoundTypeEnum.echo
			}, this.scene
		));
	}

	this.scene.addObject(new General(
		{
			position: new Vector(-60, 0, 30),
			soundType: SceneObject.SoundTypeEnum.echo,
			alias: 'general'
		}
	));


	this.scene.addEchoObject(new EchoObject(new Vector2(-65, 35), new Vector2(-65, 25)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-65, 25), new Vector2(-45, 25)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-65, 35), new Vector2(-45, 35)));

};