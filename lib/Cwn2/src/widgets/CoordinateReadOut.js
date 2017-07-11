/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.Widget.CoordinateReadOut', {
    constructor: function(widgetConfig, statusbar) {
        "use strict";
        CWN2.Util.log('CWN2.Widget.CoordinateReadOut');

        var statusBarItemName = "cwn2-coordinate-readout-div";
        var map = CWN2.app.map;

        // funzione di callback richiamata sull'evento mousemove
        function drawMeasure(e) {
            var lonLat = map.getLonLatFromPixel(e.xy),
                decimalPlaces = 0,
                text;

            if (map.displayProjection) {
                if (map.displayProjection.projCode === "EPSG:4326") {
                    decimalPlaces = 6;
                }
                lonLat.transform(map.getProjectionObject(), map.displayProjection);
            }

            text = " X=" + lonLat.lon.toFixed(decimalPlaces) + " Y=" + lonLat.lat.toFixed(decimalPlaces);

            statusbar.setStatusbarItemText(statusBarItemName, text);

        }

        // registro l'evento sul mousemove (scrittura coodinate su statusbar)
        map.events.register("mousemove", map, drawMeasure);

        return [CWN2.I18n.get("Coordinate:"), {
            id: statusBarItemName,
            text: '',
            width: 200,
            xtype: "tbtext"
        }];
    }
});




