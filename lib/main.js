require([
	// the modules we want to use
	'jquery',
	'mustache', 
	'dojo/on', 
	'dojox/gesture/swipe'
], 
function($, Mustache, on, swipe){
	
	// module loader
	// people store
	// 	sort-by some attribute
	// 	add whole records
	// 	edit records
	// 	add/edit individual attributes
	// event emmitter/register
	// event/touch/gesture
	// templating/dom creation
	
	// lightweight widgets: lists/trees
	
	
	// var extend = dojo.extend;
	// var Store = function(){};
	// extend(Store, {
	// 	length: 0, 
	// 	getItem: function(){},
	// 	setItem: function(){},
	// 	// get,put,add,remove,query,transaction,getChildren,getMetaData,
	// 	removeItem: function(),
	// 	clear
	// });
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
	var template = [
	'{{#people}}',
	'<li class="profile">',
	'<h2>{{name}}</h2>',
	'<div class="avatar" style="background-image:url({{avatar}})"></div>',
	'<ul class="aka">{{#aliases}}<li>{{name}}:{{value}}</li>{{/aliases}}</ul>',
	'<p class="notes">{{notes}}</p></li>',
	'{{/people}}' 
	].join("\n");
	

	console.log("Defined template: ", template);
	
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
		console.log("prepared view-model for person: ", person);
	});
	
	var output = Mustache.to_html(template, viewData);
	console.log("output:",output);
	byId("profileList").innerHTML = output;
});