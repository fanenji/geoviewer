//http://parodi.datasiel.net/geoviewer/pages/apps/ambienteinliguria/gestionale.html?idRichiesta=79227770358004

Ext.application({
    name: 'sirgil',

    launch: function() {
        var idRichiesta = CWN2.Util.getUrlParam('idRichiesta');

        var config = {
            "application": {
                "mapOptions": {
                    "restrictedExtent": "830036,5402959,1123018,5597635"
                },
                "layout": {
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
                                            }
                                        ]
                                    },
                                    {"name": "removelayers" },
                                    {"name": "find", "panels": [
                                        { "type": "layer", "name": "Livello" }
                                    ]},
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
                { "type": "google_roadmap" },
                { "type": "google_satellite", "visible": true}
            ]
        };

        if (!idRichiesta) {
            var idMap = 1276;
        }
        CWN2.app.load({
            appConfig: config,
            idRequest: idRichiesta,
            idMap: idMap,
            loadBaseLayers: true,
            debug: false,
            findOptions: {
                maxZoomLevel: 17
            },
            app: 'sirgil',
            setMapTitle: 'titolo'
        });

    } //eo launch
});




