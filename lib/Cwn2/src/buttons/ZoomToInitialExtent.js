Ext.define('CWN2.button.ZoomToInitialExtent', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-zoomtoinitialextent',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            id = "zoomToInitialExtent",
            control = new CWN2.Control.ZoomToInitialExtent();

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            tooltip: CWN2.I18n.get("Zoom alla estensione iniziale"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false,
            control: control,
            id: id
        }));
    }
});


