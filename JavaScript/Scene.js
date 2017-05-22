﻿
// The environment the sounds are played
// All units in meters.
function Scene() {

	// Location information
	this.position = new Vector();	// The position of the player
	this.orientation = new Matrix();	// The orientation of the player
	//this.earInfo = new EarInfo();		// Used by the SpatialSound objects (if not using SpatialSound this is not relevant)
	this.listener = WebAudio.context.listener;	// Used by the PannerSound objects.  Contains the player's orientation for proper sound.
	this.setPlayerPosition(0, 0, 0);
	this.setOrientationAxes(new Vector(-1, 0, 0), new Vector(0, 1, 0), new Vector(0, 0, -1));

	// Params that may be set
	this.touchMinZone = 50;		// The radius from the center where if a touch occurs within, it has no effect.
	this.touchMaxZone = 200;	// The radius from the center where if the touch is any further it has no additional effect. 
	this.maxVelocity = 3.0;		// The fastest in meters / sec that the user can move forward.
	this.maxSideVelocity = 2.0;// The fastest in meters / sec that the user can move to the side.
	this.maxBackVelocity = 2.0;// The fastest in meters / sec that the user can move backwards.

	// Graphics and UI
	this.canvas = null;			// Canvas2D object which the scene is displayed (optional)
	this.needsRedraw = false;
	this.lastRedrawTime = null;
	this.selectedObject = null;

	{
		// Settings that effect the range of movement allowed.
		this.rSideRange1 = new Range(MathExt.degToRad(360 - 20), MathExt.degToRad(360));
		this.rSideRange2 = new Range(MathExt.degToRad(0), MathExt.degToRad(20));
		this.forwardRange = new Range(MathExt.degToRad(270 - 35), MathExt.degToRad(270 + 35));
		this.lSideRange = new Range(MathExt.degToRad(180 - 20), MathExt.degToRad(180 + 20));
		this.backRange = new Range(MathExt.degToRad(90 - 30), MathExt.degToRad(90 + 30));
		this.rotateSize = 40;  // pixels from the min circle that the 'rotate only' circle will lie.
	}

	// Touch params
	this.lastTouchPos = null;	// The position of the touch the last time it was recorded.
	this.moveMode = "none";	//   Movement mode.  'none' | 'forward' | 'head' | 'back' | 'side'
	this.moveInitialAngle = 0.0;	// The angle of the player object when the user entered the 'forward zone'.

	var self = this;
	this.intervalID = setInterval(function () { self.redraw(); }, 50);	// Fire an event to redraw 10/sec

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
	this.canvas.setProjection(this.position.x, this.position.z, 40);	 // Center at 0, 0.  40 pixels per unit.
	
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

// The position of the player
Scene.prototype.getPlayerPosition = function () {
	return this.position;
}

Scene.prototype.updateEarInfo = function () {
	//this.earInfo.update(this.position, this.getLeftVec());
}

// Set the player position (the player)
Scene.prototype.setPlayerPosition = function (xOrVec, y /* opt */, z /* opt */) {
	this.position.set(xOrVec, y, z);
	this.listener.setPosition(this.position.x, this.position.y, this.position.z);
	if (this.canvas)
		this.canvas.setCenter(this.position.x, this.position.z);
	this.updateEarInfo();
	this.needsRedraw = true;
}

// The orientation of the player.  X-Axis is left, Y-Axis is Up, Z-Axis is forward.
Scene.prototype.setOrientation = function (orientation /* Matrix */) {
	this.orientation.set(orientation);
	var e = this.orientation.e;		// Grab the values directly from the matrix.
	// setOrientation: [forward.x, forward.y, forward.z, up.x, up.y, up.z]
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

// Get the player's current direction as an angle from (1, 0)
Scene.prototype.getPlayerDirectionA = function () {
	var dir = this.getPlayerDirection();
	var vec2 = new Vector2(dir.x, dir.z);
	return vec2.angle();
}

// Get the player's forward orientation
Scene.prototype.getPlayerDirection = function () {
	var dir = this.orientation.getZAxisH();
	return dir;
}

// Set the player's direction on the xz plane as an angle from (1, 0)
Scene.prototype.setPlayerDirectionA = function (dir /* Number */)
{
	this.setPlayerDirection(new Vector(Math.cos(dir), 0.0, Math.sin(dir)));
}

// Set a player's direction on the xz plane.
Scene.prototype.setPlayerDirection = function (dir /* Vec3 */)  {
	this.setOrientationAxes(dir.cross(new Vector(0, 1, 0)), new Vector(0, 1, 0), dir);
}

// Rotates the player on the xz plane
Scene.prototype.rotatePlayer = function (degrees) {
	var rotAxis = this.orientation.getYAxisH();
	var matrix = this.orientation.rotate(rotAxis.x, rotAxis.y, rotAxis.z, MathExt.degToRad(degrees));
	this.setOrientation(matrix);
	this.needsRedraw = true;
}

// Move a player with respect the player's orientation.
// For instance, passing (0, 0, 1) would move the player forward 1 unit.
Scene.prototype.movePlayer = function (vec) {
	var transformMatrix = this.orientation; //.inverted();		// Transform from player space to world space
	var transformedVec = vec.clone();
	transformMatrix.applyToVec(transformedVec);
	this.setPlayerPosition(this.getPlayerPosition().add(transformedVec));
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
	delete this.objects[sceneObject.sceneID];
	this.needsRedraw = true;
}

// Callback from the DeviceMotion object, which reports the orientation of the phone.
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

Scene.prototype.onTouchStart = function (touchEvent) {
	this.needsRedraw = true;
}

Scene.prototype.onTouchMove = function (touchEvent) {
	this.needsRedraw = true;
}

Scene.prototype.onTouchEnd = function (touchEvent) {
	this.needsRedraw = true;
}

Scene.prototype.onKeyDown = function (keyCode, x, z) {
	
	console.log("Key '" + keyCode + "' pressed at: " + x + ", " + z);
	var handled = false;
	switch (keyCode) {
		case 37: {   // left arrow
			this.movePlayer(new Vector(0.2, 0, 0));
			handled = true;
			break;
		}
		case 38: case 87: {   // up arrow, W
			this.movePlayer(new Vector(0, 0, 0.2));
			handled = true;
			break;
		}
		case 39: {   // right arrow
			this.movePlayer(new Vector(-0.2, 0, 0));
			handled = true;
			break;
		}
		case 40: case 83: {   // down arrow, S
			this.movePlayer(new Vector(0, 0, -0.2));
			handled = true;
			break;
		}
		case 65: {  // A
			this.rotatePlayer(10.0);
			handled = true;
			break;
		}
		case 68: {  // D
			this.rotatePlayer(-10.0);
			handled = true;
			break;
		}
	}
	return handled;
}

// Move the player according to any touches currently 
Scene.prototype.updateTouchMovement = function (interval /* in ms */) {
	
	var canvas = this.canvas;
	if (!this.canvas)
		return;

	var hasTouches = canvas.hasTouches();
	if (!hasTouches) {
		this.lastTouchPos = null;
		this.moveMode = "none";
		return;
	}

	if (interval == 0) {
		return;
	}
		
	var touch = canvas.getFirstTouch();
	var vecFromCenter = canvas.vecFromCenter(touch.canvasX, touch.canvasY);
	var magnitude = vecFromCenter.length();
	var angle = vecFromCenter.angle();
	
	// Update which zone the touch is in.
	if (magnitude >= this.touchMinZone) {
		if (this.moveMode == "none") {
			if (this.forwardRange.contains(angle))  {
				this.moveMode = "forward";
				this.moveInitialAngle = this.getPlayerDirectionA();
			}
			else if (this.lSideRange.contains(angle))  {
				this.moveMode = "left";
				this.moveInitialAngle = this.getPlayerDirectionA();
			}
			else if (this.rSideRange1.contains(angle) || this.rSideRange2.contains(angle))  {
				this.moveMode = "right";
				this.moveInitialAngle = this.getPlayerDirectionA();
			}
			else if (this.backRange.contains(angle))  {
				this.moveMode = "back";
				this.moveInitialAngle = this.getPlayerDirectionA();
			}
		}
	}
	else {
		this.lastTouchPos = null;
		this.moveMode = "none";
		return;
	}
	//else if (Math.abs(vecFromCenter.x) < 30 && Math.abs(vecFromCenter.y) < 50 && (this.moveMode == "none")) {
	//	this.moveMode = "head";
	//}
					
	console.log(this.moveMode);

	var zoneRange = this.touchMaxZone - this.touchMinZone;
	magnitude -= this.touchMinZone;
	magnitude = Math.min(zoneRange, magnitude);
	
	if (this.moveMode == "forward") {	
		vecFromCenter.normalize();
		this.setPlayerDirectionA(this.moveInitialAngle + (angle - MathExt.degToRad(270)));
		magnitude -= this.rotateSize;		// Moving within the inner circle will reorient the player without moving them.
		if (magnitude > 0) {
			var moveLength = vecFromCenter.length() * (magnitude / zoneRange) * this.maxVelocity * (interval / 1000);
			this.movePlayer(new Vector(0.0, 0.0, moveLength));
		}
	}
	if (this.moveMode == "left") {
		vecFromCenter.normalize();
		this.setPlayerDirectionA(this.moveInitialAngle + (angle - MathExt.degToRad(180)));
		magnitude -= this.rotateSize;		
		if (magnitude > 0) {
			var moveLength = vecFromCenter.length() * (magnitude / zoneRange) * this.maxSideVelocity * (interval / 1000);
			this.movePlayer(new Vector(-moveLength, 0.0, 0.0))
		}
	}
	if (this.moveMode == "right") {
		vecFromCenter.normalize();
		this.setPlayerDirectionA(this.moveInitialAngle + angle);
		magnitude -= this.rotateSize;		
		if (magnitude > 0) {
			var moveLength = vecFromCenter.length() * (magnitude / zoneRange) * this.maxSideVelocity * (interval / 1000);
			this.movePlayer(new Vector(moveLength, 0.0, 0.0))
		}
	}
	if (this.moveMode == "back") {
		vecFromCenter.normalize();
		this.setPlayerDirectionA(this.moveInitialAngle + (angle - MathExt.degToRad(90)));
		magnitude -= this.rotateSize;
		if (magnitude > 0) {
			var moveLength = vecFromCenter.length() * (magnitude / zoneRange) * this.maxBackVelocity * (interval / 1000);
			this.movePlayer(new Vector(0.0, 0.0, -moveLength))
		}
	}
		
}

// The main game loop.
Scene.prototype.redraw = function () {

	var canvas = this.canvas;
	if (!this.canvas) {
		return;
	}

	var interval = this.lastRedrawTime ? Date.now() - this.lastRedrawTime : 0.0;
	this.lastRedrawTime = Date.now();

	this.updateTouchMovement(interval);
		
	if (!this.needsRedraw)
		return;

	this.needsRedraw = false;
	canvas.clear('rgb(230, 230, 230)');

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
	canvas.drawCircle(pos.x, pos.z, 0.2 /* radius */, "rgb(10, 10, 10)", "rgb(50, 50, 200)");
	canvas.drawLine(pos.x, pos.z, pos.x + dir.x, pos.z + dir.z, "rgb(255, 0, 0)");

	// Draw each object
	for (var id in this.objects) {
		if (this.objects.hasOwnProperty(id)) {
			var obj = this.objects[id];
			var pos = obj.getPosition();
			var fillColor = obj.isPlaying ? "rgb(200, 100, 100)" : "rgb(100, 200, 100)";
			if (this.selectedObject == obj)
				fillColor = "rgb(200, 200, 50)";
			var outlineColor = "rgb(100,100,100)";
			canvas.drawCircle(pos.x, pos.z, 0.4, outlineColor, fillColor);
			// Draw a line indicating the direction the object is facing.
			var dir = obj.getDirection().clone();		
			dir.mult(0.50);	// Set the length of the line
			canvas.drawLine(pos.x, pos.z, pos.x + dir.x, pos.z + dir.z, "rgb(20, 20, 100)");
			if (obj.alias)
				canvas.drawText(obj.alias, pos.x - 0.3, pos.z - 0.3, "rgb(60, 60, 120)");
		}
	}

	// Draw the touch controls
	var center = canvas.getCenterC();

	var drawRadialLine = function (start, end, angle /* in radians */, color) {
		var p = new Vector2(Math.cos(angle), Math.sin(angle));
		var p1 = p.clone().setLength(start).add(center);
		var p2 = p.clone().setLength(end).add(center);
		canvas.drawLineVC(p1, p2, color);		
	}
	
	canvas.drawCircleC(center.x, center.y, this.touchMinZone, "rgb(100, 150, 240)", null /* fill */);		// The inner circle
	
	
	if (this.moveMode == "none") {	
		// forward area
		canvas.drawCircleC(center.x, center.y, this.touchMaxZone, "rgb(100, 150, 240)", null /* fill */, this.forwardRange.start, this.forwardRange.end);
		drawRadialLine(this.touchMinZone, this.touchMaxZone, this.forwardRange.start, "rgb(100, 150, 240)");
		drawRadialLine(this.touchMinZone, this.touchMaxZone, this.forwardRange.end, "rgb(100, 150, 240)");

		// left area
		canvas.drawCircleC(center.x, center.y, this.touchMaxZone, "rgb(150, 240, 100)", null /* fill */, this.lSideRange.start, this.lSideRange.end);
		drawRadialLine(this.touchMinZone, this.touchMaxZone, this.lSideRange.start, "rgb(150, 240, 100)");
		drawRadialLine(this.touchMinZone, this.touchMaxZone, this.lSideRange.end, "rgb(150, 240, 100)");

		// right area
		canvas.drawCircleC(center.x, center.y, this.touchMaxZone, "rgb(150, 240, 100)", null /* fill */, this.rSideRange1.start, this.rSideRange2.end);
		drawRadialLine(this.touchMinZone, this.touchMaxZone, this.rSideRange1.start, "rgb(150, 240, 100)");
		drawRadialLine(this.touchMinZone, this.touchMaxZone, this.rSideRange2.end, "rgb(150, 240, 100)");

		// back area
		canvas.drawCircleC(center.x, center.y, this.touchMaxZone, "rgb(240, 150, 100)", null /* fill */, this.backRange.start, this.backRange.end);
		drawRadialLine(this.touchMinZone, this.touchMaxZone, this.backRange.start, "rgb(240, 150, 100)");
		drawRadialLine(this.touchMinZone, this.touchMaxZone, this.backRange.end, "rgb(240, 150, 100)");

		//canvas.drawRectangleC(center.x - 50, center.y - 20, 100, 40, "rgb(180, 50, 50)");	// the 'head' region
	}
	if (this.moveMode == "forward") {
		canvas.drawCircleC(center.x, center.y, this.touchMinZone + this.rotateSize, "rgb(130, 180, 250)", null /* fill */);	// The middle circle
		canvas.drawCircleC(center.x, center.y, this.touchMaxZone, "rgb(100, 150, 240)", null /* fill */);	// The outer circle where movement in any direction is valid.
	}
	if (this.moveMode == "left" || this.moveMode == "right") {
		canvas.drawCircleC(center.x, center.y, this.touchMinZone + this.rotateSize, "rgb(180, 250, 130)", null /* fill */);	// The middle circle
		canvas.drawCircleC(center.x, center.y, this.touchMaxZone, "rgb(150, 240, 100)", null /* fill */);	// The outer circle where movement in any direction is valid.	
	}
	if (this.moveMode == "back") {
		canvas.drawCircleC(center.x, center.y, this.touchMinZone + this.rotateSize, "rgb(250, 180, 130)", null /* fill */);	// The middle circle
		canvas.drawCircleC(center.x, center.y, this.touchMaxZone, "rgb(240, 150, 100)", null /* fill */);	// The outer circle where movement in any direction is valid.	
	}
	
	var touch = canvas.getFirstTouch();
	if (touch)
		canvas.drawCircleC(touch.canvasX, touch.canvasY, 30, "rgb(60, 120, 150)", "rgb(120, 175, 220)");

}

