
define(function (require) {
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
		return distanceToPlayer > this.distance;
	};

	return EngagedBehavior;
});