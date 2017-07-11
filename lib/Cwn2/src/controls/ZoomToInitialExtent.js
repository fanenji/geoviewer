/**
 * Class: CWN2.Control.ZoomToInitialExtent
 * The ZoomToExtent control is a button that zooms out to the initial extent
 * of the map.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
CWN2.Control.ZoomToInitialExtent = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: type
     * {String} The type of <OpenLayers.Control> -- When added to a
     *     <Control.Panel>, 'type' is used by the panel to determine how to
     *     handle our events.
     */
    type: OpenLayers.Control.TYPE_BUTTON,

    /*
     * Method: trigger
     * Do the zoom.
     */
    trigger: function() {
        if (this.map) {
            this.map.zoomToInitialExtent();
        }
    },

    CLASS_NAME: "OpenLayers.Control.ZoomToExtent"
});
