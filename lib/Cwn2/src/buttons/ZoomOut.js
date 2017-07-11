Ext.define('CWN2.button.ZoomOut', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-zoomout',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            id = "zoomout",
            control = new OpenLayers.Control.ZoomBox({out: true});

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Zoom Out"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            enableToggle: true,
            control: control,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});


