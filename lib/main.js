require([
	// the modules we want to use
	'jquery',
	'mustache', 
	'lang',
	'Store',
	'text!resources/people.tmpl'
], 
function($, Mustache, lang, Store, template){
	// the main app components:
	// * module loader - currently using require.js
	// * DOM library for querying/manipulating - currently using jquery
	// * data store, which does
	// 		sort-by some attribute
	// 		add whole records
	// 		edit records
	// 		add/edit individual attributes
	// * event emmitter/register - use/port Node's EventEmitter?
	// * event/touch/gesture - use/port Dojo's on and gesture modules?
	// * templating/dom creation - currently using Mustache.js
	
	// * lightweight lists/tree widget(s) - use dojo List?
	
	// TODO: create a Store class and abstract out the storage querying and iteration
	// of the store data to expose a simple consistent interface, something like:
	// 	var Store = function(){};
	// 	extend(Store, {
	// 		length: 0, 
	// 		getItem: function(){},
	// 		setItem: function(){},
	// 		// get,put,add,remove,query,transaction,getChildren,getMetaData,
	// 		removeItem: function(),
	// 		clear
	// 	});
	window.lang = lang;
	
	var byId = function(id){
		return document.getElementById(id);
	};
	
	var mixin = lang.mixin,
		createObject = lang.createObject; 
		
	// load data then populate the store
	// This is temporary, the transport and details of data retrieval/storage 
	// should be tucked away behind the store
	var peopleStore = new Store({
		idProperty: "name",
		data: './data/people.json'
	});

	var viewData = {
		people: []
	};
	var errorHandler = function(err){
		console.warn("ugh, error:", err);
	}
	// Assume ES5's Array iteractors and Object methods
	// we'll polyfill if back-compat required
	viewData.people = peopleStore.query({})
		.then(function(people){
			
			// prepare the view-model
			viewData.people = people.map(function(data){
				console.log("people: ", data);
				var akaNames = ['irc','skype','twitter'];
				var person = createObject(data, {
					"avatar": data.avatar ? data.avatar : './resources/anon.jpg',
					"notes": data.notes || "",
					"aliases": Object.keys(data)
						.filter(function(key){
							return akaNames.indexOf(key) > -1;
						})
						.map(function(key){
							return {name:key,value:data[key]};
						})
				});
				return person;
			}); 
			
			// console.log("preparing output with: ", viewData);
			var output = Mustache.to_html(template, viewData);

			// console.log("output: ", output);
			byId("profileList").innerHTML = output;
		}, errorHandler)
	;

	
	// console.log("fetching data");

});