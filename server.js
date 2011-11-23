var journey = require('journey'), 
	fs = require("fs");

//
// Create a Router
//
var router = new(journey.Router);
var users = [], byId = {};
var identifier = 'username';

fs.readFile('./data/users.json', function(err, filestr){
	users = JSON.parse(filestr);
	users.forEach(function(user){
		byId[user[identifier]] = user;
	});
});
// Create the routing table
router.map(function () {
	this.root.bind(function (req, res) { res.send("Welcome"); });

	// users list resource
	this.get(/^user\/$/).bind(function (req, res, id) {
		res.send(200, {}, JSON.stringify(users));
	});

	// user resource
	this.get(/^user\/([a-zA-Z_\.]+)$/).bind(function (req, res, id) {
		var user = byId[id];
		if(user){
			res.send(200, {}, JSON.stringify(user));
		} else {
			res.send(404);
		}
	});

	// user resource
	this.put(/^user\/([a-zA-Z_\.]+)$/).bind(function (req, res, id) {
		res.send(200, {}, JSON.stringify(req));
	});

	// user resource
	this.post(/^user\/([a-zA-Z_\.]+)$/).bind(function (req, res, id) {
		res.send(200, {}, JSON.stringify(req));
	});

	this.get(/^trolls\/([0-9]+)$/).bind(function (req, res, id) {
		database('trolls').get(id, function (doc) {
			res.send(200, {}, doc);
		});
	});
	this.post('/trolls').bind(function (req, res, data) {
		sys.puts(data.type); // "Cave-Troll"
		res.send(200);
	});
});

require('http').createServer(function (request, response) {
	var body = "";

	request.addListener('data', function (chunk) { body += chunk; });
	request.addListener('end', function () {
		//
		// Dispatch the request to the router
		//
		router.handle(request, body, function (result) {
			response.writeHead(result.status, result.headers);
			response.end(result.body);
		});
	});
}).listen(3010);