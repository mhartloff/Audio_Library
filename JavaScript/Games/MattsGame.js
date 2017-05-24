

function MattsGame(canvas) {
    Game.call(this, canvas);

    this.creek = this.createCreekObject();
    this.scene.addObject(this.creek);

	this.wall = new EchoObject(new Vector2(-2, 2), new Vector2(2, 2));
	this.scene.addEchoObject(this.wall);
};

MattsGame.prototype = Object.create(Game.prototype);
MattsGame.prototype.constructor = MattsGame;

// Override
MattsGame.prototype.loadAllSounds = function () {

    WebAudio.loadSoundSource("Sounds/Owl.wav", "owl");
    WebAudio.loadSoundSource("Sounds/Bird1.wav", "bird1");
    WebAudio.loadSoundSource("Sounds/Bird2.wav", "bird2");
    WebAudio.loadSoundSource("Sounds/Sword.wav", "sword");
    WebAudio.loadSoundSource("Sounds/Creek water sounds02 video03.mp3", "creek");
    WebAudio.loadSoundSource("Sounds/Scream.wav", "Scream");
    WebAudio.loadSoundSource("Sounds/Footsteps - Single5.mp3", "step1"); 
	 WebAudio.loadSoundSource("Sounds/Footsteps - Single6.mp3", "step3");

}


MattsGame.prototype.createCreekObject = function () {

   var obj = new SceneObject({  position: new Vector(-5, 0, 0),  soundType: SceneObject.SoundTypeEnum.echo,  alias: 'creek' });

   obj.onBehavior = function (scene) {

		var pos = scene.getPlayerPosition();
      if (this.numSoundsPlaying() == 0)
			this.play(WebAudio.getSoundSource("creek"), true /* repeat */);
      //else if (this.numSoundsPlaying() > 0 && pos.distance(this.getPosition()) >= 2)
      //   this.stop();
   };
   
   return obj;
};