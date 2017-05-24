function EngagedBehavior(sceneObject, distance, triggerFunction) {
	this.sceneObject = sceneObject;
	this.distance = distance;
	this.triggerFunction = triggerFunction;
}

EngagedBehavior.prototype.onBehavior = function (scene) {
	if(this.triggered(scene)){
		this.triggerFunction();
	}
};

EngagedBehavior.prototype.triggered = function (scene) {
	var distanceToPlayer = scene.getPlayerPosition().distance(this.sceneObject.getPosition());
	console.log(distanceToPlayer);
	return distanceToPlayer > this.distance;
};