var fs = require('fs-extra');
var path = require('path');
var debug = require('debug')('cfg');

var pkRoot = process.env.PKROOT || __dirname;

var cfgApi = module.exports = {
	readCfg: readCfg,
	writeCfg: writeCfg,
	readCfgSync: readCfgSync,
	writeCfgSync: writeCfgSync
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


function readCfg(app, name, cb) {
	var appCfgPath = path.join(pkRoot, 'cfgDb', app, name + '.json');
	var appCfgBakPath = path.join(pkRoot, 'cfgDb', app, name + '.bak.json');

	fs.readJson(appCfgPath, function(err, cfgObj) {
		if (err) {
			debug('original file is broken, read the bak file. err: ' + err);
			fs.readJson(appCfgBakPath, function(err, cfgBakObj) {
				if (err) {
					debug('Bak file is broken, rm both files. err: ' + err);
					// too many async codes, use sync instead...
					fs.removeSync(appCfgPath);
					fs.removeSync(appCfgBakPath);
					return cb({});
				}
				debug('Bak file is ok, copy to original file.');
				fs.copy(appCfgBakPath, appCfgPath, function(err) {
					return cb(cfgBakObj);
				});
			});
			return;
		}
		return cb(cfgObj);
	});
}


function writeCfg(app, name, data, cb) {
	var appCfgPath = path.join(pkRoot, 'cfgDb', app, name + '.json');
	var appCfgBakPath = path.join(pkRoot, 'cfgDb', app, name + '.bak.json');

	fs.mkdirsSync(path.join(pkRoot, 'cfgDb', app));
	fs.copy(appCfgPath, appCfgBakPath, function(err) {
		if (err) {
			debug('failed in backup cfg file? path: ' + appCfgPath + 'err: ' + err);
		}

		fs.writeJson(appCfgPath, data, function(err) {
			if (err) {
				console.log('failed in writing cfg to path: ' + appCfgPath + 'err: ' + err);
			}
			return cb('');
		});
	});

}

function readCfgSync(app, name) {
	var appCfgPath = path.join(pkRoot, 'cfgDb', app, name + '.json');
	var appCfgBakPath = path.join(pkRoot, 'cfgDb', app, name + '.bak.json');

	var content = null;

	// Read the original file.
	try {
		content = fs.readJsonSync(appCfgPath);
	} catch (e) {
		debug('Catch Error while reading', appCfgPath, e);
		content = null;
	}

	if (!content) {
		debug('original file is broken, read the bak file.');
		try {
			content = fs.readJsonSync(appCfgBakPath);
		} catch (e) {
			debug('Catch Error while reading', appCfgBakPath, e);
			content = null;
		}

		if (!content) {
			debug('Bak file is broken, rm both files.');
			try {
				fs.removeSync(appCfgPath);
				fs.removeSync(appCfgBakPath);
			} catch (e) {
				debug('Catch Error while rming', appCfgPath, appCfgBakPath, e);
			}
			return {};
		} else {
			debug('Bak file is ok, copy to original file.');
			try {
				fs.copySync(appCfgBakPath, appCfgPath);
			} catch (e) {
				debug('Catch Erro while cp', appCfgBakPath, appCfgPath, e);
			}
			return content;
		}
	} else {
		return content;
	}

	return content;
}

function writeCfgSync(app, name, data) {
	var appCfgPath = path.join(pkRoot, 'cfgDb', app, name + '.json');
	var appCfgBakPath = path.join(pkRoot, 'cfgDb', app, name + '.bak.json');

	try {
		fs.mkdirsSync(path.join(pkRoot, 'cfgDb', app));
	} catch (e) {
		debug('Catch Error in makedir:', appCfgPath, e);
	}

	try {
		fs.copySync(appCfgPath, appCfgBakPath);
	} catch (e) {
		debug('Catch Error in copying:', appCfgPath, appCfgBakPath, e);
	}

	try {
		fs.writeJsonSync(appCfgPath, data);
	} catch (e) {
		debug('Catch Error: in writing', appCfgPath, appCfgBakPath, e);
		return false;
	}
	return true;
}
