Ext.application({
    name: 'corem',


    launch: function() {
        // imposto la url del servizio di configurazione
        var idRequest = CWN2.Util.getUrlParam('ID_RICHIESTA');
        var idMap = CWN2.Util.getUrlParam('ID_MAP');

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
                                }
                            ]
                        },
                        {"name": "removelayers" },
                        {"name": "find", "panels": [{ "type": "layer", "name": "Livello" }]},
                        {"name": "routeplanner", "options": { "flagLimitaTerritorioLigure": "true" }},
                        {"name": "print" },
                        {"type": "combo", "name": "geocoder"}
                    ]
                }
            ]
        };

        var config = {
            "application": {
                "mapOptions": {
                    "initialExtent": "830036,5402959,1123018,5597635",
                    "restrictedExtent": "600000,5300000,1300000,5700000"
                },
                "layout": {
                    "header": null,
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
//                { "type": "rl_carte_base"},
//                { "type": "OSM" },
//                { "type": "google_terrain" },
//                { "type": "google_roadmap" },
//                { "type": "google_satellite", "visible": true}
            ]
        };


        CWN2.app.load({
            appConfig: config,
            idRequest: idRequest,
            idMap: idMap,
            loadBaseLayers: true,
            debug: true,
            flagGeoserver: true,
            geoserverUrl: "http://geoservizi.regione.liguria.it/",
            setMapTitle: 'none'
        });


    } //eo launch
});



