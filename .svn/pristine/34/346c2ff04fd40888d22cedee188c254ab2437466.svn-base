/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.Widget.Scale', {
    constructor: function(widgetConfig, statusbar) {
        "use strict";
        CWN2.Util.log('CWN2.Widget.Scale');

        var statusBarItemName = "cwn2-scale-div";
        var map = CWN2.app.map;

        function drawScale() {
            var text = " 1:" + map.getScale().toFixed(0);
            statusbar.setStatusbarItemText(statusBarItemName, text);
        }

        // registro l'evento sul mousemove (scrittura coodinate su statusbar)
        map.events.register("zoomend", map, drawScale);

        drawScale();

        return [CWN2.I18n.get("Scala"), {
            id: statusBarItemName,
            text: '',
            width: 60,
            xtype: "tbtext"
        }];
    }
});

