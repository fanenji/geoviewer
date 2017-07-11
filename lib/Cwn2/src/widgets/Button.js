/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.Widget.Button', {
    constructor: function(widgetConfig, statusbar) {
        "use strict";
        CWN2.Util.log('CWN2.Widget.button');

        var id = widgetConfig.id,
            text = "bottone",
            handler = null,
            width = null;

        if (!widgetConfig.id) {
            CWN2.Util.log("Attenzione: id widget Button non definito", 0);
        }
        var map = CWN2.app.map;

        if (widgetConfig.options) {
            if (widgetConfig.options.text) {
                text = widgetConfig.options.text;
            }
            if (widgetConfig.options.handler) {
                handler = widgetConfig.options.handler;
            }
            if (widgetConfig.options.width) {
                width = widgetConfig.options.width;
            }
            if (widgetConfig.options.align && widgetConfig.options.align === "right") {
                statusbar.addStatusbarItem('->');
            }
        }

        return [
            {
                xtype: "button",
                id: id,
                text: CWN2.I18n.get(text),
                width: width,
                handler: handler
            }
        ];
    }
});





