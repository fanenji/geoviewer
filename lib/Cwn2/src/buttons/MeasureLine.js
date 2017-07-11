Ext.define('CWN2.button.MeasureLine', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-measureline',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            statusBarItemName = "cwn2-measure-div",
            id = "measureline",
            control = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
                persist: true,
                geodesic: true,
                eventListeners: {
                    measure: function(evt) {
                        var text = CWN2.I18n.get("Distanza") + ": " + evt.measure.toFixed(3) + " " + evt.units;
                        Ext.ComponentQuery.query('cwn2-statusbar')[0].setStatusbarItemText(statusBarItemName, text);
                    },
                    measurepartial: function(evt) {
                        var text = CWN2.I18n.get("Distanza") + ": " + evt.measure.toFixed(3) + " " + evt.units;
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
            tooltip: CWN2.I18n.get("Misure Lineari"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            enableToggle: true,
            control: control,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});


