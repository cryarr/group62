var express = require('express');
var mysql = require('./dbCon.js');
const path = require('path');
var bodyparser = require('body-parser');

var app = express();

var handlebars = require('express-handlebars').create({defaultLayout:'home'});

app.engine('handlebars', handlebars.engine);
app.set('port', process.argv[2]);
app.set('view engine', 'handlebars');
app.use(bodyparser.urlencoded({ extended: true }));
app.set('myql', mysql);
const publicPath = path.join(__dirname, '/vendor');
app.use(express.static(publicPath));

var router = express.Router();

app.listen(app.get('port'), function() {
	console.log('Express started on flip:' + app.get('port'));

});

app.get('/', function(req, res, next){
	var context = {};
	context.jsscripts = ['delete.js'];
	res.render('landing', context);
});

app.get('/add', function(req, res, next){
	res.render('add');
});




/* DISPLAYING, DELETING, UPDATING
 *
 * */

app.get('/addPerson', function(req, res, next){
	var context= {};
	context.jsscripts = ['delete.js'];
	var viewstring = "SELECT * FROM people";
	mysql.pool.query(viewstring, function(err, rows, fields){
		if (err) {
			console.log("error: " + err);
		}

		context.people = rows;
		viewstring = "SELECT * FROM cities";
		mysql.pool.query(viewstring, function(err, rows, fields){
				viewstring = "SELECT * FROM region";
				context.city = rows;
				mysql.pool.query(viewstring, function(err, rows, fields){
				
					context.region = rows;		
					res.render('addPerson', context);
				});

		});
		
	});
});

app.delete('/addPerson/:id', function(req, res){
	var sql = " DELETE FROM people WHERE id = ?";
	var inserts = [req.params.id];
	mysql.pool.query(sql, inserts, function(error, results, fields){

		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
			res.status(202).end();
		}


	});
});


app.get('/person/:id', function(req,res){
	var context = {};
	var sql = "SELECT * FROM people WHERE id=?";
	var inserts = [req.params.id];
	mysql.pool.query(sql, inserts, function(error, rows, fields){
		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
		
			context.people  = rows[0];
			sql = "SELECT * FROM cities";
			mysql.pool.query(sql, function(err, rows, fields){
				sql = "SELECT * FROM region";
				context.city = rows;
				mysql.pool.query(sql, function(err, rows, fields){
				
					context.region = rows;		
					res.render('updatePerson', context);
				});

		});

		}


	});

});


app.post('/person', function(req, res){
	var sql = "UPDATE people SET first_name=?, last_name=?, regid=?, citid=?, description=? WHERE id=?";
	var inserts = [req.body.fname, req.body.lname, req.body.regid, req.body.citid, req.body.desc, req.body.id];
	console.log(inserts);
	mysql.pool.query(sql, inserts, function(error, results, fields){

		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
			res.redirect('/addPerson');
		}

	});
	

});


app.get('/addRegion', function(req, res, next){
	var context = {};
	var viewstring = "SELECT * FROM region";
	context.jsscripts = ['delete.js'];
	mysql.pool.query(viewstring, function(err, rows, fields){
		if (err) {
			console.log("error : " + err);
		}

		context.region = rows;
		res.render('addRegion', context);
	});
});


app.delete('/addRegion/:id', function(req, res){
	var sql = " DELETE FROM region WHERE id = ?";
	var inserts = [req.params.id];
	mysql.pool.query(sql, inserts, function(error, results, fields){

		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
			res.status(202).end();
		}


	});
});


app.get('/region/:id', function(req,res){
	var context = {};
	var sql = "SELECT * FROM region WHERE id=?";
	var inserts = [req.params.id];
	mysql.pool.query(sql, inserts, function(error, rows, fields){

		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
		
			context.region = rows[0];
			res.render('updateRegion', context);
		}


	});

});


app.post('/region', function(req, res){
	var sql = "UPDATE region SET region_name=? WHERE id=?";
	var inserts = [req.body.rname, req.body.id];
	console.log(inserts);
	mysql.pool.query(sql, inserts, function(error, results, fields){

		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
			res.redirect('/addRegion');
		}

	});
	

});


app.get('/associatePE', function(req, res, next){
	var context = {};
	var viewstring = "SELECT * FROM event";
	context.jsscripts = ['delete.js'];
	mysql.pool.query(viewstring, function(err, rows, fields) {
		if (err) {
			console.log("error : " + err);
		}
		
		context.event = rows;
		viewstring = "SELECT * FROM people";
		mysql.pool.query(viewstring, function(err, rows, fields) {
		
			context.person = rows;
			viewstring = "select people.id, people.last_name, event.id, event.event_name FROM (people, event) INNER JOIN peoples_events ON people.id = peoples_events.pid AND event.id = peoples_events.eid";
			mysql.pool.query(viewstring, function(err, rows, fields) {
				context.pe = rows;
				console.log(context.pe);
				res.render('associatePE', context);
			});
		});
	
	});
});



app.get('/addEvent', function(req, res, next){
	var context = {};
	var viewstring = "SELECT * FROM event";
	context.jsscripts = ['delete.js'];
	mysql.pool.query(viewstring, function(err, rows, fields) {
		if (err) {
			console.log("error : " + err);
		}
		
		context.event = rows;
		viewstring = "SELECT * FROM region";
		mysql.pool.query(viewstring, function(err, rows, fields) {
		
			context.region = rows;
			viewstring = "SELECT * FROM time_period";
			mysql.pool.query(viewstring, function(err, rows, fields) {
			
				context.time = rows;
				res.render('addEvent', context);
			});
		});
	
	});
});


app.delete('/addEvent/:id', function(req, res){
	var sql = " DELETE FROM event WHERE id = ?";
	var inserts = [req.params.id];
	mysql.pool.query(sql, inserts, function(error, results, fields){

		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
			res.status(202).end();
		}


	});
});


app.get('/event/:id', function(req,res){
	var context = {};
	var sql = "SELECT * FROM event WHERE id=?";
	var inserts = [req.params.id];
	mysql.pool.query(sql, inserts, function(error, rows, fields){
		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
			context.event = rows[0];
			sql = "SELECT * FROM region";
			mysql.pool.query(sql, function(err, rows, fields){
				context.region = rows;	

				sql = "SELECT * FROM time_period";
				mysql.pool.query(sql, function(err, rows, fields){
				
					context.time = rows;
					res.render('updateEvent', context);
				
				});
			});


		}


	});

});


app.post('/event', function(req, res){
	var sql = "UPDATE event SET event_name=?, description=?, reid=?, tpid=? WHERE id=?";
	var inserts = [req.body.ename, req.body.desc, req.body.reid, req.body.tpid, req.body.id];
	console.log(inserts);
	mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
			res.redirect('/addEvent');
		}

	});
	

});

app.get('/addCity', function(req, res, next){
	var context = {};
	context.jsscripts = ['delete.js'];
	var viewstring = "SELECT * FROM cities";
	mysql.pool.query(viewstring, function(err, rows, fields){
		if (err) {
			console.log("error : " + err);
		}

		context.city = rows;
		viewstring = "SELECT * FROM region";
		mysql.pool.query(viewstring, function(err, rows, fields){
			context.region = rows;
			res.render('addCity', context);
		});

	
	});
});

app.delete('/addCity/:id', function(req, res){
	var sql = " DELETE FROM cities WHERE id = ?";
	var inserts = [req.params.id];
	mysql.pool.query(sql, inserts, function(error, results, fields){

		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
			res.status(202).end();
		}


	});
});

app.get('/city/:id', function(req,res){
	var context = {};
	var sql = "SELECT * FROM cities WHERE id=?";
	var inserts = [req.params.id];
	mysql.pool.query(sql, inserts, function(error, rows, fields){
		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
		
			context.city  = rows[0];
			sql = "SELECT * FROM region";
			mysql.pool.query(sql, function(err, rows, fields){
				
					context.region = rows;		
					res.render('updateCity', context);
			});


		}


	});

});


app.post('/city', function(req, res){
	var sql = "UPDATE cities SET city_name=?, population=?, rid=? WHERE id=?";
	var inserts = [req.body.cname, req.body.pop, req.body.rid, req.body.id];
	console.log(inserts);
	mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
			res.redirect('/addCity');
		}

	});
	

});


app.get('/addTime', function(req, res, next){
	var context = {};
	context.jsscripts = ['delete.js'];
	var viewstring = "SELECT * FROM time_period";
	mysql.pool.query(viewstring, function(err, rows, fields){
		if (err) {
			console.log("error : " + err);
		}

		context.time = rows;
		viewstring = "SELECT * FROM region";
		res.render('addTime', context);
	
	});
});

app.delete('/addTime/:id', function(req, res){
	var sql = " DELETE FROM time_period WHERE id = ?";
	var inserts = [req.params.id];
	mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
			res.status(202).end();
		}


	});
});

app.get('/time/:id', function(req,res){
	var context = {};
	var sql = "SELECT * FROM time_period WHERE id=?";
	var inserts = [req.params.id];
	mysql.pool.query(sql, inserts, function(error, rows, fields){
		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
		
			context.time  = rows[0];
			res.render('updateTime', context);

		}


	});

});


app.post('/time', function(req, res){
	var sql = "UPDATE time_period SET start_year=?, end_year=? WHERE id=?";
	var inserts = [req.body.syear, req.body.eyear, req.body.id];
	console.log(inserts);
	mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
	        console.log(error)
		    res.write(JSON.stringify(error));
	        res.status(400);
			res.end();
		}else{
			res.redirect('/addTime');
		}

	});
	

});
/* SEARCH
 *
 *
 *
 * */
app.get('/search', function(req, res, next){
	res.render('search');
});

app.post('/search', function(req, res, next){
        var lookup = "SELECT * FROM people WHERE first_name LIKE '%" + req.body.search + "%' OR last_name LIKE '%" + req.body.search + "%' OR regid LIKE '%" + req.body.search + "%' OR citid LIKE '%" + req.body.search + "%' OR description LIKE '%" + req.body.search + "%'";

        var context = {};
        mysql.pool.query(lookup, function(err, result){
                if (err) {
                        console.log("error: " + err);
                }
                context.search = result;
                console.log(result[0]);
                res.render('search', context);

        });
});


/* INSERTS 
 *
 *
 * */

app.post('/addRegion', function(req, res, next){
	var insert = "INSERT INTO region (region_name) VALUES ('" + req.body.rname + "')";
	console.log(insert);
	mysql.pool.query(insert, function(err, rows, fields){
		if (err) {
			console.log("error: " + err);
		}
		res.redirect('/addRegion');
	});

});


app.post('/addPerson', function(req, res, next){
	var insert = "INSERT INTO people (first_name,last_name,regid,citid,description) VALUES ('" +
	req.body.fname + "','" +  req.body.lname + "'," + req.body.regid + "," + req.body.citid + ",'" + req.body.desc
	+ "')";
	console.log(insert);
	mysql.pool.query(insert, function(err, rows, fields){
		if (err) {
			console.log("error: + " + err);
		}
		res.redirect('/addPerson');
	});

});


app.post('/addEvent', function(req, res, next) {
	var insert = "INSERT INTO event (event_name,description,reid,tpid) VALUES ('" +
	req.body.ename + "','" + req.body.desc + "'," + req.body.reid + "," + req.body.tpid + ")";
	console.log(insert);
	mysql.pool.query(insert, function(err, rows, fields){
		if (err) {
			console.log("error: + " + err);
		}
		res.redirect('/addEvent');
	});

});


app.post('/addCity', function(req, res, next){
	var insert = "INSERT INTO cities (city_name,population,rid) VALUES ('" + req.body.cname + 
	"'," + req.body.pop + "," + req.body.rid + ")";
	console.log(insert);

	mysql.pool.query(insert, function(err, rows, fields){
		if (err) {
			console.log("error: + " + err);
		}
		res.redirect('/addCity');
	});

});


app.post('/addTime', function(req, res, next){
	var insert = "INSERT INTO time_period (start_year,end_year) VALUES (" + req.body.syear + 
	"," + req.body.eyear + ")";
	console.log(insert);

	mysql.pool.query(insert, function(err, rows, fields){
		if (err) {
			console.log("error: + " + err);
		}
		res.redirect('/addTime');
	});

});

app.post('/associatePE', function(req, res, next){
	var insert = "INSERT INTO peoples_events (pid,eid) VALUES ('" + req.body.per + 
	"','" + req.body.ev + "')";
	console.log(insert);

	mysql.pool.query(insert, function(err, rows, fields){
		if (err) {
			console.log("error: + " + err);
		}
		res.redirect('/associatePE');
	});

});
