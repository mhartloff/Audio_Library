function ProximityBehavior(sceneObject, distance, triggerFunction) {
	this.sceneObject = sceneObject;
	this.distance = distance;
	this.triggerFunction = triggerFunction;
}

ProximityBehavior.prototype.onBehavior = function (scene) {
	if(this.triggered(scene)){
		this.triggerFunction();
	}
};

ProximityBehavior.prototype.triggered = function (scene) {
	var distanceToPlayer = scene.getPlayerPosition().distance(this.sceneObject.getPosition());
	return distanceToPlayer < this.distance;
};