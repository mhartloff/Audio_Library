

function Canvas2D(canvasElement) {

	var self = this;

   this.domElement = canvasElement;
   this.width = canvasElement.width;		// Width in pixels
   this.height = canvasElement.height;		// Height in pixels
   this.context = canvasElement.getContext('2d');
   this.context.font = "12px Arial";
   this.invertY = false;

   this.selectedPos = null;		// The last position selected by the user, in scene space.

   canvasElement.onmousedown = function (ev) { self._onMouseDown(ev); };
   canvasElement.onmouseup = function (ev) { self._onMouseUp(ev); }
   document.addEventListener('mousemove', function (ev) { self._onMouseMove(ev); }, false);
   canvasElement.addEventListener('keydown', function (ev) { self.onKeyDown(ev); }, false);
   canvasElement.oncontextmenu = function (ev) { return false; };		// Disable right-click context menu
   
	// Callbacks that can be set.  Returns the coord of the event in scene space.
   this.onMouseDown = null;		// function (x, y)
   this.onMouseUp = null;			// function (x, y)
   this.onMouseMove = null;		// function (x, y)
	
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

Canvas2D.prototype.setProjection = function (xCenter, yCenter, pixelsPerUnit, invertY) {
	this.xLeft = xCenter - (this.width / 2.0 / pixelsPerUnit);
	this.yLow = yCenter - (this.height / 2.0 / pixelsPerUnit);
	this.pixelsPerUnit = pixelsPerUnit;
	this.invertY = invertY ? false : invertY;
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
	return {
		x: clientX - rect.left,
		y: clientY - rect.top
	};
}

// Converts client coordinates generally returned by the event objects to the projection coordinates.
Canvas2D.prototype.clientToScene = function (clientX, clientY) {
	var p = this.clientToCanvas(clientX, clientY);
	return this.canvasToScene(p.x, p.y);
}

// Transform a 2D point from scene space to pixel space for drawing.
Canvas2D.prototype.sceneToCanvas = function (x, y) {
	
	var p = {
		x: ((x - this.xLeft) * this.pixelsPerUnit),
		y: ((y - this.yLow) * this.pixelsPerUnit)
	};
	if (this.invertY)
		p.y = this.height - p.y;		// It's actually 'this much from the bottom' in the inversion case.
	return p;
}

Canvas2D.prototype.canvasToScene = function (x, y) {
	if (this.invertY)
		y = this.height - y;
	return {
		x: x / this.pixelsPerUnit + this.xLeft,
		y: y / this.pixelsPerUnit + this.yLow
	};
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
		
	if (p.x >= 0 && p.x < this.width &&
		 p.y >= 0 && p.y < this.height) {
		var s = this.canvasToScene(p.x, p.y);

		if (this.onMouseMove)
			this.onMouseMove(s.x, s.y);
	}
}

Canvas2D.prototype.onKeyDown = function (ev) {

	//var p = clientToScene(ev.x, ev.y);
}


// Coordinates are in local projection coordinates.
Canvas2D.prototype.drawLine = function (x1, y1, x2, y2, color) {

	var start = this.sceneToCanvas(x1, y1);
	var end = this.sceneToCanvas(x2, y2);
	this.context.strokeStyle = color;
	this.context.beginPath();
	this.context.moveTo(start.x, start.y);
	this.context.lineTo(end.x, end.y);
	this.context.stroke();
}

// Draw a circle.  If outlineColor or fillColor are null, do not draw those.  x and y are in scene coordinates.
Canvas2D.prototype.drawCircle = function (x, y, radius, outlineColor, fillColor) {

	var context = this.context;
	var p = this.sceneToCanvas(x, y);
	
	context.beginPath();
	context.arc(p.x, p.y,radius, 0 /* start angle */, 2 * Math.PI /* end angle */); 

	
	if (fillColor)  {
		context.fillStyle = fillColor;
		context.fill();
	}
	if (outlineColor) {
		context.strokeStyle = outlineColor;
		context.stroke();
	}
}

// Draw a rectangle.  If outlineColor or fillColor are null, do not draw those.  x and y are in scene coordinates.
Canvas2D.prototype.drawRectangle = function (x, y, width, height, outlineColor, fillColor) {
	var context = this.context;
	var p = this.sceneToCanvas(x, y);
	var h = height * this.pixelsPerUnit;	// Convert to canvas space
	if (this.invertY)
		h = -h;

	if (fillColor)  {
		context.fillStyle = fillColor;
		context.fillRect(p.x, p.y, width * this.pixelsPerUnit, h);
	}
	if (outlineColor) {
		context.strokeStyle = outlineColor;
		context.strokeRect(p.x, p.y, width * this.pixelsPerUnit, h);
	}
}

Canvas2D.prototype.drawText = function (text, x, y, color) {

	var p = this.sceneToCanvas(x, y);
	this.context.textAlign = "left";
	
	this.context.fillStyle = color ? color : "rgb(0, 0, 0)";
	this.context.fillText(text, p.x, p.y);
}