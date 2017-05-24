// Copywright Hartloff Gaming and Mike 2017

// Echo objects are objects that reflect sound.  Though they emit no sound themselves, they may reflect sound back to the listener.
// A wall is a good example.
function EchoObject (start /* Vector2 */, end /* Vector2 */) {
	
	this.start = start;
	this.end = end;

	var dir = this.start.subc(this.end);
	dir.normalize();
	this.normal = new Vector2(dir.y, dir.x);
};

EchoObject.prototype.draw = function (canvas) {
	
	var color = "rgb(20, 20, 20)";
	var color2 = "rgb(80, 20, 20)";
	canvas.drawLineV(this.start, this.end, color);
	canvas.drawLine(this.start.x + this.normal.x * 0.05, this.start.y + this.normal.y * 0.05,
						 this.end.x + this.normal.x * 0.05, this.end.y + this.normal.y * 0.05, color2);
};


// Passed a PannerSound object, return an array of PannerSounds that are created.
EchoObject.prototype.createEchoes = function (source /* PannerSound */, listenerPos) {

	// TODO: Find the echoes.

};