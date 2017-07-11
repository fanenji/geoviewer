/*
 *
 * Class: CWN2.Control.RegularPolygon
 *
 * Controllo OpenLayers Custom che permette di disegnare poligoni regolari sulla mappa.
 *
 *
 */

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/

CWN2.Control.DrawRegularPolygon = OpenLayers.Class(OpenLayers.Control.DrawFeature, {

    // flag singleGeometry se impostato a true permette l'inserimento di una sola geometria
    singleFeature: false,

    /**
     *
     * Constructor: CWN2.Control.DrawPoint
     * Costruttore
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} Points will be added to this layer.
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     *
     */
    initialize: function(layer, options) {

        // passare opzioni per handler
        // es: rettangolo
        // handlerOptions: {
        //    sides: 4,
        //    irregular: true
        // }
        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this,
            [layer, OpenLayers.Handler.RegularPolygon, options]);

        if (options && options.singleFeature) {
            this.singleFeature = true;
        }

    },

    /**
     *
     * Function: activate
     * Attiva il controllo, nel parametro params vengono impostati eventuali parametri da passare
     * alla funzione di callback
     *
     * Parameters:
     * params {Object} Oggetto contenente i parametri
     * da passare alla funzione di callback
     *
     */
    activate: function(params) {

        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
        "use strict";

        this.params = params;

        return OpenLayers.Control.prototype.activate.apply(this, arguments);

    },

    deactivate: function(params) {

        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
        "use strict";

        this.params = params;

        return OpenLayers.Control.prototype.deactivate.apply(this, arguments);

    },

    /**
     * Method: draw feature
     */
    drawFeature: function(geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry),
            proceed = this.layer.events.triggerEvent('sketchcomplete', {feature: feature});
        if (proceed !== false) {
            // se impostato singleGeometry rimuovo le feature
            if (this.singleFeature) {
                this.layer.removeAllFeatures();
            }
            feature.state = OpenLayers.State.INSERT;
            this.layer.addFeatures([feature]);
            this.featureAdded(feature);
            this.events.triggerEvent('featureadded', {feature: feature});
        }
    },

    CLASS_NAME: "CWN2.Control.DrawLine"

});
