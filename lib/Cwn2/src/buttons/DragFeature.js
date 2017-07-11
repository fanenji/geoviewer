/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.button.DragFeature', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-dragfeature',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            editingLayer = CWN2.Editor.createEditingLayer(map),
            control = new OpenLayers.Control.DragFeature(editingLayer),
            id = "dragFeature";

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Sposta Geometria"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});

