/**
 *
 * Class: CWN2.Editor
 *
 * Raccoglie le funzioni per l'editing delle geometrie
 *
 */
Ext.define("CWN2.Editor", {

    singleton: true,

    /**
     *
     * Function: createEditingLayer
     *
     * Crea un il layer vettoriale per l'editing.
     *
     * Parameters:
     *
     * Returns:
     * {OpenLayers.Layer} - Il layer OL creato
     *
     */
    createEditingLayer: function createEditingLayer(map, styleMap) {
        CWN2.Util.log("CWN2.Editor.createEditingLayer ");

        var classes = (styleMap) ? { "filter": null, "styleMaps": styleMap } : getClasses();

        var editingLayer = map.layerManager.createVectorLayer({
            name: "editingLayer",
            format: "GeoJSON",
            classes: classes
        });

        // registro gli eventi per il controllo ModifyFeature che deattivano e attivano i controlli base
        editingLayer.events.on({
            "beforefeaturemodified": function() {
                map.featureManager.deactivateControls();
            },
            "afterfeaturemodified": function() {
                map.featureManager.activateControls();
            }
        });
        return editingLayer;

        function getClasses() {
            var styleMaps = [
                {
                    "renderIntent": "default",
                    "style": {
                        pointRadius: 6,
                        fillColor: "#ee9900",
                        fillOpacity: 0.0,
                        hoverFillColor: "white",
                        hoverFillOpacity: 0.8,
                        strokeColor: "#ee9900",
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        strokeLinecap: "round",
                        strokeDashstyle: "solid",
                        hoverStrokeColor: "red",
                        hoverStrokeOpacity: 1,
                        hoverStrokeWidth: 0.2,
                        hoverPointRadius: 1,
                        hoverPointUnit: "%",
                        pointerEvents: "visiblePainted",
                        cursor: "inherit"
                    }
                },
                {
                    "renderIntent": "select",
                    "style": {
                        pointRadius: 6,
                        fillColor: "blue",
                        fillOpacity: 0.0,
                        hoverFillColor: "white",
                        hoverFillOpacity: 0.8,
                        strokeColor: "blue",
                        strokeOpacity: 1,
                        strokeWidth: 2,
                        strokeLinecap: "round",
                        strokeDashstyle: "solid",
                        hoverStrokeColor: "red",
                        hoverStrokeOpacity: 1,
                        hoverStrokeWidth: 0.2,
                        hoverPointRadius: 1,
                        hoverPointUnit: "%",
                        pointerEvents: "visiblePainted",
                        cursor: "pointer"

                    }
                },
                {
                    "renderIntent": "hover",
                    "style": {
                        pointRadius: 6,
                        fillColor: "blue",
                        fillOpacity: 0.0,
                        hoverFillColor: "white",
                        hoverFillOpacity: 0.8,
                        strokeColor: "blue",
                        strokeOpacity: 1,
                        strokeWidth: 2,
                        strokeLinecap: "round",
                        strokeDashstyle: "solid",
                        hoverStrokeColor: "red",
                        hoverStrokeOpacity: 1,
                        hoverStrokeWidth: 0.2,
                        hoverPointRadius: 1,
                        hoverPointUnit: "%",
                        pointerEvents: "visiblePainted",
                        cursor: "pointer"

                    }
                },
                {
                    "renderIntent": "temporary",
                    "style": {
                        fillColor: "#66cccc",
                        fillOpacity: 0.0,
                        hoverFillColor: "white",
                        hoverFillOpacity: 0.8,
                        strokeColor: "#66cccc",
                        strokeOpacity: 1,
                        strokeLinecap: "round",
                        strokeWidth: 2,
                        strokeDashstyle: "solid",
                        hoverStrokeColor: "red",
                        hoverStrokeOpacity: 1,
                        hoverStrokeWidth: 0.2,
                        pointRadius: 6,
                        hoverPointRadius: 1,
                        hoverPointUnit: "%",
                        pointerEvents: "visiblePainted",
                        cursor: "inherit"
                    }
                }
            ];

            return [
                { "filter": null, "styleMaps": styleMaps }
            ];
        }
    },
    /**
     *
     * Function: getEditingGeom
     *
     * Ritorna le geometrie in formato GeoJSON che sono sul layer di editing
     *
     * Parameters:
     * map - {CWN2.Map} Oggetto mappa contenente il layer di editing
     *
     * Returns:
     * {String/Array} - Stringa contenente la geometria in formato GeoJSON oppure
     * un array di stringhe nel caso di geometrie multiple
     *
     */
    getEditingGeom: function getEditingGeom(map, format) {

        CWN2.Util.log("CWN2.Editor.getEditingGeom ");

        var editingLayer = map.getLayerByName("editingLayer");

        if (editingLayer.features.length === 0) {
            return null;
        }

        if (editingLayer.features.length === 1) {
            if (format === "WKT") {
                if (map.projection !== map.displayProjection) {
                    return editingLayer.features[0].geometry.clone().transform(map.projection, map.displayProjection).toString();
                } else {
                    return editingLayer.features[0].geometry.toString();
                }
            } else {
                return getGeoJSONGeometry(map, editingLayer.features[0].geometry);
            }
        }

        if (editingLayer.features.length > 1) {
            var geomArray = [],
                len = editingLayer.features.length;

            for (var i = 0; i < len; i++) {
                if (format === "WKT") {
                    if (map.projection !== map.displayProjection) {
                        geomArray.push(editingLayer.features[0].geometry.clone().transform(map.projection, map.displayProjection).toString());
                    } else {
                        geomArray.push(editingLayer.features[0].geometry.toString());
                    }
                } else {
                    geomArray.push(getGeoJSONGeometry(map, editingLayer.features[i].geometry));
                }
            }
            return geomArray;
        }

        function getGeoJSONGeometry(map, geometry) {
            if (map.projection !== map.displayProjection) {
                geometry = geometry.clone().transform(map.projection, map.displayProjection);
            }

            var geoJSON = new OpenLayers.Format.GeoJSON();
            var geoJSONStr = geoJSON.write(geometry);
            return Ext.JSON.decode(geoJSONStr);
        }

    },

    /**
     *
     * Function: getAreaGeom
     *
     * Ritorna l'area della geometrie che è sul layer di editing
     *
     * Parameters:
     * map - {CWN2.Map} Oggetto mappa contenente il layer di editing
     *
     * Returns:
     * {Float} - Area
     *
     */
    getAreaGeom: function getAreaGeom(map) {
        var editingLayer = map.getLayerByName("editingLayer");
        var len = editingLayer.features.length;
        var area = 0;
        for (var i = 0; i < len; i++) {
            area = area + editingLayer.features[0].geometry.getArea('m');
        }
        return area;
    },

    /**
     *
     * Function: getAreaGeom
     *
     * Ritorna il bound della geometria
     *
     * Parameters:
     * map - {CWN2.Map} Oggetto mappa contenente il layer di editing
     *
     * Returns:
     * {Bounds} - Bounds
     *
     */
    getGeometryBounds: function getGeometryBounds(map) {
        var editingLayer = map.getLayerByName("editingLayer");

        if (editingLayer.features.length === 1) {
            var bounds = editingLayer.features[0].geometry.bounds;
            if (map.projection !== map.displayProjection) {
                return bounds.transform(new OpenLayers.Projection(map.projection), map.displayProjection);
            } else {
                return bounds;
            }

        } else {
            return null;
        }
    }
});

