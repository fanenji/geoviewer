/*
 *
 * Class: CWN2.Control.DeleteFeature
 *
 * Controllo OpenLayers Custom che permette di cancellare feature sulla mappa.
 *
 *
 */

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/

CWN2.Control.DeleteFeature = OpenLayers.Class(OpenLayers.Control.SelectFeature, {

    /**
     *
     * Constructor: CWN2.Control.DeleteFeature
     * Costruttore
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} Points will be added to this layer.
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     *
     */
    initialize: function(layer, options) {

        var deleteControl = this;

        function showConfirmDialog(feature) {
            Ext.MessageBox.confirm(
                CWN2.I18n.get('Conferma'),
                CWN2.I18n.get('Sei sicuro di voler cancellare la feature?'),
                function(btn) {
                    if (btn === "yes") {
                        layer.destroyFeatures([feature]);
                    } else {
                        deleteControl.unselect(feature);
                    }
                }
            );
        }

        OpenLayers.Control.SelectFeature.prototype.initialize.apply(this,
            [layer, {onSelect: showConfirmDialog}]);

    },

    CLASS_NAME: "CWN2.Control.DrawPoint"

});
