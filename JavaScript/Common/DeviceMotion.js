// Singleton that monitors the accelerometer of a device.

var DeviceMotion =
{
	azimuth: 0,					// [0:360] The number of CCW degrees the device is pointing in relation to the start value.  For instance, turning CW 90 degrees will output 270.
	pitch: 0,					// [-180:180] The angle up or down.  Flat on table: 0   Looking foward on xy plane: 90  Pointing up (or flat upside down): 180/-180 (beta)
	roll: 0,						// [-90:90] The roll left or right.  Flat: 0, Roll to right: 90, Roll to left: -90, Upside down: 0 (gamma)
	acceleration: new Vector(),	// Accelleration in 3 axes in m/s2  (not interesting to us?)
	interval: 0,				// How often data is obtained, in ms.  Returned by the motion event.  IPhone: 60/sec.
	upsideDown: false,		// The phone's screen is pointing toward the ground.  Needed because the roll value is ambiguous.

	subscribers: [],			// Objects that are subscribed to motion updates
	callbackFreq: 100,		// Frequency to call the callback, because otherwise it would call 60/sec.  In milliseconds
	lastTick: null,

	origMatrix: null,	// The original orientation matrix from the sensors when this object was invoked.
	curMatrix: new Matrix(),	// The current rotation matrix from the sensors
	
	statusElement: null,

	init: function () {
		var self = this;
		if (window.DeviceOrientationEvent) {
			window.addEventListener('deviceorientation', function (ev) {  self.onDeviceOrientation(ev);  }, true);
		}
		if (window.DeviceMotionEvent) {
			window.addEventListener('devicemotion', function (ev) { self.onDeviceMotion(ev);  }, true);
		}

		this.statusElement = document.getElementById("deviceMotionOutput");
		this.lastTick = Math.round(Date.now() / this.callbackFreq);	
		this.updateStatus();
	},

	// The direction pointing out the left side of the phone
	getLeftVec: function () {
		return this.curMatrix.getXAxisH();
	},

	// The direction the screen is facing on a phone
	getOutVec: function () {
		return this.curMatrix.getYAxisH();
	},

	// The direction the front of the phone is facing
	getForwardVec: function () {
		return this.curMatrix.getZAxisH();
	},

	// The passed object recieves notifications when the orientation has changed.
	subscribe: function (obj) {
		if (!obj.onMotionUpdate)
			console.out("Motion subscriber must have implemented onMotionUpdate()!")
		else
			this.subscribers.push(obj);
	},

	unsubscribe: function (obj) {
		for (var i = 0; i < this.subscribers.length; i++) {
			if (this.subscribers[i] == obj)
				this.subscribers.splice(i, 1);
		}
	},

	updateStatus: function () {
		if (this.statusElement) {
			var msg = "Azimuth: " + this.azimuth.toFixed(0) + "<br>" +
						 "Pitch: " + this.pitch.toFixed(0) + "<br>" +
						 "Roll: " + this.roll.toFixed(0) + "<br>" +
						 "Acceleration: " + this.acceleration.toString(3) + "<br>" +
						 "Interval: " + this.interval + "<br>" +
						 "Forward: " + this.getForwardVec().toString(2) + "<br>" +
						 "Out: " + this.getOutVec().toString(2) + "<br>" +
						 "Left: " + this.getLeftVec().toString(2) + "<br>" +
						 "Upside Down: " + this.upsideDown;
					
			this.statusElement.innerHTML = msg;
		}

		// Notify subscribes if enough time has passed.
		var thisTick = Math.round(Date.now() / this.callbackFreq);
		if (thisTick > this.lastTick) {
			this.lastTick = thisTick;
			for (var i = 0; i < this.subscribers.length; i++) {
				this.subscribers[i].onMotionUpdate();
			}
		}
	},

	updateMatrices: function () {
		var yForward = Math.sin(MathExt.degToRad(this.pitch));
		var xForward = Math.sin(MathExt.degToRad(this.azimuth)) * Math.cos(MathExt.degToRad(this.pitch));
		var zForward = Math.cos(MathExt.degToRad(this.azimuth)) * Math.cos(MathExt.degToRad(this.pitch));
		var forwardVec = new Vector(xForward, yForward, zForward);		// Points out the front of the phone
		
		var outVec = new Vector(0, 1, 0);	// Points out of the phone
		this.upsideDown = Math.abs(this.pitch) > 90;
		var xVec = this.upsideDown ? forwardVec.cross(outVec) : outVec.cross(forwardVec);
		xVec.normalize();
		rotMatrix = new Matrix();
		rotMatrix.setToRotation(forwardVec.x, forwardVec.y, forwardVec.z, MathExt.degToRad(this.roll));
		rotMatrix.applyToVec(xVec);
		xVec.normalize();		// Should have done nothing

		outVec = forwardVec.cross(xVec);
		this.curMatrix.setAxes(xVec, outVec, forwardVec);

		if (!this.origMatrix)
			this.origMatrix = this.curMatrix;
		this.updateStatus();
	},

	onDeviceOrientation: function (ev) {
		if (ev.beta && ev.gamma && ev.alpha) {		// These may be null (if no accelerometer?)
			this.azimuth = ev.alpha;
			this.pitch = ev.beta;
			this.roll = ev.gamma;
			this.updateMatrices();
			this.updateStatus();
		}
	},

	onDeviceMotion: function (ev) {
		if (ev.interval)
			this.interval = ev.interval;
		if (ev.acceleration.x) {
			this.acceleration.set(ev.acceleration.x, ev.acceleration.y, ev.acceleration.z);
			this.updateStatus();
		}
	}








};