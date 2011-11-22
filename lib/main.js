require([
	// the modules we want to use
	'jquery',
	'mustache', 
	'dojo/on', 
	'dojox/gesture/swipe'
], 
function($, Mustache, on, swipe){
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

	var profiles = {
		people: [
			{ 
				name: 'Sam Foster',
				irc: 'sfoster',
				avatar: 'https://twimg0-a.akamaihd.net/profile_images/422407517/sfoster_bwheadshot-w164-h200_reasonably_small.gif',
				skype: 'samfosteriam',
				twitter: 'samfosteriam',
				notes: 'This is Me'
			},
			{ 
				name: 'Stuart',
				irc: 'stuart',
				skype: '',
				twitter: '',
				notes: ''
			},
			{
				 name: 'madhava'
			},
			{
				name:  'josh'
			},
			{
				name: 'ian'
			}
		
		]
	}
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
	

	// library functions
	// TODO: move to lang module
	var empty = {};
	var mixin = function(targ,src){
		for(var i in src){
			if(i in empty) continue;
			targ[i] = src[i];
		}
		return targ;
	},
	createObject = function(thing, props) {
		// delegation with mixin. 
		var FN = function(){};
		FN.prototype = thing; 
		var obj = new FN;
		if(props) {
			mixin(obj, props);
		}
		return obj;
	}

	
	var viewData = {
		people: []
	};
	// Assume ES5's Array iteractors and Object methods
	// we'll polyfill if back-compat required
	profiles.people.forEach(function(data){
		// prepare the view-model
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
		viewData.people.push(person);
	});
	
	var output = Mustache.to_html(template, viewData);
	byId("profileList").innerHTML = output;
});