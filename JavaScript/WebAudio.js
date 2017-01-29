
// Library for audio effects playable on a website.
// Based on: https://www.html5rocks.com/en/tutorials/webaudio/intro/

function Sound(url, alias)  {
    this.url = url;
    this.alias = alias;
    this.response = null;
    this.buffer = null;     // AudioBuffer object
    this.loaded = false;
    

}

Sound.prototype.load = function () {
    if (!this.url)
        console.log("No URL defined in Sound object");

    var self = this;

    var request = new XMLHttpRequest();
    request.open('GET', this.url, true /* async */);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        self.response = request.response;
        self.decode();
    };
    request.onerror = function (msg) {
        console.log(msg);
    };
    request.send();
}

Sound.prototype.decode = function () {
    if (this.response == null)
        return;

    var self = this;
    WebAudio.context.decodeAudioData(self.response,
        function (buffer /* AudioBuffer */) {   // Success
            self.buffer = buffer;
            self.loaded = true;
        },
        function (e) {     // Error
            console.log("Error decoding audio file: " + self.alias);
        });
}

Sound.prototype.play = function () {

    if (!this.loaded) {
        console.log("Sound " + this.alias + "not yet loaded.");
        return;
    }

    var context = WebAudio.context;
    var source = context.createBufferSource(); // creates a sound source
    source.buffer = this.buffer;                    // tell the source which sound to play
    source.connect(context.destination);       // connect the source to the context's destination (the speakers)
    source.start(0);                           // play the source now
}


var WebAudio = 
{
    context: null,
    soundMap: [],           // Map of sound aliases to Sound objects.


    init: function () {

        if (!window.AudioContext) {
            if (window.webkitAudioContext) {
                window.AudioContext = window.webkitAudioContext;
                console.log("Using webkit audio context");
            }
            else {
                alert("Web Audio API is not supported in this browser");
            }
        }
        this.context = new AudioContext();
    },

    load: function (url, alias) {
        
        var newSound = new Sound(url, alias);
        this.soundMap[alias] = newSound;
        newSound.load();
    },

    decode: function (alias) {
        var sound = this.soundMap[alias];
        if (!sound)
            console.log("Sound " + alias + "does not exist");
        sound.decode();
    },

    play: function (alias) {

        var sound = this.soundMap[alias];
        if (!sound)
            console.log("Sound " + alias + "does not exist");
        sound.play();
    }


}