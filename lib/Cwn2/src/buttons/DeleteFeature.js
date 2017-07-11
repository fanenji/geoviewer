/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.button.DeleteFeature', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-deletefeature',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            editingLayer = CWN2.Editor.createEditingLayer(map),
            control = new CWN2.Control.DeleteFeature(editingLayer),
            id = "deleteFeature";

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Cancella Geometria"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));

    }
});