// MathExt: An extension of the generic Javascript Math library.

define({

	radToDeg: function (rad) { return rad * 57.2957795; },
	degToRad: function (deg) { return deg / 57.2957795; },

	/* passed in 3 points on a triangle */
	normal: function (a, b, c) {
		var ba = b.subc(a);
		var bc = b.subc(c);
		ba = ba.cross(bc);
		ba.normalize();
		return ba;
	},

	close: function (a, b, tol) {
		return Math.abs(a - b) <= (tol ? tol : 0.001);
	},

	// Returns the height of the sphere centered on 0, 0 at the passed x, y
	heightOfSphere: function (x, y, sphereRadius) {
		var r = sphereRadius ? sphereRadius : 1.0;
		var d = Math.sqrt(x * x + y * y);
		var h = Math.sqrt(r * r - d * d);
		return h;

	},

	// Round the passed number to the passed number of decimal digits.
	round: function (a, digits) {
		var x = Math.pow(10, digits);
		a = Math.round(a * x);
		return a / x;
	},
			
	// Find the next power of 2 that is the same or higher than the passed value.
	nextPowerOf2: function (num) {
		var n = 1;
		while (n < num)
			n *= 2;
		return n;
	}
});