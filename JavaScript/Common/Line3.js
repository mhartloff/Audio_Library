// Copywrite Hartloff Gaming 2017

define(function (require) {

	function Line3 (p1 /* Vector3 */, p2 /* Vector3 */) {
		 this.p1 = p1;
		 this.p2 = p2;
	}

	Line3.prototype.set = function (p1, p2) {
		 this.p1 = p1;
		 this.p2 = p2;
	};

	Line3.prototype.length = function () {
		 return this.p1.distance(this.p2);
	};

	Line3.prototype.getDirection = function () {
		 var dir = this.p2.subc(this.p1);
		 dir.normalize();
		 return dir;
	};

	return Line3;
});
