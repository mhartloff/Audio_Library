﻿

function MattsGame(canvas) {
    Game.call(this, canvas);

    this.creek = this.createCreekObject ();
    this.scene.addObject(this.creek);

   this.scene.addEchoObject(new EchoObject(new Vector2(-4, 2), new Vector2(-3, 2)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-3, 2), new Vector2(-2, 2)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-2, 2), new Vector2(-1, 2)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-1, 2), new Vector2(0, 2)));
	this.scene.addEchoObject(new EchoObject(new Vector2(0, 2), new Vector2(1, 2)));
	this.scene.addEchoObject(new EchoObject(new Vector2(1, 2), new Vector2(2, 2)));
	this.scene.addEchoObject(new EchoObject(new Vector2(2, 2), new Vector2(3, 2)));
	this.scene.addEchoObject(new EchoObject(new Vector2(3, 2), new Vector2(4, 2)));

	this.scene.addEchoObject(new EchoObject(new Vector2(4, 2), new Vector2(4, 1)));
	this.scene.addEchoObject(new EchoObject(new Vector2(4, 1), new Vector2(4, 0)));
	this.scene.addEchoObject(new EchoObject(new Vector2(4, 0), new Vector2(4, -1)));
	this.scene.addEchoObject(new EchoObject(new Vector2(4, -1), new Vector2(4, -2)));
	this.scene.addEchoObject(new EchoObject(new Vector2(4, -2), new Vector2(4, -3)));
	this.scene.addEchoObject(new EchoObject(new Vector2(4, -3), new Vector2(4, -4)));
	this.scene.addEchoObject(new EchoObject(new Vector2(4, -4), new Vector2(4, -5)));

	this.scene.addEchoObject(new EchoObject(new Vector2(-4, 2), new Vector2(-4, 1)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-4, 1), new Vector2(-4, 0)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-4, 0), new Vector2(-4, -1)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-4, -1), new Vector2(-4, -2)));
	this.scene.addEchoObject(new EchoObject(new Vector2(-4, -2), new Vector2(-4, -3)));

    //this.scene.addEchoObject(new EchoObject(new Vector2(-20, 2), new Vector2(20, 2)));
    //this.scene.addEchoObject(new EchoObject(new Vector2(-1, 5), new Vector2(5, 10)));
    //this.scene.addEchoObject(new EchoObject(new Vector2(-8, 2), new Vector2(-8, 3)));
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
      //if (this.numSoundsPlaying() == 0)
		//	this.play(WebAudio.getSoundSource("creek"), true /* repeat */);
      //else if (this.numSoundsPlaying() > 0 && pos.distance(this.getPosition()) >= 2)
      //   this.stop();

   };
   
   return obj;
};