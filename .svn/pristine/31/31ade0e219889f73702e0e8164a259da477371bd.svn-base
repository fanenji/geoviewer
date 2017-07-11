Ext.define('CWN2.button.RemoveLayers', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-removelayers',

    constructor: function(config) {
        var btnOptions = config.options,
            id = "removelayers",
            map = CWN2.app.map;

        this.config = config;

        this.superclass.constructor.call(this, {
            tooltip: CWN2.I18n.get("Togli Livelli"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false,
            id: id,
            handler: function() {

            }
        });

    }
});

Ext.define('CWN2.button.RemoveLayers.GridPanel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.cwn2-removelayers-grid',
    id: "remove-layer-panel",
    disableSelection: true,
    header: false,
    hideHeaders: true,
    columns: [
        {
            dataIndex: "name",
            renderer: function(id) {
                return "<input name='" + id + "' id='rm_check_" + id + "' type='checkbox' >";
            },
            width: 25
        },
        {
            dataIndex: "legend",
            renderer: function(legend, metaData, record) {
                var label = record.data.legendLabel;
                return "<div>" + label + " </div>";
            },
            width: 275
        }
    ],
    autoScroll: true,
    width: 320,
    frame: true,

    constructor: function(config) {
        this.store = config.store;

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.RemoveLayers.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-removelayers-win',
    title: CWN2.I18n.get("Seleziona i livelli da eliminare"),
    height: 300,
    width: 360,
    layout: "fit",
    resizable: false,
    closable: false,
    closeAction: "hide",

    constructor: function(config) {
        this.items = [
            {
                xtype: 'cwn2-removelayers-grid',
                store: config.store
            }
        ];
        this.buttons = config.buttons;

        this.superclass.constructor.call(this);
    }
});

// CONTROLLER
Ext.define('CWN2.controller.button.removelayers', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.RemoveLayers',
        'CWN2.button.RemoveLayers.Window'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-removelayers'
        },
        {
            ref: 'win',
            selector: 'cwn2-removelayers-win'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.removelayers: init');

        this.control({
            'cwn2-button-removelayers': {
                click: this.onClick
            },
            'button[action=removelayers-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=removelayers-cancel]': {
                click: this.onCancelButtonClick
            }
        });
    },

    onSubmitButtonClick: function() {
        var rmLayerArray = [];
        Ext.each(CWN2.app.map.layerManager.getLayersConfig(), function(layer) {
            var check = window.document.getElementById("rm_check_" + layer.name);
            if (check && check.checked) {
                rmLayerArray.push(layer.name);
            }
        });
        // aggiorno la applicazione
        CWN2.app.map.layerManager.remove(rmLayerArray);
        // nascondo la finestra
        this.getWin().hide();
    },

    onCancelButtonClick: function() {
        this.getWin().hide();
    },

    onClick: function() {
        var mapPanel = CWN2.app.layout.mapPanel,
            win = this.getWin(),
            button = this.getButton(),
            me = this;

        if (!win) {
            win = Ext.create('CWN2.button.RemoveLayers.Window', {
                store: CWN2.app.map.layerManager.getLayerStore("overlay"),
                buttons: [
                    {
                        action: "removelayers-submit",
                        text: CWN2.I18n.get("Rimuovi")
                    },
                    {
                        action: "removelayers-cancel",
                        text: CWN2.I18n.get("Annulla")
                    }
                ]
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