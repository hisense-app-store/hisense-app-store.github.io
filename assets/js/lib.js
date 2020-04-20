function AppStore() {
    this._objH = null;

    if (typeof HiBrowser != 'undefined') {
        console.log('HiBrowser Object found.');
        this._objH = HiBrowser;
    } else if (typeof Hisense != 'undefined') {
        console.log('Hisense Object found.');
        this._objH = Hisense;
    } else {
        console.log('No Hisense Object found.');
    }

    if (this._objH) {
        this._objH.loadLibrary('libhspdk-jsx.so');
    }

    var _arr = []; // for tests

    this._readJson = function(path) {
        var arr = [];
        if (this._objH) {
            var str = this._objH.File.read(path, 1);
            try {
                var obj = JSON.parse(str);
                if (obj.AppInfo || false) {
                    arr = obj.AppInfo;
                }
            } catch (e) {}
        } else {
            arr = _arr;
        }
        return arr;
    };

    this._writeJson = function(path, arr) {
        var obj = { AppInfo: arr };
        if (this._objH) {
            this._objH.File.write(path, JSON.stringify(obj), 1);
        } else {
            _arr = arr;
        }
    }
}

AppStore.prototype.isSupported = function() {
    return !!this._objH;
};

AppStore.prototype.getInstalled = function() {
    var arr = [];

    arr = arr.concat(this._readJson('launcher/preset.txt'));
    arr = arr.concat(this._readJson('launcher/Appinfo.json'));

    return arr;
};

AppStore.prototype.install = function(appId, appName, appUrl, thumbnail, iconSmall, iconBig, callback) {
    console.log('Install App from App Store: ' + appId);

    var now = new Date();

    var item = {
        'AppId': appId,
        'Thumb': thumbnail,
        'Icon_96': iconSmall,
        'Image': thumbnail,
        'URL': appUrl,
        'AppName': appName,
        'Title': appName,
        'IconURL': iconBig,
        'StartCommand': appUrl,
        'InstallTime': now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate(),
        'RunTimes': 0,
        'StoreType': 'widget',
        'PreInstall': false
    };

    var installed = false;
    var arr = this.getInstalled();
    for (var index = 0; index < arr.length; index++) {
        if ((item.AppName.toLowerCase() == arr[index].AppName.toLowerCase()) || (item.URL == arr[index].StartCommand)) {
            installed = true;
            break;
        }
    }

    if (!installed) {
        var arr = this._readJson('launcher/Appinfo.json');
        arr.push(item);
        this._writeJson('launcher/Appinfo.json', arr);
    }

    callback(installed);
};

AppStore.prototype.uninstall = function(appId, callback) {
    console.log('Uninstall App: ' + appId);

    var uninstalled = false;
    var arr = this._readJson('launcher/Appinfo.json');
    for (var index = 0; index < arr.length; index++) {
        if (arr[index].AppId == appId) {
            arr.splice(index, 1);
            uninstalled = true;
        }
    }
    if (uninstalled) {
        this._writeJson('launcher/Appinfo.json', arr);
    }

    callback(uninstalled);
};