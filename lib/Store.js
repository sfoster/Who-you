define([
	'dojo/store/Memory',
	'dojo/_base/Deferred',
	'jquery'
	], function(MemoryStore, Deferred, $){
	
	var Store = function(){
		// console.log("Creating Store instance");
		this._onDataLoadedQueue = [];
		return MemoryStore.prototype.constructor.apply(this, arguments);
	};
	Store.prototype = new MemoryStore;
	Store.prototype.setData = function(dataUrl){
		// treat stringy data as a URL we need to load
		console.log("store setData with: ", dataUrl, typeof dataUrl);
		var self = this;
		if("string" == typeof dataUrl){
			console.log("fetching url:", dataUrl);
			var deferred = new Deferred();
			// the result of this method is a deferred/promise
			$.ajax({
				url: dataUrl,
				dataType: "json",
				failure: function(err){
					deferred.errback(err);
				},
				success: function(data){
					/// console.log("setData success: ", data);
					deferred.callback( 
						self.itemsProperty ? data[self.itemsProperty] :
						data
					);
				}
			});
			var self = this;
			deferred.then(function(data){
				self.data = data;
				// execute any queued-up method calls
				var defd = null, 
					queue = self._onDataLoadedQueue;
				while((defd = queue.shift())){
					defd.callback(data);
				}
			}, function(){
				// pass error along any queued-up method calls
				var defd = null, 
					queue = self._onDataLoadedQueue;
				while((defd = queue.shift())){
					defd.errback(data);
				}
			});
			return deferred;
		} else {
			// delegate to superclass' setData 
			console.log("setting as data:", dataUrl);
			return MemoryStore.prototype.setData.apply(this, arguments)
		}
	};
	
	// adapt store API as async when data is not yet loaded
	["query", "add", "put", "get", "getIdentity"].forEach(function(method){
		Store.prototype[method] = function(){
			if("object" == typeof this.data){
				return MemoryStore.prototype[method].apply(this, arguments);
			} else {
				var deferred = new Deferred();
				this._onDataLoadedQueue.push(deferred);
				return deferred;
			}
		};
	});
	
	return Store;
});
