﻿

function MattsGame(canvas) {
   Game.call(this, canvas);

   this.creek = this.createCreekObject ();
	this.host = this.createHostObject();
	
   this.scene.addObject(this.creek);
	this.scene.addObject(this.host);

   //this.scene.addEchoObject(new EchoObject(new Vector2(-4, 2), new Vector2(-3, 2)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(-3, 2), new Vector2(-2, 2)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(-2, 2), new Vector2(-1, 2)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(-1, 2), new Vector2(0, 2)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(0, 2), new Vector2(1, 2)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(1, 2), new Vector2(2, 2)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(2, 2), new Vector2(3, 2)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(3, 2), new Vector2(4, 2)));

	//this.scene.addEchoObject(new EchoObject(new Vector2(4, 2), new Vector2(4, 1)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(4, 1), new Vector2(4, 0)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(4, 0), new Vector2(4, -1)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(4, -1), new Vector2(4, -2)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(4, -2), new Vector2(4, -3)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(4, -3), new Vector2(4, -4)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(4, -4), new Vector2(4, -5)));

	//this.scene.addEchoObject(new EchoObject(new Vector2(-4, 2), new Vector2(-4, 1)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(-4, 1), new Vector2(-4, 0)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(-4, 0), new Vector2(-4, -1)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(-4, -1), new Vector2(-4, -2)));
	//this.scene.addEchoObject(new EchoObject(new Vector2(-4, -2), new Vector2(-4, -3)));

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
	WebAudio.loadSoundSource("Sounds/Scream.wav", "scream");
	WebAudio.loadSoundSource("Sounds/Footsteps - Single5.mp3", "step1"); 
	WebAudio.loadSoundSource("Sounds/Footsteps - Single6.mp3", "step3");
	WebAudio.loadSoundSource("Sounds/Christine's voice, creek water in background01 video01.mp3", "froggy");
	WebAudio.loadSoundSource("Sounds/Christine's voice, creek water in background02 video01.mp3", "rock");
	
	WebAudio.loadSoundSource("Sounds/Dialog/Over here, Happy01.mp3", "OverHere0");
	WebAudio.loadSoundSource("Sounds/Dialog/Over here, Angry01.mp3", "OverHere1");
	WebAudio.loadSoundSource("Sounds/Dialog/That's it, Happy01.mp3", "ThatsIt0");
	WebAudio.loadSoundSource("Sounds/Dialog/That's it, Sarcastic01.mp3", "ThatsIt1");
	WebAudio.loadSoundSource("Sounds/Dialog/To your left, Happy01.mp3", "Left0");
	WebAudio.loadSoundSource("Sounds/Dialog/To your left, Impatient01.mp3", "Left1");
	WebAudio.loadSoundSource("Sounds/Dialog/To your right, Happy01.mp3", "Right0");
	WebAudio.loadSoundSource("Sounds/Dialog/To your right, Impatient01.mp3", "Right1");
	WebAudio.loadSoundSource("Sounds/Dialog/Behind you, Happy01.mp3", "Behind0");
	WebAudio.loadSoundSource("Sounds/Dialog/Behind you, Angry01.mp3", "Behind1");
	WebAudio.loadSoundSource("Sounds/Dialog/Behind you, Whisper01.mp3", "BehindClose");
	WebAudio.loadSoundSource("Sounds/Dialog/Hurry up, Angry01.mp3", "Hurry1");
	WebAudio.loadSoundSource("Sounds/Dialog/Hurry up, Sarcastic01.mp3", "Hurry0");
	WebAudio.loadSoundSource("Sounds/Dialog/Great job, Happy01.mp3", "GreatJob0");
	WebAudio.loadSoundSource("Sounds/Dialog/Great job, Sarcastic01.mp3", "GreatJob1");
	WebAudio.loadSoundSource("Sounds/Dialog/Do you hear the creek, Happy01.mp3", "Creek0");
	WebAudio.loadSoundSource("Sounds/Dialog/Do you hear the creek, Angry01.mp3", "Creek1");
	WebAudio.loadSoundSource("Sounds/Dialog/Nice job, Happy01.mp3", "NiceJob0");
	WebAudio.loadSoundSource("Sounds/Dialog/Nice job, Sarcastic01.mp3", "NiceJob1");
	WebAudio.loadSoundSource("Sounds/Dialog/Try to go to it now, Happy01.mp3", "TryNow0");
	WebAudio.loadSoundSource("Sounds/Dialog/Try to go to it now, Sarcastic01.mp3", "TryNow1");
	WebAudio.loadSoundSource("Sounds/Dialog/You got it, Happy01.mp3", "GotIt0");
	WebAudio.loadSoundSource("Sounds/Dialog/You got it, Sarcastic01.mp3", "GotIt1");
}

MattsGame.prototype.createHostObject = function () {
	var obj = new SceneObject({
		position: new Vector(5, 0, 0),  
		soundType: SceneObject.SoundTypeEnum.echo,  
		alias: 'host',
		lastSoundStart: 0,		// time the last sound started.
		state: 'start',
		creekObj: null,
		numDirs: 0,
		hostState: 0			// 0: Happy, 1: Sad
	});
	obj.onBehavior = function (scene) {
		var pos = scene.getPlayerPosition();
		var dir = scene.getPlayerDirection();
		var dir2 = new Vector2(dir.x, dir.z);

		var dif = this.getPosition().subc(pos);
		var dif2 = new Vector2(dif.x, dif.z);
		
		var angle = (MathExt.radToDeg(dif2.angle() - dir2.angle()) + 360) % 360;


		if (this.state == 'start') {
			if (this.numSoundsPlaying() == 0 && (Date.now() - this.lastSoundStart > 3000)) {
				this.play(WebAudio.getSoundSource("OverHere0"));
				this.numDirs++;
				this.lastSoundStart = Date.now();
			}
			if (this.numDirs == 3)  {
				this.state = 'comehere';
			}
		}
		else if (this.state == 'comehere') {
			if (pos.distance(this.getPosition()) < 0.8) {
				if (this.numSoundsPlaying() >= 0)
					this.stop();
				this.play(WebAudio.getSoundSource("NiceJob" + this.hostState));
				this.state = 'next up';				
			}
			if (this.numSoundsPlaying() == 0 && (Date.now() - this.lastSoundStart > 3000)) {
				if (pos.distance(this.getPosition()) < 0.8) {
					// play 'nice job!'
					this.state = 'next up';				
				}
				else {
					console.log(angle);
					var i = Math.random() * 100;
					if (i <= 0.0)
						this.play(WebAudio.getSoundSource("froggy"));
					else if (i <= 15.0 && this.hostState == 1)
						this.play(WebAudio.getSoundSource("Hurry" + Math.floor(Math.random() * 2)));
					else {
						if (angle > 330 || angle < 30) 
							this.play(WebAudio.getSoundSource("ThatsIt" + this.hostState));
						else if (angle >= 210 && angle <= 330) 
							this.play(WebAudio.getSoundSource("Left" + this.hostState));
						else if (angle >= 30 && angle <= 150) 
							this.play(WebAudio.getSoundSource("Right" + this.hostState));
						else 
							this.play(WebAudio.getSoundSource("Behind" + this.hostState));

						this.numDirs++;
						if (this.numDirs > 10)
							this.hostState = 1;		// Make her mad
					}
					this.lastSoundStart = Date.now();
				}
			}
		}
		else if (this.state == 'next up') {
			if (this.numSoundsPlaying() == 0) {
				this.play(WebAudio.getSoundSource("Creek" + this.hostState));
				this.state = 'to the creek'
			}
		}
		else if (this.state == 'to the creek') {
			if (!this.creekObj) 
				this.creekObj = scene.getObjectByAlias('creek');

			if (this.numSoundsPlaying() == 0) {
				var num = Math.random() * 100;

				if (this.creekObj) {
					var distance = this.creekObj.getPosition().distance(pos);
					if (distance < 0.5) {
						this.play(WebAudio.getSoundSource("GreatJob" + this.hostState));
						this.state = 'over'
					}
				}
			}
		}
	}
	return obj;
}


MattsGame.prototype.createCreekObject = function () {

   var obj = new SceneObject({
		position: new Vector(-5, 0, 0),  
		soundType: SceneObject.SoundTypeEnum.echo,  
		alias: 'creek' });

   obj.onBehavior = function (scene) {

		var pos = scene.getPlayerPosition();
      if (this.numSoundsPlaying() == 0)
			this.play(WebAudio.getSoundSource("creek"), true /* repeat */);
      //else if (this.numSoundsPlaying() > 0 && pos.distance(this.getPosition()) >= 2)
      //   this.stop();

   };
   
   return obj;
};