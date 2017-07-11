Ext.define('CWN2.button.Pan', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-pan',

    constructor: function(config) {
        var id = "pan",
            btnOptions = config.options,
            btnPanels = config.panels,
            map = CWN2.app.map,
            control = new OpenLayers.Control.Navigation();

        map.addControl(control);
        map.getControlsByClass("OpenLayers.Control.Navigation")[0].deactivate();

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            tooltip: CWN2.I18n.get("Pan"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            //width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            scale: config.scale,
            enableToggle: true,
            control: control,
            id: id,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});


