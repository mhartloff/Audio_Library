
// Maintains the position and direction of the ears in world space.
function EarInfo() {

	this.leftPos = new Vector(0, 0, 0);		// The position of the left ear (in meters)
	this.rightPos = new Vector(0, 0, 0);	// The position of the right ear (in meters)
	this.leftDir = new Vector(-1, 0, 0);	// The direction the left ear is facing, normalized.
	this.rightDir = new Vector(1, 0, 0);	// The direction the right ear is facing, normalized.

	this.subscribers = {};
	this.nextID = 0;
}

// The distance between the ears in inches.
EarInfo.earDistance = 10 / 39;

// The passed object will recieve notifications when the orientation changes.
EarInfo.prototype.subscribe = function (obj) {
	obj.earInfoID = this.nextID++;
	this.subscribers[obj.earInfoID] = obj;
};

EarInfo.prototype.unsubscribe = function (obj) {
	delete this.subscribers[obj.earInfoID];
};

EarInfo.prototype.update = function (position /* Vec */, leftVec /* Vec */) {

	this.leftDir.set(leftVec);
	this.rightDir.set(leftVec.reversed());

	this.leftPos.set(this.leftDir.multc(EarInfo.earDistance / 2.0));
	this.leftPos.add(position);

	this.rightPos.set(this.rightDir.multc(EarInfo.earDistance / 2.0));
	this.rightPos.add(position);

	// Notify subscribers of the change
	for (var id in this.subscribers) {
		if (this.subscribers.hasOwnProperty(id))
			this.subscribers[id].onEarInfoChange();
	}
};

// As the sound's angle from the ear increases attenuate it to simulate the sound becoming blocked by the head.
EarInfo.attenStart = MathExt.degToRad(40);	// Angle at which no sound attenuation occurs (not blocked by head)
EarInfo.attenEnd = MathExt.degToRad(90);
EarInfo.attenAmount = 0.4;

EarInfo.prototype.getAttenuation = function (angle) {

	if (angle < EarInfo.attenStart)
		return 0.0;
	if (angle > EarInfo.attenEnd)
		return EarInfo.attenAmount;
	var atten = (angle - EarInfo.attenStart) / (EarInfo.attenEnd - EarInfo.attenStart) * EarInfo.attenAmount;
	return atten;
};
