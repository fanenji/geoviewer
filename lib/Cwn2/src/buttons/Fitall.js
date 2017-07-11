Ext.define('CWN2.button.Fitall', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-fitall',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            control = new OpenLayers.Control.ZoomToMaxExtent();

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            tooltip: CWN2.I18n.get("Zoom alla massima estensione"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "fit",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false,
            control: control,
            id: "fitall"
        }));
    }
});


