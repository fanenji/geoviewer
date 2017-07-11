//http://parodi.datasiel.net/geoviewer/pages/apps/ambienteinliguria/gestionale.html?idRichiesta=79227770358004

Ext.application({
    name: 'ambienteinliguria',

    launch: function() {
        var idRichiesta = CWN2.Util.getUrlParam('idRichiesta');

        var config = {
            "application": {
                "mapOptions": {
                    "restrictedExtent": "830036,5402959,1123018,5597635"
                },
                "layout": {
                    "header": {
                        "html": "<div><table><tr><td><img src='http://geoportale.regione.liguria.it/geoviewer/img/ambienteinliguria.gif' ></td><td>&nbsp;&nbsp;</td><td><div id='titolo'></div></td></tr></table></div>",
                        "height": 125,
                        "style": {
                            "background-color": "#ffffff"
                        }
                    },
                    "statusBar": true,
                    "legend": {
                        "type": "simple",
                        "position": "east"
                    },
                    "widgets": [
                        { "name": "ScaleCombo" }
                    ],
                    "toolbar": {
                        "itemGroups": [
                            {
                                "items": [
                                    { "name": "pan" },
                                    { "name": "zoomin" },
                                    { "name": "zoomout" },
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
                                                "type": "mapTree",
                                                "name": "Canali Tematici",
                                                "options":
                                                {
                                                    "treeServiceUrl": "/geoservices/REST/config/ag_app_canali_tree/ECO3/"
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
                                    {"type": "combo", "name": "geocoder"}
                                ]
                            }
                        ]
                    },
                    "ag_toolbar": {
                        "COORDINATE": CWN2.MapCatalogueLoader.ag_bottoni_coordinate("EPSG:3003"),
                        "FILTRO": CWN2.MapCatalogueLoader.ag_bottoni_filtro(),
                        "LIGHT_FILTRO": CWN2.MapCatalogueLoader.ag_bottoni_filtro()
                    }
                }
            },
            "baseLayers": [
                { "type": "no_base" },
                { "type": "rl_ortofoto_2013" },
                { "type": "google_roadmap" },
                { "type": "google_satellite", "visible": true}
            ]
        };

        CWN2.app.load({
            appConfig: config,
            idRequest: idRichiesta,
            loadBaseLayers: true,
            debug: false,
            findOptions: {
                maxZoomLevel: 17
            },
            app: 'ambiente-gestionale',
            setMapTitle: 'titolo'
        });

    } //eo launch
});



