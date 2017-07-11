/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.button.DrawPoint', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-drawpoint',

    constructor: function(config) {
        var btnOptions = config.options || {},
            map = CWN2.app.map,
            id = "drawPoint",
            control = new CWN2.Control.DrawPoint(CWN2.Editor.createEditingLayer(map, btnOptions.styleMap), btnOptions);

        // Se esiste funzione callback definita nelle opzioni del bottone la chiamo passando la geometria
        control.events.register('featureadded', this, function(evt) {
            if (btnOptions.callback && typeof btnOptions.callback == "function") {
                btnOptions.callback(evt.feature.geometry,evt);
            }
        });

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Inserisci Punto"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});

