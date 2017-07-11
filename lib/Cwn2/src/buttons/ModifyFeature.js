Ext.define('CWN2.button.ModifyFeature', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-modifyfeature',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            id = "modifyFeature",
            mode = OpenLayers.Control.ModifyFeature.RESHAPE,
            ctrlOptions = {
                mode: mode,
                createVertices: true
            },
            control = new OpenLayers.Control.ModifyFeature(CWN2.Editor.createEditingLayer(map), ctrlOptions);

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Modifica geometria"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));

    }
});

