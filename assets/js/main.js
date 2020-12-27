var pos = 0;
var actions = [];
var debug = false;

var console_log = function () {};
if (typeof console != "undefined" && typeof console.log != 'undefined') {
    console_log = console.log;
}

console.log = function (message) {
    console_log(message);
    if (debug) {
        var msg = '';
        if (typeof message == 'object') {
            msg = (JSON && JSON.stringify ? JSON.stringify(message) : message);
        } else {
            msg = message;
        }

        var debugDiv = $('#debug');
        if (debugDiv.hasClass('hide')) {
            debugDiv.removeClass('hide');
        }
        debugDiv.append('<p>' + msg + '</p>').animate({ scrollTop: debugDiv.prop('scrollHeight')}, 1000);
    }
};
console.error = console.debug = console.info = console.log;


$(document).ready(function() {
    var appStore = new AppStore();

    if (!debug && !appStore.isSupported()) {
        $('#unsupport').removeClass('hide');
    } else {
        makeList(appStore);
        markInstalled(appStore);
        bindKeys();
        actions[pos].focus();
    }
});

function makeList(appStore) {
    $.each(APP_STORE, function(k, data) {
        addTile(data, appStore);
    });
}

function addTile(data, appStore) {
    var img = data.icon || window.location.origin + '/assets/icons/' + data.appid + '.png?1';
    var cnt = $('#container');
    var tile = $('#empty_tile').clone();
    tile.find('.icon img').attr('src', img);
    tile.find('.name').text(data.name);
    tile.find('.text').text(data.text);
    tile.find('.install').data('appid', data.appid);
    tile.removeClass('hide');
    cnt.append(tile);

    tile.find('.install').click(function() {
        appStore.install(data.appid, data.name, data.url, img, img, img, function() {
            markInstalled(appStore);
            actions[pos].focus();
        });
    });

    tile.find('.uninstall').click(function() {
        appStore.uninstall(data.appid, function() {
            markInstalled(appStore);
            actions[pos].focus();
        });
    });
}

function markInstalled(appStore) {
    var data = appStore.getInstalled();
    var INSTALLED = [];
    $.each(data, function (k, v) {
        if (v.AppId != null) {
            INSTALLED.push(v.AppId);
        }
    });

    actions = [];
    $('.tile').each(function () {
        var tile = $(this);
        if (!tile.hasClass('empty_tile')) {
            var installBtn = $(this).find('.install');
            var uninstallBtn = $(this).find('.uninstall');
            var appid = installBtn.data('appid');
            if ($.inArray(appid, INSTALLED) < 0) {
                uninstallBtn.addClass('hide');
                installBtn.removeClass('hide');
                actions.push(installBtn);
            } else {
                installBtn.addClass('hide');
                uninstallBtn.removeClass('hide');
                actions.push(uninstallBtn);
            }
        }
    });
}

function bindKeys() {
    $('body').keydown(function(event) {
        var key = event.which;
        if (key == 38) {
            event.preventDefault();
            up();
        }

        if (key == 40) {
            event.preventDefault();
            down();
        }
    });
}

function up() {
    pos--;
    if (pos < 0) {
        pos = 0;
    }
    actions[pos].focus();
}

function down() {
    last = actions.length - 1;
    pos++;
    if (pos > last) {
        pos = last;
    }
    actions[pos].focus();
}