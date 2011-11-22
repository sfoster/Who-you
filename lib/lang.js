define(function(){
	var empty = {}, 
		mixin = function(targ,src){
			for(var i in src){
				if(i in empty) continue;
				targ[i] = src[i];
			}
			return targ;
		}
	;
	
	return {
		// library functions
		mixin: mixin,

		createObject: function(thing, props) {
			// delegation with mixin. 
			var FN = function(){};
			FN.prototype = thing; 
			var obj = new FN;
			if(props) {
				mixin(obj, props);
			}
			return obj;
		},

		getObject: function(name, createMissing, scopeObj){
			// foo.bar.bazz in window
			// window[foo][bar][bazz]
			scopeObj = scopeObj || window;
			var parts = name.split(/[.\/]/), 
				part = null;
			console.log("getObject of parts: ", parts);
			while((part = parts.shift())){
				console.log("looking for %s in %o", part, scopeObj);
				scopeObj = (part in scopeObj) ? 
					scopeObj[part] : (createMissing && {});
			}
			return scopeObj;
		}
	}
});