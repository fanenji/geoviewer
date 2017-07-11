/**
 *
 * Class: CWN2.LayerModel
 *
 * Oggetto per la gestione dei layer:
 *
 * -    Inizializzare i repository dei layer
 * -    Fornire informazioni sui layer disponibili ai moduli che lo richiedono, in particolare i metodi getBaseLayersConfig e getLayersConfig forniscono le configurazioni dei layer di base e overlay
 * -    Aggiungere layer ai repository
 * -    Rimuovere i layer dai repository
 * -    Creazione di layer di servizio (per esempio per le operazioni di find o calcolo percorsi)
 *
 *
 */

Ext.define('CWN2.LayerModel', {
    extend: 'Ext.data.Model',
    statics: {
        /**
         * Convenience function for creating new layer model instance object
         * using a layer object.
         *
         * @param {OpenLayers.Layer} layer
         * @return {GeoExt.data.LayerModel}
         * @static
         */
        createFromLayer: function(layer) {
            return this.getProxy().reader.readRecords([layer]).records[0];
        }
    },
    fields: [
        {name: "id", type: 'string'},
        {name: "name", type: 'string'},
        {name: "legendIcon", type: 'string'},
        {name: "legendLabel", type: 'string'},
        {name: "legendPopUpFlag", type: 'bool'},
        {name: "legendLabel", type: 'string'},
        {name: "minScale", type: 'int'},
        {name: "maxScale", type: 'int'},
        {name: "legendPopUpUrl", type: 'string'},
        {name: "multiClasse", type: 'bool'},
        {name: "visible", type: 'bool'},
        {name: "inRange", type: 'bool'},
        {name: "config"}

    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    /**
     * Returns the {OpenLayers.Layer} layer object used in this model instance.
     *
     * @return {OpenLayers.Layer}
     */
    getLayer: function() {
        return this.raw;
    }
});