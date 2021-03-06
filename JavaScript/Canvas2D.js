﻿define(function (require) {
	
	var Vector2 = require("Common/Vector2");
	var Vector3 = require("Common/Vector3");
	var Matrix = require("Common/Matrix");

	function Canvas2D(canvasElement) {

		var self = this;

		this.domElement = canvasElement;
		this.width = canvasElement.width;		// Width in pixels
		this.height = canvasElement.height;		// Height in pixels
		this.context = canvasElement.getContext('2d');
		this.context.font = "12px Arial";
		this.invertY = false;

		this.lookAt = new Vector2(0, 0);
		this.upDir = new Vector3(0, 1, 0);
		this.projMatrix = new Matrix();
		this.rotMatrix = new Matrix();
		this.translationMatrix = new Matrix();
		this.matrix = new Matrix();
		//this.invMatrix = new Matrix();

		this.mousePosition = null;		// The last location of the mouse cursor, in canvas coordinates.
		this.selectedPos = null;		// The last position selected by the user, in scene space.
		this.limitTo1Touch = false;
		this.currentTouches = {};		// The touches currently active, keyed by the touch identifier.
	
		canvasElement.className += canvasElement.className ? ' canvas2D' : 'canvas2D';	// add the canvas2D css.
		canvasElement.onmousedown = function (ev) { self._onMouseDown(ev); };
		canvasElement.onmouseup = function (ev) { self._onMouseUp(ev); }
		canvasElement.onmousewheel = function (ev) { self._onMouseWheel(ev); }
		document.addEventListener('mousemove', function (ev) { self._onMouseMove(ev); }, false);
		document.addEventListener('keydown', function (ev) { self._onKeyDown(ev); }, false);
		document.addEventListener('touchstart',  function (ev) { self._onTouchStart(ev); }, false);
		document.addEventListener('touchend',	  function (ev) { self._onTouchEnd(ev); }, false);
		document.addEventListener('touchcancel', function (ev) { self._onTouchEnd(ev); }, false);
		document.addEventListener('touchmove',   function (ev) { self._onTouchMove(ev); }, false);
		canvasElement.oncontextmenu = function (ev) { return false; };		// Disable right-click context menu
   
		// Callbacks that can be set.  Returns the coord of the event in scene space.
		this.onMouseDown = null;		// function (x, y)
		this.onMouseUp = null;			// function (x, y)
		this.onMouseMove = null;		// function (x, y)
		this.onMouseWheel = null;		// function (delta)
	
		// The bottom left in projection coordinate system.  Note that the y is inverted so the bottom is the lowest y.
		this.xLeft = 0;	 
		this.yLow = 0;			// Either the top if 'invertY' is false or the bottom if it is true.
		this.pixelsPerUnit = 1;
	}

	Canvas2D.prototype.clear = function (color)  {
		// clear the canvas
		var context = this.context;
		context.fillStyle = color;
		context.fillRect(0, 0, this.width, this.height);
	}

	// Get the center in scene coordinates
	Canvas2D.prototype.getCenter = function () {
		return { x: this.xLeft + (this.width / 2.0 / this.pixelsPerUnit),
					y: this.yLow + (this.height / 2.0 / this.pixelsPerUnit)
		};
	}

	// Get the center in canvas coordinates
	Canvas2D.prototype.getCenterC = function () {
		return { x: this.width / 2.0,
					y: this.height / 2.0 
				  };
	}

	// Set the center of the canvas in scene coordinates
	Canvas2D.prototype.setCenter = function (x, y) {
		this.setProjection(x, y, this.pixelsPerUnit, this.invertY)
	}

	// Zoom the scene by a factor.  1.05 zooms in 5%, 95% would zoom out 5%.
	Canvas2D.prototype.zoom = function (factor) {

		var center = this.getCenter();
		this.pixelsPerUnit *= factor;
		this.setCenter(center.x, center.y);
		this.updateMatrices();
	}

	// Set which direction is up, in scene coordinates
	Canvas2D.prototype.setUpDirection = function (x, y) {
		this.upDir.set(x, y, 0);
		this.upDir.normalize();
		this.updateMatrices();
	}

	Canvas2D.prototype.setProjection = function (xCenter, yCenter, pixelsPerUnit, invertY) {
		this.xLeft = xCenter - (this.width / 2.0 / pixelsPerUnit);
		this.yLow = yCenter - (this.height / 2.0 / pixelsPerUnit);
		this.pixelsPerUnit = pixelsPerUnit;
		this.invertY = invertY ? false : invertY;

		this.lookAt.x = xCenter;
		this.lookAt.y = yCenter;
		this.updateMatrices();
	}

	Canvas2D.prototype.setProjectionFromTopLeft = function (xLeft, yTop, pixelsPerUnit) {
		this.xLeft = xLeft;
		this.yLow = yTop;
		this.pixelsPerUnit = pixelsPerUnit;
		this.invertY = false;
	}

	Canvas2D.prototype.setProjectionFromBottomLeft = function (xLeft, yBottom, pixelsPerUnit) {
		this.xLeft = xLeft;
		this.yLow = yBottom;
		this.pixelsPerUnit = pixelsPerUnit;
		this.invertY = true;
	}

	Canvas2D.prototype.getTopY = function () {
		return this.canvasToScene(0, 0).y;
	}

	Canvas2D.prototype.getBottomY = function () {
		return this.canvasToScene(0, this.height).y;
	}

	Canvas2D.prototype.getLeftX = function () {
		return this.canvasToScene(0, 0).x;
	}

	Canvas2D.prototype.getRightX = function () {
		return this.canvasToScene(this.width, 0).x;
	}

	Canvas2D.prototype.clientToCanvas = function (clientX, clientY) {
		var rect = this.domElement.getBoundingClientRect();
		return new Vector2(clientX - rect.left, clientY - rect.top);
	}

	// Get the distance from the center in canvas coordinates
	Canvas2D.prototype.vecFromCenter = function (canvasX, canvasY) {
		var rect = this.domElement.getBoundingClientRect();
		return new Vector2(canvasX - (rect.width / 2),
								 canvasY - (rect.height / 2));		// Flip the Y
	}

	Canvas2D.prototype.updateProjMatrix = function () {
		var rect = this.domElement.getBoundingClientRect();
		this.projMatrix.setToTranslation(rect.width / 2.0, rect.height / 2.0);
		this.projMatrix.e[0] = this.pixelsPerUnit;
		this.projMatrix.e[5] = this.pixelsPerUnit;
	}

	// Matrix stuff
	Canvas2D.prototype.updateMatrices = function () {

		this.updateProjMatrix();
	
		// Update the view matrix
		var zVec = new Vector3(0, 0, 1);
		this.rotMatrix.setFromOrientation(zVec, this.upDir);
		this.translationMatrix.setToTranslation(-this.lookAt.x, -this.lookAt.y);
	
		var resultMatrix = new Matrix();
		this.rotMatrix.multiply(this.translationMatrix, resultMatrix);
		this.projMatrix.multiply(resultMatrix, this.matrix /* out */);
		//this.matrix.invert(this.invMatrix /* out */);
	};

	// Converts client coordinates generally returned by the event objects to the projection coordinates.
	Canvas2D.prototype.clientToScene = function (clientX, clientY) {
		var p = this.clientToCanvas(clientX, clientY);
		return this.canvasToScene(p.x, p.y);
	}

	// Transform a 2D point from scene space to pixel space for drawing.
	Canvas2D.prototype.sceneToCanvas = function (x, y) {
	
		var vec = new Vector2(x, y);
		this.matrix.applyToVec2(vec);
		return vec;
	}

	Canvas2D.prototype.canvasToScene = function (x, y) {
		if (this.invertY)
			y = this.height - y;
		return new Vector2(x / this.pixelsPerUnit + this.xLeft,
								 y / this.pixelsPerUnit + this.yLow);
	}

	// Only forwards the message if it is within the canvas element.
	Canvas2D.prototype._onMouseDown = function (ev) {

		var p = this.clientToScene(ev.x, ev.y);
		this.selectedPos = p;

		if (this.onMouseDown)
			this.onMouseDown(p.x, p.y);
	}

	Canvas2D.prototype._onMouseUp = function (ev) {

		var p = this.clientToScene(ev.x, ev.y);

		if (this.onMouseUp)
			this.onMouseUp(p.x, p.y);
	}

	Canvas2D.prototype._onMouseMove = function (ev) {

		var p = this.clientToCanvas(ev.x, ev.y);
		this.mousePosition = p;
			
		if (p.x >= 0 && p.x < this.width &&
			 p.y >= 0 && p.y < this.height) {
			var s = this.canvasToScene(p.x, p.y);

			if (this.onMouseMove)
				this.onMouseMove(s.x, s.y);
		}
	}

	Canvas2D.prototype._onMouseWheel = function (ev) {
		var delta = ev.deltaY;

		if (this.onMouseWheel) {
			var handled = this.onMouseWheel(ev.deltaY);
			if (handled)
				ev.preventDefault();
		}
	}

	Canvas2D.prototype._onKeyDown = function (ev) {

		if (!this.mousePosition)
			return;

		var p = this.mousePosition;
		
		if (p.x >= 0 && p.x < this.width &&
			 p.y >= 0 && p.y < this.height) {
			var s = this.canvasToScene(p.x, p.y);

			if (this.onKeyDown)  {
				var handled = this.onKeyDown(ev.which, s.x, s.y);		// Pass back the key code and the location in the scene the mouse is at.
				if (handled)
					ev.preventDefault();
			}
		}
	}

	/* -- TOUCH FUNCTIONALITY ------------------------------ */

	Canvas2D.prototype.hasTouches = function () {
		for (var touchId in this.currentTouches) {
			if (this.currentTouches.hasOwnProperty(touchId)) {
				return true;
			}
		}
		return false;
	}

	Canvas2D.prototype.getTouches = function () {
		return this.currentTouches;
	}

	Canvas2D.prototype.getFirstTouch = function () {
		for (var touchId in this.currentTouches) {
			if (this.currentTouches.hasOwnProperty(touchId)) {
				return this.currentTouches[touchId];
			}
		}
		return null;
	}

	Canvas2D.prototype.updateTouchStatus = function () {
		var statusElement = document.getElementById("touchOutput");

		if (statusElement) {
			var msg = "";
			for (var touchId in this.currentTouches) {
				if (this.currentTouches.hasOwnProperty(touchId)) {
					var touch = this.currentTouches[touchId];
					msg += "Touch " + touch.identifier + ": " + touch.canvasX + ", " + touch.canvasY + "<br>";
				}
			}
			statusElement.innerHTML = msg;
		}
	
	}

	Canvas2D.prototype._onTouchStart = function (touchEvent) {

		if (this.limitTo1Touch == true && this.currentTouches >= 1)
			return;

		var newTouches = touchEvent.changedTouches;

		for (var i = 0; i < newTouches.length; i++) {
			var touch = newTouches[i];
			var p = this.clientToCanvas(touch.clientX, touch.clientY);
			// only add the touch if it is within the bounds of the canvas.
			if (p.x >= 0 && p.x < this.width &&	p.y >= 0 && p.y < this.height) {
				touch.canvasX = p.x;
				touch.canvasY = p.y;
				this.currentTouches[touch.identifier] = touch;
				touchEvent.preventDefault();
			}
		}

		if (this.onTouchStart)
			this.onTouchStart(touchEvent);

		this.updateTouchStatus();
	}

	Canvas2D.prototype._onTouchMove = function (touchEvent) {
		var touches = touchEvent.changedTouches;

		for (var i = 0; i < touches.length; i++) {
			var touch = touches[i];
			var curTouch = this.currentTouches[touch.identifier];

			if (curTouch) {
				var p = this.clientToCanvas(touch.clientX, touch.clientY);
				curTouch.canvasX = p.x;
				curTouch.canvasY = p.y;
				touchEvent.preventDefault();
			}
		}

		if (this.onTouchMove)
			this.onTouchMove(touchEvent);

		this.updateTouchStatus();
	}

	Canvas2D.prototype._onTouchEnd = function (touchEvent) {
		var touches = touchEvent.changedTouches;

		for (var i = 0; i < touches.length; i++) {
			delete this.currentTouches[touches[i].identifier];
		}

		if (this.onTouchEnd)
			this.onTouchEnd(touchEvent);

		this.updateTouchStatus();
	}


	/* -- DRAW FUNCTIONALITY ----------------- */

	// Draw a line in canvas coordinates using Vector2s
	Canvas2D.prototype.drawLineVC = function (p1 /* Vector2 */, p2 /* Vector2 */, color) {
	
		this.drawLineC(p1.x, p1.y, p2.x, p2.y, color);
	}

	// Draw a line in canvas coordinates
	Canvas2D.prototype.drawLineC = function (x1, y1, x2, y2, color) {
		this.context.strokeStyle = color;
		this.context.beginPath();
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
		this.context.stroke();
	};

	Canvas2D.prototype.drawLineV = function (v1, v2, color) {
		this.drawLine(v1.x, v1.y, v2.x, v2.y, color);
	};

	// Coordinates are in local projection coordinates.
	Canvas2D.prototype.drawLine = function (x1, y1, x2, y2, color) {

		var start = this.sceneToCanvas(x1, y1);
		var end = this.sceneToCanvas(x2, y2);
		this.drawLineC(start.x, start.y, end.x, end.y, color);
	}

	// Draw a circle using canvas coordinates.  Angles in radians.
	Canvas2D.prototype.drawCircleC = function (canvasX, canvasY, canvasRad, outlineColor, fillColor, startAngle /* opt */, endAngle /* opt */) {
	
		var context = this.context;
		context.beginPath();
		context.arc(canvasX, canvasY, canvasRad, startAngle ? startAngle : 0, endAngle ? endAngle : 2 * Math.PI); 
		
		if (fillColor)  {
			context.fillStyle = fillColor;
			context.fill();
		}
		if (outlineColor) {
			context.strokeStyle = outlineColor;
			context.stroke();
		}
	}

	// Draw a circle.  If outlineColor or fillColor are null, do not draw those.  x, y, and rad are in scene space.
	Canvas2D.prototype.drawCircle = function (x, y, radius, outlineColor, fillColor, startAngle /* opt */, endAngle /* opt */) {

		var canvasCoord = this.sceneToCanvas(x, y);
		var canvasRad = radius * this.pixelsPerUnit;

		this.drawCircleC(canvasCoord.x, canvasCoord.y, canvasRad, outlineColor, fillColor, startAngle, endAngle);
	}

	// Draw a rectangle in canvas coordinates
	Canvas2D.prototype.drawRectangleC = function (x, y, width, height, outlineColor, fillColor) {
		var context = this.context;
	
		if (fillColor)  {
			context.fillStyle = fillColor;
			context.fillRect(x, y, width, height);
		}
		if (outlineColor) {
			context.strokeStyle = outlineColor;
			context.strokeRect(x, y, width, height);
		}
	}

	// Draw a rectangle.  If outlineColor or fillColor are null, do not draw those.  x and y are in scene coordinates.
	Canvas2D.prototype.drawRectangle = function (x, y, width, height, outlineColor, fillColor) {
		var context = this.context;
		var p = this.sceneToCanvas(x, y);
		var h = height * this.pixelsPerUnit;	// Convert to canvas space
		if (this.invertY)
			h = -h;

		this.drawRectangleC(p.x, p.y, width * this.pixelsPerUnit, h, outlineColor, fillColor);
	}

	Canvas2D.prototype.drawText = function (text, x, y, color) {

		var p = this.sceneToCanvas(x, y);
		this.context.textAlign = "left";
	
		this.context.fillStyle = color ? color : "rgb(0, 0, 0)";
		this.context.fillText(text, p.x, p.y);
	}

	return Canvas2D;
});