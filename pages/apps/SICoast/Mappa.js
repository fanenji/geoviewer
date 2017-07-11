Ext.application({
    name: 'SICoast',

    launch: function() {

        var idMap = decodeURIComponent(CWN2.Util.getUrlParam('id'));

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
                        {"name": "infowms" },
                        {"name": "find", "panels": [{ "type": "layer", "name": "Livello" }]},
                        {"name": "routeplanner", "options": { "flagLimitaTerritorioLigure": "true" }},
                        {"name": "print" },
                        {"type": "combo", "name": "geocoder"}
                    ]
                },
                {
                    "items": [
                        {"name": "loadlayers",
                            "panels": [
                                {
                                    "type": "mapTree",
                                    "name": "PTR",
                                    "options": {
                                        "treeServiceUrl": "http://geoportale.regione.liguria.it/geoservices/REST/config/ag_canale_tree/43"
                                    }
                                },
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
                                }

                            ]
                        },
                        {"name": "removelayers" },
                        {"name": "transparency" }
                    ]
                }
            ]
        };

        var config = {
            "application": {
                "mapOptions": {
                    "restrictedExtent": "830036,5402959,1123018,5597635"
                },
                "layout": {
                    "header": {
                        "html": "<div><table><tr><td><img src='images/img_sicoast.gif' ></td><td>&nbsp;&nbsp;</td><td><div id='titolo'></div></td></tr></table></div>",
                        "height": 85,
                        "style": {
                            "background-color": "#99cccc"
                        }
                    },
                    "statusBar": true,
                    "legend": {
                        "type": "simple",
                        "position": "east"
                    },
                    "widgets": [
                        { "name": "Scale" },
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
                { "type": "google_satellite", "visible": true}
            ]
        };

        // Creo la applicazione CWN2
        CWN2.app.load({
            appConfig: config,
            idMap: idMap,
            loadBaseLayers: true,
            debug: true,
            setMapTitle: 'titolo'
        });
    } //eo launch
});
