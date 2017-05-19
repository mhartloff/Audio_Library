﻿
// The environment the sounds are played
// All units in meters.
function Scene() {

	// Location information
	this.position = new Vector();	// The position of the listener
	this.orientation = new Matrix();	// The orientation of the listener
	//this.earInfo = new EarInfo();		// Used by the SpatialSound objects (if not using SpatialSound this is not relevant)
	this.listener = WebAudio.context.listener;	// Used by the PannerSound objects
	this.setPosition(0, 0, 0);
	this.setOrientationAxes(new Vector(-1, 0, 0), new Vector(0, 1, 0), new Vector(0, 0, -1));

	// Graphics and UI
	this.canvas = null;			// Canvas2D object which the scene is displayed (optional)
	this.needsRedraw = false;
	this.lastRedrawTime = null;
	this.selectedObject = null;

	var self = this;
	this.intervalID = setInterval(function () { self.redraw(); }, 100);	// Fire an event to redraw 10/sec

	this.nextID = 0;	
	this.objects = {};			// Map of all objects in the scene.  ID -> SceneObject
	
	// Subscribe to orientation messages sent from devices like a phone.
	this.usePhoneOrientation = true;	
	if (this.usePhoneOrientation)
		DeviceMotion.subscribe(this);
}


Scene.prototype.destroy = function () {
	clearInterval(this.intervalID);
}

Scene.prototype.setCanvas = function (canvasElement /* HTML Canvas */) {
	this.canvas = new Canvas2D(canvasElement);
	this.canvas.setProjection(0, 0, 40);	 // Center at 0, 0.  40 pixels per unit.

	var self = this;
	this.canvas.onMouseDown =	function (x, z) { self.onMouseDown(x, z); };
	this.canvas.onMouseUp =		function (x, z) { self.onMouseUp(x, z); };
	this.canvas.onMouseMove =	function (x, z) { self.onMouseMove(x, z); };
	this.canvas.onKeyDown = function (key, x, z) { return self.onKeyDown(key, x, z); };	// returns if it was handled

	// Touch functionality
	this.canvas.limitTo1Touch = true;
	this.canvas.onTouchStart = function (touch) { self.onTouchStart();  }
	this.canvas.onTouchMove = function (touch) { self.onTouchStart();   }
	this.canvas.onTouchEnd = function (touch)  { self.onTouchEnd();  }
	
	this.needsRedraw = true;
}

Scene.prototype.getLeftVec = function () {
	return this.orientation.getXAxisH();
}

Scene.prototype.getUpVec = function () {
	return this.orientation.getYAxisH();
}

Scene.prototype.getDirection = function () {
	return this.orientation.getZAxisH();
}

// The position of the listener
Scene.prototype.getPosition = function () {
	return this.position;
}

Scene.prototype.updateEarInfo = function () {
	//this.earInfo.update(this.position, this.getLeftVec());
}

Scene.prototype.setPosition = function (xOrVec, y /* opt */, z /* opt */) {
	this.position.set(xOrVec, y, z);
	this.listener.setPosition(this.position.x, this.position.y, this.position.z);
	this.updateEarInfo();
	this.needsRedraw = true;
}

// The orientation of the listener.  X-Axis is left, Y-Axis is Up, Z-Axis is forward.
Scene.prototype.setOrientation = function (orientation /* Matrix */) {
	this.orientation.set(orientation);
	var e = this.orientation.e;		// Grab the values directly from the matrix.
	// [forward.x, forward.y, forward.z, up.x, up.y, up.z]
	this.listener.setOrientation(e[8], e[9], e[10], e[4], e[5], e[6]);
	this.updateEarInfo();
	this.needsRedraw = true;
}

Scene.prototype.setOrientationAxes = function (xAxis /* left */, yAxis /* up */, zAxis /* forward */) {
	this.orientation.setAxes(xAxis, yAxis, zAxis);
	var e = this.orientation.e;		// Grab the values directly from the matrix.
	this.listener.setOrientation(e[8], e[9], e[10], e[4], e[5], e[6]);
	this.updateEarInfo();
	this.needsRedraw = true;
}

// Add an object to the scene
Scene.prototype.addObject = function (sceneObject) {
	sceneObject.scene = this;
	sceneObject.sceneID = this.nextID++;
	this.objects[sceneObject.sceneID] = sceneObject; 
	this.needsRedraw = true;
}

// Remove an object from the scene.
Scene.prototype.removeObject = function (sceneObject) {
	delete this.objects[sound.sceneID];
	this.needsRedraw = true;
}

// Callback from the DeviceMotion object
Scene.prototype.onMotionUpdate = function () {
	// Disable for now.
	//this.setOrientationAxes(DeviceMotion.getLeftVec(), DeviceMotion.getForwardVec(), DeviceMotion.getOutVec());
}

Scene.prototype.stopAllSounds = function () {
	for (var id in this.objects) {
		if (this.objects.hasOwnProperty(id)) {
			var obj = this.objects[id];
			obj.stop();
		}
	}
}

Scene.prototype.onMouseDown = function (x, z) {
	
	var clickLoc = new Vector(x, 0, z);
	for (var id in this.objects) {
		if (this.objects.hasOwnProperty(id)) {
			var obj = this.objects[id];
			if (obj.getPosition().distance(clickLoc) < 0.3) {
				this.selectedObject = obj;
				this.needsRedraw = true;
				break;
			}
		}
	}		
}

Scene.prototype.onMouseUp = function (x, z) {
	this.selectedObject = null;
	this.needsRedraw = true;
}

Scene.prototype.onMouseMove = function (x, z) {

	if (this.selectedObject) {
		this.selectedObject.setPosition(new Vector(x, 0, z));
	}
}

Scene.prototype.onTouchStart = function (touch) {

}

Scene.prototype.onTouchMove = function (touch) {

}

Scene.prototype.onTouchEnd = function (touch) {

}

Scene.prototype.onKeyDown = function (keyCode, x, z) {
	
	console.log("Key '" + keyCode + "' pressed at: " + x + ", " + z);
	var handled = false;
	switch (keyCode) {
		case 37: {   // left arrow
			this.setPosition(this.position.x - 0.1, this.position.y, this.position.z);
			handled = true;
			break;
		}
		case 38: {   // up arrow
			this.setPosition(this.position.x, this.position.y, this.position.z - 0.1);
			handled = true;
			break;
		}
		case 39: {   // right arrow
			this.setPosition(this.position.x + 0.1, this.position.y, this.position.z);
			handled = true;
			break;
		}
		case 40: {   // down arrow
			this.setPosition(this.position.x, this.position.y, this.position.z + 0.1);
			handled = true;
			break;
		}
	}
	return handled;
}

Scene.prototype.redraw = function () {

	var canvas = this.canvas;
	if (!this.canvas) {
		return;
	}

	var interval = this.lastRedrawTime ? Date.now() - this.lastRedrawTime : 0.0;
	this.lastRedrawTime = Date.now();

	if (interval > 0 && canvas.hasTouches()) {
		// Move the character if there is a current touch
		var touch = canvas.getFirstTouch();
		
		var el = document.getElementById("debug");
		el.innerHTML = touch;  // fromCenter.x + ", " + fromCenter.y;

		var fromCenter = canvas.distanceFromCenter(touch.canvasX, touch.canvasY);

		var movePerSec = 3.0;
		//var maxDistance = 200;
		this.setPosition(this.position.x + (fromCenter.x / 200) * (movePerSec * (interval / 1000)),
							  this.position.y,
							  this.position.z + (fromCenter.y / 200) * (movePerSec * (interval / 1000)));

		//console.log("Distance From Center: " + fromCenter.x + ", " + fromCenter.y);
		
	}
	
	if (!this.needsRedraw)
		return;

	this.needsRedraw = false;
	canvas.clear('rgb(200, 200, 200)');

	// Draw the axes and the tics.
	canvas.drawLine(-1000, 0, 1000, 0, "rgb(50, 50, 50)");
	canvas.drawLine(0, -1000, 0, 1000, "rgb(50, 50, 50)");

	var tic = .25;
	canvas.drawLine(-tic, 5, tic, 5, "rgb(100, 100, 100)");	// draw a tick at 5.
	canvas.drawText("+5X", 4.6, -tic * 1.25);
	canvas.drawLine(-tic, -5, tic, -5, "rgb(100, 100, 100)");	// draw a tick at 5.

	canvas.drawLine(5, -tic, 5, tic, "rgb(100, 100, 100)");	// draw a tick at 5.
	canvas.drawText("+5Z", tic * 1.25, 4.9);
	canvas.drawLine(-5, -tic, -5, tic, "rgb(100, 100, 100)");	// draw a tick at 5.
	
	// Draw the player
	var pos = this.position;
	var dir = this.getDirection();
	dir.setLength(1.0);		
	canvas.drawCircle(pos.x, pos.z, 6 /* radius */, "rgb(10, 10, 10)", "rgb(50, 50, 200)");
	canvas.drawLine(pos.x, pos.z, pos.x + dir.x, pos.z + dir.z, "rgb(255, 0, 0)");

	// Draw each object
	for (var id in this.objects) {
		if (this.objects.hasOwnProperty(id)) {
			var obj = this.objects[id];
			var pos = obj.getPosition();
			var fillColor = obj.isPlaying ? "rgb(200, 50, 50)" : "rgb(50, 200, 50)";
			if (this.selectedObject == obj)
				fillColor = "rgb(200, 200, 50)";
			canvas.drawCircle(pos.x, pos.z, 12, "rgb(10, 10, 10)", fillColor);
			var dir = obj.getDirection().clone();
			dir.mult(0.50);	// Set the length of the line
			canvas.drawLine(pos.x, pos.z, pos.x + dir.x, pos.z + dir.z, "rgb(20, 20, 100)");
			if (obj.alias)
				canvas.drawText(obj.alias, pos.x - 0.3, pos.z - 0.3, "rgb(60, 60, 120)");
		}
	}


	
}
