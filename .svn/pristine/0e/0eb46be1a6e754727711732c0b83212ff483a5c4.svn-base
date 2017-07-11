Ext.define('CWN2.button.Transparency', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-transparency',

    constructor: function(config) {
        var btnOptions = config.options;

        this.superclass.constructor.call(this, {
            id: "transparency",
            tooltip: CWN2.I18n.get("Trasparenza"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "transparency",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false
        });
    }
});

Ext.define('CWN2.button.Transparency.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-transparency-win',

    title: CWN2.I18n.get("Trasparenza"),
    height: 300,
    width: 330,
    layout: "fit",
    resizable: false,

    constructor: function(config) {
        var sliders = [];
        Ext.each(config.layers, function(layer, i) {
            var olLayer = config.mapPanel.map.getLayerByName(layer.data.name);
            sliders.push({
                xtype: "gx_opacityslider",
                layer: olLayer,
                aggressive: true,
                width: 300,
                isFormField: true,
                labelWidth: 150,
                fieldLabel: layer.data.legendLabel
            });
        });

        this.items = [
            {
                xtype: 'panel',
                height: "auto",
                width: "auto",
                frame: true,
                items: sliders,
                autoScroll: true
            }
        ];

        this.superclass.constructor.call(this);
    }
});

// CONTROLLER
Ext.define('CWN2.controller.button.transparency', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.Transparency'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-transparency'
        },
        {
            ref: 'win',
            selector: 'cwn2-transparency-win'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.transparency: init');

        this.control({
            'cwn2-button-transparency': {
                click: this.onClick
            }
        });
    },

    onClick: function() {
        var mapPanel = CWN2.app.layout.mapPanel,
            win = this.getWin(),
            button = this.getButton(),
            me = this;

        if (!win) {
            win = Ext.create('CWN2.button.Transparency.Window', {
                layers: CWN2.app.map.layerManager.getLayerStore("overlay").data.items,
                mapPanel: CWN2.app.layout.mapPanel
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