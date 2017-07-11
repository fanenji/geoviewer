Ext.define('CWN2.button.S3Ricerche', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-s3ricerche',

    constructor: function(config) {
        var btnOptions = config.options;

        this.config = config;

        this.superclass.constructor.call(this, {
            tooltip: (btnOptions && btnOptions.tooltip) ? btnOptions.tooltip : CWN2.I18n.get("Ricerca avanzata"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : btnOptions.id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            id: btnOptions.id
        });
    }
});

// CONTROLLER
Ext.define('CWN2.controller.button.s3ricerche', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.S3Ricerche'
    ],

    refs: [
        {
            ref: 'buttonS3ricerche',
            selector: '#s3ricerche'
        },
        {
            ref: 'buttonS3RicercaPraticaGenioWeb',
            selector: '#s3RicercaPraticaGenioWeb'
        },
        {
            ref: 'win',
            selector: 'cwn2-button-s3ricerche'
        }

    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.s3ricerche: init');

        this.control({
            '#s3ricerche': {
                click: this.onClickS3ricerche
            },
            '#s3RicercaPraticaGenioWeb': {
                click: this.onClickS3RicercaPraticaGenioWeb
            }
        });
    },

    onClickS3ricerche: function() {
        this.createWin(this.getButtonS3ricerche());
    },

    onClickS3RicercaPraticaGenioWeb: function() {
        this.createWin(this.getButtonS3RicercaPraticaGenioWeb());
    },

    createWin: function(button) {
        var mapPanel = CWN2.app.layout.mapPanel,
            width = button.config.options.panelWidth || 400,
            height =button.config.options.panelHeight || 400,
            winId = button.config.options.id + "-win";

        var win = Ext.ComponentQuery.query("#" + winId)[0];
        if (!win) {
            win = Ext.create('CWN2.IframeWindow', {
                url: button.config.options.url,
                id: winId,
                width: width,
                height: height,
                resizable: false,
                hide: true
            });
        }
        this.showHideWin(win, mapPanel);
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