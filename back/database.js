var db_a = new db({
	table: "articles",
	cols: {
		title: "tinytext",
		author: "tinytext",
		content: "text",
		regex_id: "int",
		published_at: "date",
		added_on: "datetime"
	}
});
// db_a.dropTable();

function db(opts){
	const dbName = "ESsay";
	const dbDescription = "Articles collector for NTU Library Essays";
	const dbSize = 2 *1024*1024; // 5MB
	var _db = openDatabase(dbName, "1", dbDescription, dbSize);
	var defaults = {
		table: "articles",
		cols: {
			title: "tinytext",
			content: "text",
			href_regex: "tinytext",
			published_at: "datetime",
			added_on: "datetime"
		}
	};
	defaults = extend(defaults, opts);
	createTable();

	function extend(defaults, options){
		var extended = {};
		for(var key in defaults){
			extended[key] = defaults[key];
		}
		for(var key in options){
			extended[key] = options[key];
		}
		return extended;
	};

	function createTable(){
		var builds = [];
		for(var key in defaults.cols)
			builds.push(key +" "+ defaults.cols[key]);
		var sql = "CREATE TABLE IF NOT EXISTS "+ defaults.table +"(id INTEGER PRIMARY KEY ASC,"+ builds.join(",") +")";
		_db.transaction(function(tx) {
			tx.executeSql(sql);
		});
	}

	function onError(tx, e){
		// console.log(e);
		var message = chrome.i18n.getMessage("notifications_save_error")+"\nThere has been an error: " + e.message;
		chrome.notifications.create("databaseError", {
			type: "basic",
			title: "ESsay",
			message: message,
			iconUrl: chrome.i18n.getMessage("notifications_icon_url")
		});
		// alert("There has been an error: " + e.message);
		return false;
	}
	function drop(){
		var sql = "DROP TABLE "+ defaults.table;
		_db.transaction(function(tx) {
			tx.executeSql(sql);
		});
	}

	return {
		dropTable: drop,
		new: function(info, callback){
			var builds = [], vals = [], _q = [];
			for(var key in info){
				builds.push(key);
				vals.push(info[key]);
				_q.push("?");
			}
			var sql = 'INSERT INTO '+ defaults.table +'('+ builds.join(",") +') VALUES ('+ _q.join(",") +')';
			_db.transaction(function(tx) {
				tx.executeSql(sql, vals, callback, onError);
			});
		},
		update: function(id, info, callback){
			var builds = [], vals = [];
			for(var key in info){
				builds.push(key +"=?");
				vals.push(info[key]);
			}
			var sql = 'UPDATE '+ defaults.table +' SET '+ builds.join(",");
			_db.transaction(function(tx) {
				tx.executeSql(sql, vals, callback, onError);
			});
		},
		get: function(id, callback){
			var sql = "SELECT * FROM "+ defaults.table +" WHERE id=?";
			_db.transaction(function(tx) {
				tx.executeSql(sql, [id], callback, onError);
			});
		},
		getAll: function(condition, callback){
			var sql = "SELECT * FROM "+ defaults.table;
			if(condition)
				sql+= " "+ condition;
			_db.transaction(function(tx) {
				tx.executeSql(sql, [], function(tx, result){
					if(result){
						callback(result);
					}
				}, onError);
			});
		},
		delete: function(id, callback){
			_db.transaction(function(tx) {
				tx.executeSql("DELETE FROM "+ defaults.table +" WHERE id=?", [id], callback, onError);
			});
		},
		truncate: function(){
			drop();
			createTable();
		}
	}
}