define(function (require) {

	var Scene = require("Scene");
	var Vector3 = require("Common/Vector3");

	function SimpleConcept() {
		this.waveCanvas = null;

		this.scene = null;
		this.bird = null;
		this.aceOfBass = null;
		this.testSound = null;
		this.fireballs = [];

		this.fireballRate = 2.5; // average fireballs per second
		this.frameRate = 100;

		this.maxFireballs = 1;
		this.creekSounds = [];

		this.leftWallLocation = -10;
		this.rightWallLocation = 10;

	}


	SimpleConcept.prototype.initialize = function (canvas) {

		//DeviceMotion.init();
		//WebAudio.init();
		//WebAudio.loadSoundSource("Sounds/Owl.wav", "owl");
		//WebAudio.loadSoundSource("Sounds/Bird1.wav", "bird1");
		//WebAudio.loadSoundSource("Sounds/Bird2.wav", "bird2");
		//WebAudio.loadSoundSource("Sounds/Sword.wav", "sword");
		//WebAudio.loadSoundSource("Sounds/beautiful_life.wav", "aceOfBass");
		//WebAudio.loadSoundSource("Sounds/Scream.wav", "Scream");
		//WebAudio.loadSoundSource("Sounds/1000htz.wav", "1000htz");
		//WebAudio.loadSoundSource("Sounds/AnMP3.mp3", "sound");
		//
		//WebAudio.loadSoundSource("Sounds/Creek water sounds01 video01.mp3", "creek1-1");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds01 video02.mp3", "creek1-2");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds01 video03.mp3", "creek1-3");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds01 video04.mp3", "creek1-4");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds01 video05.mp3", "creek1-5");
		//
		//WebAudio.loadSoundSource("Sounds/Creek water sounds02 video01.mp3", "creek2-1");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds02 video03.mp3", "creek2-2");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds02 video04.mp3", "creek2-3");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds02 video05.mp3", "creek2-4");
		//
		//WebAudio.loadSoundSource("Sounds/Creek water sounds03 video01.mp3", "creek3-1");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds03 video04.mp3", "creek3-2");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds03 video05.mp3", "creek3-3");
		//
		//WebAudio.loadSoundSource("Sounds/Creek water sounds04 video01.mp3", "creek4-1");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds04 video05.mp3", "creek4-2");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds05 video05.mp3", "creek5-1");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds06 video05.mp3", "creek6-1");
		//WebAudio.loadSoundSource("Sounds/Creek water sounds07 video05.mp3", "creek7-1");

		this.creekSounds.push("creek1-1");
		this.creekSounds.push("creek1-2");
		this.creekSounds.push("creek1-3");
		this.creekSounds.push("creek1-4");
		this.creekSounds.push("creek1-5");

		this.creekSounds.push("creek2-1");
		this.creekSounds.push("creek2-2");
		this.creekSounds.push("creek2-3");
		this.creekSounds.push("creek2-4");

		this.creekSounds.push("creek3-1");
		this.creekSounds.push("creek3-2");
		this.creekSounds.push("creek3-3");

		this.creekSounds.push("creek4-1");
		this.creekSounds.push("creek4-2");
		this.creekSounds.push("creek5-1");
		this.creekSounds.push("creek6-1");
		this.creekSounds.push("creek7-1");

		this.scene = new Scene();
		this.scene.setCanvas(canvas);
		this.scene.setPlayerPosition(0, 0, 5);

		//callback();
	};

	SimpleConcept.prototype.run = function () {
		var self = this;
		setInterval(function () {
			self.mainLoop();
		}, 1000 / this.frameRate);
	};

	SimpleConcept.prototype.playEchos = function (sceneObject) {
		//sceneObject.play(WebAudio.getSoundSource("aceOfBass"), true, 0.1);
		//sceneObject.play(WebAudio.getSoundSource("aceOfBass"), true, 0.2);
		//sceneObject.play(WebAudio.getSoundSource("aceOfBass"), true, 0.3);
		//sceneObject.play(WebAudio.getSoundSource("aceOfBass"), true, 0.4);
		sceneObject.play(WebAudio.getSoundSource("aceOfBass"), true, 0.5);
	};

	SimpleConcept.prototype.mainLoop = function () {

		var probability = this.fireballRate / this.frameRate; // just in case we want fireball rate > frame rate..
		while (this.fireballs.length < this.maxFireballs && Math.random() < probability--) {
			var startLocation = Math.random() * 6.0 - 3.0;
			var fireball = new Fireball(
				WebAudio.getSoundSource("aceOfBass"),
				//WebAudio.getSoundSource(this.creekSounds[Math.floor(Math.random()*this.creekSounds.length)]),
				{
					position: new Vector3(startLocation, 0, -20),
					soundType: SceneObject.SoundTypeEnum.panner,
					velocity: new Vector3(0, 0, (Math.random() / 1.0 + 1.05)/this.frameRate)
				}
			);
			this.scene.addObject(fireball);
			this.fireballs.push(fireball);
			fireball.play(WebAudio.getSoundSource("aceOfBass"), true,0);
			this.playEchos(fireball);
		}

		var toRemove = [];
		for (var i in this.fireballs) {
			var fireball = this.fireballs[i];
			fireball.updatePosition();
			if (fireball.getPosition().getComponent(2) > 20) {
				fireball.stop();
				this.scene.removeObject(fireball);
				toRemove.push(i);
			}
		}
		for (var i in toRemove.reverse()) {
			this.fireballs.splice(toRemove[i], 1);
		}

	};

	return SimpleConcept;
});
