define(["lang", "dojo/_base/declare", "dojo/store/util/QueryResults"
], function(declare, QueryResults) {
	//  module:
	//    ServiceStore
	//  summary:
	//    The module defines a JSON/REST based object store 

	var ServiceStore = declare(null, {

		// idProperty: String?
		// 		The indicates the property to use as the identity property. The values of this
		// 		property should be unique.	
		idProperty: "id",

		// itemsProperty: String?
		// 		The indicates the property in the service result to use as the items or results array. 
		// 		Use a falsy value if the result itself is enumerable
		itemsProperty: "",
	
		// service: Object
		// 		A dojox.rpc.Service instance
		service: null,

		// methodMapping: Object?
		// 		A dictionary mapping store method names to service method names
		methodMapping: null,
	
		// list of store api methods to wrap  (deliberately shared on the prototype)
		_storeMethodNames: ["get", "query", "put", "remove"], 
	
		constructor: function(service, options) {
			// summary:
			//        The Service store wraps an RPC Service using its methods for
			//        making the associated store calls. By default, the store will
			//        look for the standard store method names: query, get,add,put,delete.
			//        If a 'map' property is provided in the option set, the store will
			//        will override the default mapping and use that service method instead.
			if(arguments.length == 1 && arguments[0].service) {
				options = arguments[0];
			} else if(service) {
				this.service = service;
			}
			
			(function(target, options, empty){
				for(var i in options){
					if(i in empty) continue;
					target[i] = options[i];
				}
			})(this, options || {}, {})
			
			if (!this.service) {
			    throw Error("No service supplied to Service");
			}
			if (!this.methodMapping) {
			    this.methodMapping = {};
			}
			
			var service = this.service, 
				methodMapping = this.methodMapping;
			
			this._storeMethodNames.forEach(function(name) {
				var serviceMethod = (name in methodMapping) ? 
						service[methodMapping[name]] : service[name];
				if(serviceMethod) {
					this._mapMethod(name, serviceMethod);
				}
			}, this);
			return this;
		},
		get: function() {
			// summary: 
			// 		stub method
			console.warn(this.declaredClass + ": method 'get' not implemented");
		},
		query: function(query, options){
			//	summary:
			// 		Queries the store for objects. This will trigger a GET request to the server, with the query added as a query string
			// query:
			// 		The query to use for retrieving objects from the store		
			console.warn(this.declaredClass + ": method 'query' not implemented");
			return 
		},
		put: function() {
			// summary: 
			// 		stub method
			console.warn(this.declaredClass + ": method 'put' not implemented");
		},
		getIdentity: function(object){
			//	summary:
			// 		Returns an object's identity
			// object:
			// 		The object to get the identity from		
			return object[this.idProperty];
		},
		getChildren: function() {
			// summary: 
			// 		stub method
			console.warn(this.declaredClass + ": method 'getChildren' not implemented");
		},
		_onQueryResult: function(result) {
			// decorate the service response with QueryResults
			// TODO: what to do w. all the other response properties other than items?
			// TODO: QueryResults will add a .total property. But the service might have included one also? Perhaps support a totalProperty 
			var items = this.itemsProperty ? lang.getObject(this.itemsProperty, false, result) : result;
			return QueryResults(items);
		},
		_onQueryError: function(err) {
			// stub
			console.log(this.declaredClass + " query error: ", err);
			return err;
		},
		_onQueryProgress: function(progress) {
			// stub
			console.log(this.declaredClass + " query progress: ", progress);
			return progress;
		},
		_mapMethod: function(name, serviceMethod) {
			var store = this, 
				service = this.service, 
				methodMapping = this.methodMapping;
		
			console.log("_mapMethod: ", name, this.declaredClass);
			if(!serviceMethod) {
				serviceMethod = (name in methodMapping) ? 
					service[methodMapping[name]] : service[name];
			}

			if(name == "query") {
				this[name] = function(query, directives) {
					// remove extra undefined argument that Cache can put there - it throws off rpc.Service method handling
					var args = Array.prototype.slice.call(arguments, 0, directives ? arguments.length : 1);
					return QueryResults(dojo.when(
						serviceMethod.apply(service, args), 
						lang.hitch(store, "_onQueryResult"),
						lang.hitch(store, "_onQueryError"),
						lang.hitch(store, "_onQueryProgress")
					));
				};
			} else if(serviceMethod) {
				this[name] = function() {
					return serviceMethod.apply(service, arguments);
				}
			} else {
				console.warn(this.declaredClass + ": cant expose method '"+name+"' as it doesn't exist on the service");
			}
		}
	});
	return ServiceStore
});