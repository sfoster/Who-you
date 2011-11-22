require([
	// the modules we want to use
	'jquery',
	'mustache', 
	'dojo/on', 
	'dojox/gesture/swipe'
], 
function($, mustache, on, swipe){
	
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
	}, 
	create = function(tagName, attrs, refNode){
		var node = document.createElement(tagName);
		for(var i in attrs){
			node[i] = attrs[i];
		}
		if(refNode){
			refNode.appendChild(node);
		}
		return node;
	}
	
	var itemTmpl = '<li class="profile"><h2>${name}</h2><div class="avatar"></div><ul class="aka"></ul><p class="notes"></p></li>', 
		tmpContainer;
	
	var supplant = function(tmpl, data){
		return tmpl.replace(/\$\{([^\}]+)\}/g, function(m,name){
			return (name in data) ? data[name] : "";
		});
	};
	
	profiles.people.forEach(function(data){
		var html = supplant(itemTmpl, data);
		tmpContainer = tmpContainer || (create("ul"));
		tmpContainer.innerHTML = html;
		var li = tmpContainer.firstChild; 
		var akaList = $(".aka", li);
		for(var key in data){
			switch(key){
				case "name":
					break;
				case "avatar": 
					if(data[key]){
						$(".avatar", li).css('backgroundImage', 'url('+data[key]+')');
					}
					break;
				case "notes":
					if(data[key]){
						$(".notes", li).html( data[key] );
					}
				break;
				default: 
					akaList && akaList.append(create("li", {innerHTML: key + ": "+data[key]}));
			}
		}
		
		byId('profileList').appendChild( li );
	});
});