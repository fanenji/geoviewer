Ext.define('CWN2.button.DrawRegularPolygon', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-drawregularpolygon',

    constructor: function(config) {
        var btnOptions = config.options || {},
            handlerOptions,
            map = CWN2.app.map,
            id = btnOptions.id || "drawRegularPolygon";

        btnOptions.type = btnOptions.type || "rectangle";

        switch (btnOptions.type) {
            case "rectangle":
                handlerOptions = {
                    "sides": 4,
                    "irregular": true
                };
                break;
            case "circle":
                handlerOptions = {
                    "sides": 40
                };
                break;
            case "triangle":
                handlerOptions = {
                    "sides": 3
                };
                break;
            case "pentagon":
                handlerOptions = {
                    "sides": 5
                };
                break;
            case "hexagon":
                handlerOptions = {
                    "sides": 6
                };
                break;
        }


        btnOptions.handlerOptions = handlerOptions;

        var control = new CWN2.Control.DrawRegularPolygon(CWN2.Editor.createEditingLayer(map, btnOptions.styleMap), btnOptions);

        // Se esiste funzione callback definita nelle opzioni del bottone la chiamo passando la geometria
        control.events.register('featureadded', this, function(evt) {
            if (btnOptions.callback && typeof btnOptions.callback == "function") {
                btnOptions.callback(evt.feature.geometry,evt);
            }
        });

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: (btnOptions && btnOptions.tooltip) ? CWN2.I18n.get(btnOptions.tooltip) : CWN2.I18n.get("Inserisci un poligono"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "drawPolygon",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});

