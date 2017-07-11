Ext.application({
    name: 'MappaPTR',

    launch: function() {
        var config = {
            "application": {
                "mapOptions": {
                    "restrictedExtent": "830036,5402959,1123018,5597635"
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
                        "type": "simple",
                        "position": "east"
                    },
                    "widgets": [
                        { "name": "Scale" },
                        { "name": "CoordinateReadOut" }
                    ],
                    "toolbar": {
                        "itemGroups": [
                            {
                                "items": [
                                    { "name": "pan" },
                                    { "name": "zoomin" },
                                    { "name": "zoomout" },
                                    { "name": "fitall" },
                                    { "name": "zoomprevious" },
                                    { "name": "zoomnext" }
                                ]
                            },
                            {
                                "name": "misurazioni",
                                "items": [
                                    { "name": "measureline" },
                                    { "name": "measurearea" }
                                ]
                            },
                            {
                                "name": "avanzate",
                                "items": [
                                    {"name": "infowms" },
                                    {"name": "transparency" },
                                    {"name": "loadlayers",
                                        "panels": [
                                            {
                                                "type": "mapTree",
                                                "name": "PTR",
                                                "options": {
                                                    "treeServiceUrl": "http://geoportale.regione.liguria.it/geoservices/REST/config/ag_canale_tree/102"
                                                }
                                            },
                                            {
                                                "type": "mapTree",
                                                "name": "Repertorio Cartografico",
                                                "options": {
                                                    "treeServiceUrl": "http://geoportale.regione.liguria.it/geoservices/REST/config/rep_carto_tree/03"
                                                }
                                            }

                                        ]
                                    },
                                    {"name": "removelayers" },
                                    {"name": "routeplanner", "options": { "flagLimitaTerritorioLigure": "true" }},
                                    '-',
                                    {"type": "combo", "name": "geocoder"}
                                ]
                            }
                        ]
                    }
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
            idMap: "1633",
            debug: false,
            setMapTitle: 'titolo'
        });
    } //eo launch
});