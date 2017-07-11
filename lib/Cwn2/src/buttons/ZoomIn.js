Ext.define('CWN2.button.ZoomIn', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-zoomin',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            id = "zoomin",
            control = new OpenLayers.Control.ZoomBox();

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Zoom In"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});



