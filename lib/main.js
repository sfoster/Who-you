require([
	// the modules we want to use
	'jquery',
	'mustache', 
	'lang',
	'dojo/store/Memory',
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
	
	// TODO: load template as a module using the !text plugin 
	var template = [
	'{{#people}}',
	'<li class="profile">',
	'<h2>{{name}}</h2>',
	'<div class="avatar" style="background-image:url({{avatar}})"></div>',
	'<ul class="aka">{{#aliases}}<li>{{name}}:{{value}}</li>{{/aliases}}</ul>',
	'<p class="notes">{{notes}}</p></li>',
	'{{/people}}' 
	].join("\n");
	
	var mixin = lang.mixin,
		createObject = lang.createObject; 
		

	// load data then populate the store
	// This is temporary, the transport and details of data retrieval/storage 
	// should be tucked away behind the store
	
	// console.log("fetching data");
	$.ajax({
		url: "./data/people.json",
		dataType: "json",
		failure: function(err){ console.warn(err)},
		success: function(data){
			var peopleStore = new Store({
				idProperty: "name",
				data: data.people
			});

			console.log("success, data:", data);
			var viewData = {
				people: []
			};
			// Assume ES5's Array iteractors and Object methods
			// we'll polyfill if back-compat required
			viewData.people = peopleStore.query({}).map(function(data){
				// prepare the view-model
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
		}
	});
});