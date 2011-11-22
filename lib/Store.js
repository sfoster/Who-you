define([
	'dojo/store/Memory'
	], function(MemoryStore){
	
	var Store = function(){
		// console.log("Creating Store instance");
		return MemoryStore.prototype.constructor.apply(this, arguments);
	}
	Store.prototype = new MemoryStore;
	return Store;
});
