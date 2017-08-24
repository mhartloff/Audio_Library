
////////////////////////////////////////////////////////////////
// Bounding Box

define(function (require) {

	var Vector3 = require("Common/Vector3");
	var Range = require("Common/Range");

	function BoundingBox(p1, p2) {
		this.min = { x: 1e8, y: 1e8, z: 1e8 };
		this.max = { x: -1e8, y: -1e8, z: -1e8 };
        
		if (p1 != null)
			this.addPoint(p1);
		if (p2 != null)
			this.addPoint(p2);
	}


	BoundingBox.prototype.isValid = function () {
		return this.min.x <= this.max.x;
	};

	BoundingBox.prototype.addPoint = function (p /* Vector3 */) {
		if (p.x < this.min.x) this.min.x = p.x;
		if (p.y < this.min.y) this.min.y = p.y;
		if (p.z < this.min.z) this.min.z = p.z;
		if (p.x > this.max.x) this.max.x = p.x;
		if (p.y > this.max.y) this.max.y = p.y;
		if (p.z > this.max.z) this.max.z = p.z;
	};

	BoundingBox.prototype.addPoint2 = function (x, y, z) {
		if (x < this.min.x) this.min.x = x;
		if (y < this.min.y) this.min.y = y;
		if (z < this.min.z) this.min.z = z;
		if (x > this.max.x) this.max.x = x;
		if (y > this.max.y) this.max.y = y;
		if (z > this.max.z) this.max.z = z;
	};

	BoundingBox.prototype.getSize = function () {
		return new Vector3(this.max.x - this.min.x,
								this.max.y - this.min.y,
								this.max.z - this.min.z);
	};

	BoundingBox.prototype.contains = function (p /* Vector3 */) {
		return p.x >= this.min.x
			&& p.x <= this.max.x
			&& p.y >= this.min.y
			&& p.y <= this.max.y
			&& p.z >= this.min.z
			&& p.z <= this.max.z;
	};

	BoundingBox.prototype.clear = function() {
		this.min.x = this.min.y = this.min.z = 1e8;
		this.max.x = this.max.y = this.max.z = -1e8;
	};

	var il_range1 = new Range();    // Because this function will be called often, it can save time by declaring these as global.
	var il_range2 = new Range();
	var il_range3 = new Range();

	BoundingBox.prototype.intersectsLine = function (line /* Line */) {
		var p1 = line.p1;
		var p2 = line.p2;
    
		var delta = p2.x - p1.x;
		il_range1.set((this.min.x - p1.x) / delta, (this.max.x - p1.x) / delta);
		if (!il_range1.isWithin(0, 1))
			return false;

		delta = p2.y - p1.y;
		il_range2.set((this.min.y - p1.y) / delta, (this.max.y - p1.y) / delta);
		il_range1.inclusive(il_range2);
		if (!il_range1.isWithin(0, 1))
			return false;

		delta = p2.z - p1.z;
		il_range2.set((this.min.z - p1.z) / delta, (this.max.z - p1.z) / delta);
		il_range1.inclusive(il_range2);
    
		return il_range1.isWithin(0, 1);
	};

	return BoundingBox;
});