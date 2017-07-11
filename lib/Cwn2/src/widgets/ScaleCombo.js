/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.Widget.ScaleCombo', {
    constructor: function(widgetConfig, statusbar) {
        "use strict";
        CWN2.Util.log('CWN2.Widget.ScaleCombo');

        var statusBarItemName = "cwn2-scale-combo-div";
        var map = CWN2.app.map;

        function drawScale() {
            combo.setValue(map.zoom.toString());
        }

        // registro l'evento sul mousemove (selezione combo)
        map.events.register("zoomend", map, drawScale);

        var scales = Ext.create('Ext.data.Store', {
            fields: ['zoom', 'scale'],
            data : [
//                {"zoom":"7", "scale":"3.200.000"},
                {"zoom":"8", "scale":"1:1.600.000"},
                {"zoom":"9", "scale":"1:800.000"},
                {"zoom":"10", "scale":"1:400.000"},
                {"zoom":"11", "scale":"1:200.000"},
                {"zoom":"12", "scale":"1:100.000"},
                {"zoom":"13", "scale":"1:50.000"},
                {"zoom":"14", "scale":"1:25.000"},
                {"zoom":"15", "scale":"1:12.500"},
                {"zoom":"16", "scale":"1:6.250"},
                {"zoom":"17", "scale":"1:3.125"},
                {"zoom":"18", "scale":"1:1.560"},
                {"zoom":"19", "scale":"1:800"},
                {"zoom":"20", "scale":"1:400"}
            ]
        });

        var combo = Ext.create('Ext.form.ComboBox', {
            store: scales,
            queryMode: 'local',
            displayField: 'scale',
            valueField: 'zoom',
            width: 100,
            editable: false,
            listeners:
            {
                select: function (cmb, record, index)
                {
                    var zoom = parseInt(record[0].data.zoom);
                    if (CWN2.app.map.zoom !== zoom) {
                        CWN2.app.map.zoomTo(zoom);
                    }
                }
            }
        })

        return [CWN2.I18n.get("Scala "), combo];
    }
});
