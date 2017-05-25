function FollowBehavior(sceneObject, objectToFollow, speed, bufferDistance) {
	this.sceneObject = sceneObject;
	this.objectToFollow = objectToFollow;
	this.speed = speed; // velocity determined by speed, destination, and position
	if(bufferDistance === undefined){
		bufferDistance = 1;
	}
	this.bufferDistance = bufferDistance;
}

FollowBehavior.prototype.onBehavior = function (scene) {
	var behaviorRate = 5; // behavior loop runs every 200ms
	var distancePerUpdate = this.speed/behaviorRate;

	var distanceToDestination = this.sceneObject.getPosition().distance(this.objectToFollow.getPosition());

	if(Math.abs(distancePerUpdate - distanceToDestination) > this.bufferDistance){
		var direction = this.objectToFollow.getPosition().subc(this.sceneObject.getPosition()).normalize();
		var newPosition = this.sceneObject.getPosition().addc(direction.multc(distancePerUpdate));
		this.sceneObject.setPosition(newPosition);
		this.sceneObject.setDirection(direction);
	}
};
