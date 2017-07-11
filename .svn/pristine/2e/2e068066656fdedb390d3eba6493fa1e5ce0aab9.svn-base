/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.button.Generic', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-generic',

    constructor: function(config) {
        var btnOptions = config.options || {},
            map = CWN2.app.map,
            id = "generic";

        this.options = btnOptions;

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: (btnOptions && btnOptions.tooltip) ? btnOptions.tooltip : CWN2.I18n.get("Bottone Generico"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26
        }));
    }
});

Ext.define('CWN2.controller.button.generic', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.Generic'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-generic'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.generic: init');

        this.control({
            'cwn2-button-generic': {
                click: this.onClick
            }
        });
    },

    onClick: function() {
        var btnOptions = this.getButton().options;

            // richiamo funzione di callback
        if (btnOptions.callback && typeof btnOptions.callback === "function") {
            btnOptions.callback();
        } else {
            CWN2.Util.log('CWN2.button.Generic: funzione di callback non definita',2);
        }
    }


});
