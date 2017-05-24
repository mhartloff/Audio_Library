// Copywright Hartloff Gaming And Mike 2017

function Game(canvas) {

   DeviceMotion.init();
   WebAudio.init();

   this.loadAllSounds();

   this.scene = new Scene();
   this.scene.setCanvas(canvas);

	this.lastRedrawTime = null;

	var self = this;
   this.behaviorIntervalID = setInterval(function () { self.onBehavior(); }, 200);	// Fire an event to update the behavior
	this.intervalID = setInterval(function () { self.onRedraw(); }, 50);	// Fire an event to redraw 
   
}

Game.prototype.destroy = function () {
	clearInterval(this.intervalID);
	clearInterval(this.behaviorIntervalID);
}

Game.prototype.onBehavior = function () {
	this.scene.onBehavior();
}

Game.prototype.onRedraw = function () {

	var interval = this.lastRedrawTime ? Date.now() - this.lastRedrawTime : 0.0;
	interval = Math.min(interval, 500);		// Limit the interval to 1/2 sec.
	this.lastRedrawTime = Date.now();

	this.scene.onRedraw(interval);
}

Game.prototype.loadAllSounds = function () {

    allSounds = {
        //"1000htz": "Sounds/1000htz.wav",
        "way": "Sounds/725418_1-Way.mp3",

        "aiplaneBuckle1": "Sounds/Airplane Seat Buckle01.mp3",
        "aiplaneBuckle2": "Sounds/Airplane Seat Buckle02.mp3",
        "aiplaneBuckle3": "Sounds/Airplane Seat Buckle03.mp3",

        //"someSound": "Sounds/AnMP3.wav",

        "babyCrying1": "Sounds/Baby Crying on plane01.mp3",
        "babyCrying2": "Sounds/Baby Crying on plane02.mp3",
        "babyCrying3": "Sounds/Baby Crying on plane03.mp3",
        "babyCrying4": "Sounds/Baby Crying on plane04.mp3",
        "babyCrying5": "Sounds/Baby Crying on plane05.mp3",
        //"babyCrying6": "Sounds/Baby Crying on plane06.mp3",

        "aceOfBass": "Sounds/beautiful_life.wav",

        "birdCreek": "Sounds/Bird noise, creek in background01 video02.mp3",
        "bird1": "Sounds/Bird1.wav",
        "bird2": "Sounds/Bird2.wav",

        //"christineCreek1": "Sounds/Christine's voice, creek in background \"well\" video05.mp3",
        //"christineCreek2": "Sounds/Christine's voice, creek in background full dialouge video05.mp3",
        //"christineCreek3": "Sounds/Christine's voice, creek in background \"been something\" video05.mp3",
        //"christineCreek4": "Sounds/Christine's voice, creek in background \"it still would of\" video05.mp3",
        //"christineCreek5": "Sounds/Christine's voice, creek in background \"kinda cool\" video05.mp3",
        //"christineCreek6": "Sounds/Christine's voice, creek in background \"mumble\" video05.mp3",
        //"christineCreek7": "Sounds/Christine's voice, creek in background \"so\" video05.mp3",
        //"christineCreek8": "Sounds/Christine's voice, creek in background \"the wind\" video05.mp3",
        //"christineCreek9": "Sounds/Christine's voice, creek in background \"yeah\" video05.mp3",
        //"christineCreek10": "Sounds/Christine's voice, creek in background \"yeah, it would been a\" video05.mp3",
        //"christineCreek11": "Sounds/Christine's voice, creek water in background01 video01.mp3",
        //"christineCreek12": "Sounds/Christine's voice, creek water in background01 video02.mp3",

        "owl": "Sounds/Owl.wav",
        "sword": "Sounds/Sword.wav",
        "Scream": "Sounds/Scream.wav",

        "creek1-1": "Sounds/Creek water sounds01 video01.mp3",
        "creek1-2": "Sounds/Creek water sounds01 video02.mp3",
        "creek1-3": "Sounds/Creek water sounds01 video03.mp3",
        "creek1-4": "Sounds/Creek water sounds01 video04.mp3",
        "creek1-5": "Sounds/Creek water sounds01 video05.mp3",

        "creek2-1": "Sounds/Creek water sounds02 video01.mp3",
        "creek2-2": "Sounds/Creek water sounds02 video03.mp3",
        "creek2-3": "Sounds/Creek water sounds02 video04.mp3",
        "creek2-4": "Sounds/Creek water sounds02 video05.mp3",

        "creek3-1": "Sounds/Creek water sounds03 video01.mp3",
        "creek3-2": "Sounds/Creek water sounds03 video04.mp3",
        "creek3-3": "Sounds/Creek water sounds03 video05.mp3",

        "creek4-1": "Sounds/Creek water sounds04 video01.mp3",
        "creek4-2": "Sounds/Creek water sounds04 video05.mp3",
        "creek5-1": "Sounds/Creek water sounds05 video05.mp3",
        "creek6-1": "Sounds/Creek water sounds06 video05.mp3",
        "creek7-1": "Sounds/Creek water sounds07 video05.mp3"
    };

    for(var key in allSounds){
        WebAudio.loadSoundSource(allSounds[key], key);
    }

}

