Ext.define('CWN2.button.MeasureArea', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-measurearea',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            id = "measurearea",
            statusBarItemName = "cwn2-measure-div",
            control = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
                persist: true,
                geodesic: true,
                eventListeners: {
                    measure: function(evt) {
                        var text = CWN2.I18n.get("Area") + ": " + evt.measure.toFixed(3) + " " + evt.units + "2";
                        Ext.ComponentQuery.query('cwn2-statusbar')[0].setStatusbarItemText(statusBarItemName, text);
                    },
                    measurepartial: function(evt) {
                        var text = CWN2.I18n.get("Area") + ": " + evt.measure.toFixed(3) + " " + evt.units + "2";
                        Ext.ComponentQuery.query('cwn2-statusbar')[0].setStatusbarItemText(statusBarItemName, text);
                    }
                }
            });

        // aggiungo alla statusbar il campo per la visualizzazione delle misure
        Ext.ComponentQuery.query('cwn2-statusbar')[0].addStatusbarItem({
            id: statusBarItemName,
            text: "",
            width: 200,
            xtype: "tbtext"
        });

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Misure Areali"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            enableToggle: true,
            control: control,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});


