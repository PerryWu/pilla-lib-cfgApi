var fs = require('fs-extra');
var path = require('path');
var debug = require('debug')('cfg');

var pillaRoot = process.env.PILLAROOT || __dirname;

function cfgApi(obj) {
	for (var key in obj) {
		this[key] = obj[key];
	}
};


/*
	File Structure
	==================
	cfgDb/
		app1/
			cfg1.json
			cfg1.bak.json
			cfg2.json
			cfg2.bak.json
		app2/
			cfg.json
			cfg.bak
	==================

	call readCfg, will get content from app/name.json.
	If app/name.json is broken, get the content from app/name.bak.json instead.
	And, restore the app/name.json from app/name.bak.json.
	If both files are broken, set them to zero.
	
	call writeCfg will cp app/name.json to app/name.bak.json and write content to app/name.json
*/


cfgApi.prototype.readCfg = function(app, name, cb) {
	var appCfgPath = path.join(pillaRoot, 'cfgDb', app, name + '.json');
	var appCfgBakPath = path.join(pillaRoot, 'cfgDb', app, name + '.bak.json');

	fs.readJson(appCfgPath, function(err, cfgObj) {
		if (err) {
			debug('original file is broken, read the bak file. err: ' + err);
			fs.readJson(appCfgBakPath, function(err, cfgBakObj) {
				if (err) {
					debug('Bak file is broken, rm both files. err: ' + err);
					// too many async codes, use sync instead...
					fs.removeSync(appCfgPath);
					fs.removeSync(appCfgBakPath);
					cb({});
					return;
				}
				debug('Bak file is ok, copy to original file.');
				fs.copy(appCfgBakPath, appCfgPath, function(err) {
					cb(cfgBakObj);
					return;
				});
			});
			return;
		}
		cb(cfgObj);
		return;
	});
}


cfgApi.prototype.writeCfg = function(app, name, data, cb) {
	var appCfgPath = path.join(pillaRoot, 'cfgDb', app, name + '.json');
	var appCfgBakPath = path.join(pillaRoot, 'cfgDb', app, name + '.bak.json');

	fs.mkdirsSync(path.join(pillaRoot, 'cfgDb', app));
	fs.copy(appCfgPath, appCfgBakPath, function(err) {
		if (err) {
			debug('failed in backup cfg file? path: ' + appCfgPath + 'err: ' + err);
		}

		fs.writeJson(appCfgPath, data, function(err) {
			if (err) {
				console.log('failed in writing cfg to path: ' + appCfgPath + 'err: ' + err);
			}
			cb('');
			return;
		});
	});

}

cfgApi.prototype.readCfgSync = function(app, name, data) {
	// Not implemeneted
	return;
}


cfgApi.prototype.writeCfgSync = function(app, name, data) {
	// Not implemeneted
	return;
}


module.exports = cfgApi;
