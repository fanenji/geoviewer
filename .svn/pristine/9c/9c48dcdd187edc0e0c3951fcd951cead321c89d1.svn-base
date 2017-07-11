Ext.application({
    name: 'repertorio',

    ricercaParticellaCatastale: function (codiceLivello, bounds, layer, chiave, valore) {
        //var searchBounds = OpenLayers.Bounds.fromString(CWN2.Util.transformStrBounds("EPSG:3003", CWN2.app.map.projection, bounds));

        CWN2.Util.ajaxRequest({
            type: "JSONP",
            url: "/geoservices/REST/coordinate/transform_bbox/3003/3857/" + bounds,
            callBack: function(response) {
                var searchBounds = OpenLayers.Bounds.fromString(response.data[0][0] + "," + response.data[1][0]);
                CWN2.FeatureLoader.loadMarker(
                    {
                        x: searchBounds.getCenterLonLat().lon,
                        y: searchBounds.getCenterLonLat().lat,
                        map: CWN2.app.map,
                        label: valore.replace('_','unica'),
                        zoomLevel: 17
                    }
                );
            }
        });


    },

    launch: function() {
        // calcolo il codice catalogo della mappa nel caso di chiamata da geoportale - (r_liguri:D.383.DS:2015-05-26/r_liguri:D.1698:2015-02-02)
        var idMap = decodeURIComponent(CWN2.Util.getUrlParam('id'));
        if (idMap.indexOf("r_liguri") >= 0) {
            idMap = idMap.replace("r_liguri:D.","").replace(".DS","").replace(".VS","");
            if (idMap.indexOf(":") > 0) {
                idMap = idMap.substring(0, idMap.indexOf(":"))
            }
            if (idMap.indexOf(".") > 0) {
                idMap = idMap.substring(0, idMap.indexOf("."))
            }
        }

        var toolbar = {
            "scale": "small",
            "itemGroups": [
                {
                    "items": [
                        { "name": "pan" },
                        { "name": "zoomin" },
                        { "name": "zoomout" },
                        //{ "name": "fitall" },
                        { "name": "zoomToInitialExtent" },
                        { "name": "zoomprevious" },
                        { "name": "zoomnext" }
                    ]
                },
                {
                    "items": [
                        { "name": "measureline" },
                        { "name": "measurearea" }
                    ]
                },
                {
                    "items": [
                        {"name": "infowms",
                            "options": {
                                //radius: 100
                            }
                        },
                        {"name": "transparency" },
                        {"name": "loadlayers",
                            "panels": [
                                {
                                    "type": "mapTree",
                                    "name": "Repertorio Cartografico",
                                    "options": {
                                        "treeServiceUrl": "http://geoportale.regione.liguria.it/geoservices/REST/config/rep_carto_tree/03"
                                    }
                                },
                                {
                                    "type": "wms",
                                    "name": "Livelli WMS",
                                    "options": {}
                                },
                                {
                                    "type": "kml",
                                    "name": "File KML/GPX",
                                    "options": {}
                                }

                            ]
                        },
                        {"name": "removelayers" },
                        {"name": "find", "panels": [
                            { "type": "layer", "name": "Livello" },
                            { "type": "coordinate", "name": "Coordinate" }
                        ]},
                        {"name": "routeplanner", "options": { "flagLimitaTerritorioLigure": "true" }},
                        {"name": "s3ricerche",
                            "options": {
                                id: "s3ricerche",
                                url: "/sigmater/script/CwRicercheS3.asp?applicazione=REPERTORIO",
                                tooltip: "Ricerca Particella Catastale",
                                render: "panel"
                            }
                        },
                        {"name": "print" },
                        {"type": "combo", "name": "geocoder"}


                    ]
                },
                {
                    "name": "sfondi",
                    "align": "right",
                    "items": [
                        {"type": "combo", "name": "base-layers"}
/*
                        ,{
                            "name": "simpleLegend",
                            "options": { noBaseLayerGrid: true }
                        }
*/
                    ]
                }
            ]
        };

        var config = {
            "application": {
                "mapOptions": {
                    "displayProjection": "EPSG:4326",
                    "initialExtent": "830036,5402959,1123018,5597635",
                    "restrictedExtent": "600000,5300000,1300000,5700000"
                },
                "layout": {
                    "header": {
                        "html": "<div><table><tr><td><img src='http://geoportale.regione.liguria.it/geoviewer/img/logo_regioneliguria_chiaro.jpg' ></td><td>&nbsp;&nbsp;</td><td><div id='titolo'></div></td></tr></table></div>",
                        "height": 85,
                        "style": {
                            "background-color": "#99cccc"
                        }
                    },
                    "statusBar": true,
                    "legend": {
                        "type": "tree",
                        "position": "east",
                        "noBaseLayerGrid": true
                    },
                    "widgets": [
                        { "name": "ScaleCombo" },
                        { "name": "CoordinateReadOut" }
                    ],
                    "toolbar": toolbar
                }
            },
            "baseLayers": [
                { "type": "no_base" },
                { "type": "rl_ortofoto_2013" },
                { "type": "rl_carte_base"},
                { "type": "OSM" },
                { "type": "google_terrain" },
                { "type": "google_roadmap" },
                { "type": "google_satellite"}
            ]
        };

        CWN2.app.load({
            appConfig: config,
            geoserverUrl: "http://parodi.datasiel.net:8080/",
            idMap: 1742,
            loadBaseLayers: true,
            debug: true,
            setMapTitle: 'titolo'
        });


    } //eo launch
});



