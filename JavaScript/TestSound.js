
// TestSound: A playground for testing the effects of AudioNodes
function TestSound (source, options /* HTML Canvas */) {
	Sound.call(this, source);

	this.position = new Vector(0, 1, 0);	// Location in the scene.
	this.direction = new Vector(0, 0, 1);	// Direction the noise is facing.  Always has a vector length of 1.
	
	this.pannerNode = null;
	this.sourceNode1 = null;
	this.sourceNode2 = null;
	this.analyzerNode1 = null;
	this.analyzerNode2 = null;
	
	var panner = WebAudio.context.createPanner();
	panner.panningModel = 'HRTF';	// 'head-related transfer function'
	panner.distanceModel = 'inverse';	// [linear, inverse, exponential]
	panner.refDistance = 1;
	panner.maxDistance = 10000;
	panner.rolloffFactor = 1;
	panner.coneInnerAngle = 360;
	panner.coneOuterAngle = 0;
	panner.coneOuterGain = 0;
	panner.setPosition(this.position.x, this.position.y, this.position.z);
	panner.setOrientation(this.direction.x, this.direction.y, this.direction.z);
	this.pannerNode = panner;

	this.createNodeGraph();

	this.outputCanvas = null;
	if (options.outputCanvas)	this.outputCanvas = new Canvas2D(options.outputCanvas);

	if (this.outputCanvas) {
		this.outputCanvas.setProjectionFromBottomLeft(0, 0, this.outputCanvas.width);		// Create coord system where the left = 0 and right = 1.
		var self = this;
		this.intervalID = setInterval(function () { self.redraw(); }, 50);	// Fire an event to redraw 10/sec
	}
}
TestSound.prototype = Object.create(Sound.prototype);
TestSound.prototype.constructor = TestSound;

// Private. Create the node graph for this sound.
TestSound.prototype.createNodeGraph = function () {

	var context = WebAudio.context;

	this.analyzerNode1 = context.createAnalyser();
	this.analyzerNode1.fftSize = 512;		// Fast-fourier transform domain size. Must be power of 2 from 32 to 32768.  
	this.analyzerNode2 = context.createAnalyser();
	this.analyzerNode2.fftSize = 512;		// Fast-fourier transform domain size. Must be power of 2 from 32 to 32768.  


	// Sound 1
	this.sourceNode1 = this.createSourceNode();
	this.sourceNode1.loop = true;
	//this.sourceNode1.connect(this.analyzerNode1);		// no audio output.
	
	// Sound 2
	this.sourceNode2 = this.createSourceNode();
	this.sourceNode2.loop = true;
	var splitter = context.createChannelSplitter(2);
		
	this.sourceNode2.connect(this.pannerNode);
	this.pannerNode.connect(splitter);
	splitter.connect(this.analyzerNode1, 0);
	splitter.connect(this.analyzerNode2, 1);
	

	//this.pannerNode.connect(this.analyzerNode2, 1);
	this.analyzerNode2.connect(WebAudio.outputNode);
}

TestSound.prototype.play = function () {
	this.sourceNode1.start(WebAudio.context.currentTime);
	this.sourceNode2.start(WebAudio.context.currentTime);
}

TestSound.prototype.setPosition = function (vec) {
	this.position.set(vec);
	if (this.pannerNode)
		this.pannerNode.setPosition(this.position.x, this.position.y, this.position.z);
}

TestSound.prototype.setDirection = function (vec) {
	this.direction.set(vec);
	this.direction.normalize();

	if (this.pannerNode)
		this.pannerNode.setOrientation(this.direction.x, this.direction.y, this.direction.z);  // forward direction x, y, z, up vector x, y, z
}

TestSound.prototype.setLocation = function (pos, dir) {
	this.setPosition(pos);
	this.setDirection(dir);
}

TestSound.prototype.redraw = function () {

	if (!this.analyzerNode1 || !this.outputCanvas) 
		return;

	var canvas = this.outputCanvas;
	var height = canvas.getTopY();
	canvas.clear('rgb(200, 200, 200)');
		
	var outlineColor = "rgb(30, 30, 30)";
	var fillColor = 'rgb(50, 50, 240)';

	var size = this.analyzerNode1.frequencyBinCount;
	var dataArray1 = new Uint8Array(size);
	this.analyzerNode1.getByteTimeDomainData(dataArray1);
	var barWidth = 1.0 / dataArray1.length;

	var dataArray2 = new Uint8Array(size);
	this.analyzerNode2.getByteTimeDomainData(dataArray2);

	var dataArray3 = new Uint8Array(size);
	for (var i = 0; i < dataArray1.length; i++)
		dataArray3[i] = dataArray2[i] - dataArray1[i] + 128;
	
	
	var drawData = function (data, startY, height) {
		for (var i = 0; i < data.length; i++) {
			canvas.drawRectangle(barWidth * i, // x
									startY, // y
									barWidth,	// width
									data[i] / 255.0 * height,
									outlineColor, fillColor);
		}
	};


	drawData(dataArray1, height / 3 * 2, height / 3);
	drawData(dataArray2, height / 3 * 1, height / 3);
	drawData(dataArray3, height / 3 * 0, height / 3);

	

}

TestSound.prototype._onEnded = function () {
	
	Sound.prototype._onEnded.call(this);

	if (this.intervalID)
		clearInterval(this.intervalID);
}
