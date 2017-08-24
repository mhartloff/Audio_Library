define(function (require) {

	function MoveBehavior(sceneObject, destination, speed, triggerFunction) {
		this.sceneObject = sceneObject;
		this.destination = destination;
		this.speed = speed; // velocity determined by speed, destination, and position
		this.triggerFunction = triggerFunction;
	}

	MoveBehavior.prototype.onBehavior = function (scene) {
		var behaviorRate = 5; // behavior loop runs every 200ms
		var distancePerUpdate = this.speed/behaviorRate;

		var distanceToDestination = this.sceneObject.getPosition().distance(this.destination);

		if(distancePerUpdate > distanceToDestination){
			this.sceneObject.setPosition(this.destination);
		}else{
			var direction = this.destination.subc(this.sceneObject.getPosition()).normalize();
			var newPosition = this.sceneObject.getPosition().addc(direction.multc(distancePerUpdate));
			this.sceneObject.setPosition(newPosition);
			this.sceneObject.setDirection(direction);
		}

		if(this.triggered(scene)){
			this.triggerFunction();
		}
	};

	MoveBehavior.prototype.triggered = function (scene) {
		var distanceToDestination = this.sceneObject.getPosition().distance(this.destination);
		return distanceToDestination < 0.01;
	};

	return MoveBehavior;
});