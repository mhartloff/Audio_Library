
////////////////////////////////////////////////////////////////
// Color

define(function (require) {

	var MathExt = require("Common/MathExt");

	// values are floats from 0.0 - 1.0
	function Color(r, g, b, a) {
		this.set(r, g, b, a);
	}
		
	Color.prototype.set = function (rOrColor, g, b, a) {

		if (rOrColor.r !== undefined) {
			this.r = rOrColor.r;
			this.g = rOrColor.g;
			this.b = rOrColor.b;
			this.a = rOrColor.a;
			return;
		}

		// Allow rgb values to be between 0 - 255
		if (rOrColor > 1.0 || g > 1.0 || b > 1.0 || a > 1.0) {
			this.r = rOrColor / 255;
			this.g = g / 255;
			this.b = b / 255;
			this.a = (a == undefined) ? 1.0 : a / 255;
		}
		else {
			this.r = rOrColor;
			this.g = g;
			this.b = b;
			this.a = (a == undefined) ? 1.0 : a;
		}
	}

	Color.prototype.toJSON = function () {
		return {
			c: [MathExt.round(this.r, 3), MathExt.round(this.g, 3), MathExt.round(this.b, 3), MathExt.round(this.a, 3)]
		}
	};

	Color.FromJSON = function (json) {
		return new Color(json.c[0], json.c[1], json.c[2], json.c[3]);
	};

	// Efficiently convert an array of Color points to JSON
	Color.ArrayToJSON = function (array /* Color[] */) {
		
		var jsonArray = new Array(array.length * 4);
		for (var i = 0; i < array.length; i++) {
			jsonArray[i * 4] = MathExt.round(array[i].r, 3);
			jsonArray[i * 4 + 1] = MathExt.round(array[i].g, 3);
			jsonArray[i * 4 + 2] = MathExt.round(array[i].b, 3);
			jsonArray[i * 4 + 3] = MathExt.round(array[i].a, 3);
		}
		return { a: jsonArray };
	};

	// Convert a JSON object that was created by ArrayToJSON back to an array of Vector2 points.
	Color.ArrayFromJSON = function (json) {
		var jsonArray = json.a;
		var array = new Array(jsonArray.length / 4);

		for (var i = 0; i < array.length; i++) {
			array[i] = new Color(jsonArray[i * 4], jsonArray[i * 4 + 1], jsonArray[i * 4 + 2], jsonArray[i * 4 + 3]);
		}
		return array;
	};


	Color.prototype.adjustBrightness = function (fraction) {

		this.r = Math.min(1.0, this.r * fraction);
		this.g = Math.min(1.0, this.g * fraction);
		this.b = Math.min(1.0, this.b * fraction);
	}

	Color.prototype.equal = function (other) {
		return MathExt.close(this.r, other.r, 0.002) &&
				 MathExt.close(this.g, other.g, 0.002) &&
			    MathExt.close(this.b, other.b, 0.002) &&
				 MathExt.close(this.a, other.a, 0.002);
	}

	// Return this color as a rounded value, generally for ascii export.
	Color.prototype.rounded = function () {
		return new Color(MathExt.round(this.r, 3), MathExt.round(this.g, 3), MathExt.round(this.b, 3), MathExt.round(this.a, 3));
	};

	Color.prototype.toHtml = function () {
		if (this.a == 1.0) {
			return "rgb(" + Math.floor(this.r * 255) + "," +
							    Math.floor(this.g * 255) + "," +
							    Math.floor(this.b * 255) + ")";
		}
		else {
			return "rgba(" + Math.floor(this.r * 255) + "," +
								  Math.floor(this.g * 255) + "," +
								  Math.floor(this.b * 255) + "," +
								  this.a + ")";		
		}
	};

	// Conver RGB to HSV values.  From https://gist.github.com/mjackson/5311256
	Color.rgbToHsv = function (r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;

		var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);
		var h, s, v = max;

		var d = max - min;
		s = max == 0 ? 0 : d / max;

		if (max == min) {
			h = 0; // achromatic
		}
		else {
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}

			h /= 6;
		}

		return [h * 360, s * 100, v * 100];
	}

	
	Color.ClearColor = new Color(0, 0, 0, 0);
		
	return Color;
});