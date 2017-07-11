/*
 *
 * Class: CWN2.Control.GetMapCoordinatesOnClick
 *
 * Controllo OpenLayers Custom che permette di richiamare una funzione di callback sull evento click sulla mappa OL.
 *
 * In fase di attivazione del controllo e' possibile impostare i parametri da passare alla funzione di callback.
 *
 *  Esempio:
 *  (start code)
 *  var clickMapCtrl = new CWN2.Control.GetMapCoordinatesOnClick({
 *      callback: setPointOnMap
 *  });
 *  clickMapCtrl.activate({
 *      type: "start"
 *  });
 *  (end)
 *
 */

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/

CWN2.Control.GetMapCoordinatesOnClick = OpenLayers.Class(OpenLayers.Control, {

    // funzione da richiamare al click
    callback: null,

    // opzioni: oggetto che viene passato alla funzione di callback
    params: {},

    /**
     *
     * Constructor: CWN2.Control.GetMapCoordinatesOnClick
     * Costruttore
     *
     * Parameters:
     * callback - {Function} funzione di callback da richiamare al click
     *
     */
    initialize: function(callback) {

        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
        "use strict";

        // controllo che callback sia una funzione
        try {
            CWN2.Util.assert(
                (typeof callback === "function"),
                {
                    name: "NotFunction",
                    message: "CWN2.Control.GetMapCoordinatesOnClick: parametro deve essere una funzione",
                    level: 1
                }
            );
        } catch (exception) {
            CWN2.Util.handleException(exception);
            return null;
        }

        this.callback = callback;

        OpenLayers.Control.prototype.initialize.apply(this, [callback]);

        var callbacks = {};
        callbacks["click"] = this.getInfoForClick;
        this.handler = new OpenLayers.Handler.Click(
            this,
            callbacks
        );

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

    // funzione richiamata al click
    // calcola le coordinate e richiama la funzione di callback passando le coordinate
    // ed eventuali parametri

    getInfoForClick: function(evt) {

        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
        "use strict";

        var mapCoord,
            displayCoord,
            wgs84Coord;

        mapCoord = this.map.getLonLatFromPixel(evt.xy);
        displayCoord = mapCoord.clone();
        wgs84Coord = mapCoord.clone();

        if (this.map.getProjectionObject() !== this.map.displayProjection) {
            displayCoord = displayCoord.transform(
                this.map.getProjectionObject(),
                this.map.displayProjection
            );
        }

        if (this.map.projection !== "EPSG:4326") {
            wgs84Coord = wgs84Coord.transform(
                this.map.getProjectionObject(),
                new OpenLayers.Projection("EPSG:4326")
            );
        }

        if (typeof this.callback === "function") {
            this.callback(mapCoord, displayCoord, wgs84Coord, this.params);
        }
    },

    CLASS_NAME: "CWN2.Control.GetMapCoordinatesOnClick"

});
