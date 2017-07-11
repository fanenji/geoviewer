Ext.define('CWN2.button.window', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-window',

    constructor: function(config) {
        var btnOptions = config.options;

        this.config = config;

        this.superclass.constructor.call(this, {
            tooltip: (btnOptions && btnOptions.tooltip) ? btnOptions.tooltip : CWN2.I18n.get("Finestra"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : btnOptions.id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            id: btnOptions.id
        });
    }
});

// CONTROLLER
Ext.define('CWN2.controller.button.window', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.window'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-window'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.window: init');

        this.control({
            'cwn2-button-window': {
                click: this.onClick
            }
        });
    },

    onClick: function() {
        this.createWin(this.getButton());
    },

    createWin: function(button) {
        var mapPanel = CWN2.app.layout.mapPanel,
            width = button.config.options.winWidth || 600,
            height = button.config.options.winHeight || 400,
            url = button.config.options.url,
            resizable = button.config.options.resizable || false,
            target = button.config.options.target || "panel",
            winId = button.config.options.id + "-win";

        if (!url) {
            CWN2.Util.handleException({
                message: "Url del bottone 'window' non definita",
                level: 1
            });
            return;
        }
        if (target === "panel") {
            var win = Ext.ComponentQuery.query("#" + winId)[0];
            if (!win) {
                win = Ext.create('CWN2.IframeWindow', {
                    url: url,
                    id: winId,
                    width: width,
                    height: height,
                    resizable: resizable,
                    hide: true
                });
            }
            this.showHideWin(win, mapPanel);
        } else {
                window.open(url,"menubar=no,location=no,resizable=no,scrollbars=yes,status=no,width=" + width + ",height=" + height);
        }
    },

    showHideWin: function(win, mapPanel) {
        if (!win.isVisible()) {
            win.show();
            win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
        } else {
            win.hide();
        }
    }
});