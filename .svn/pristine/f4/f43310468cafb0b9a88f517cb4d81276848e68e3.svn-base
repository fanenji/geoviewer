Ext.application({
    name: 'ambienteinliguria',

    launch: function() {
        var idRichiesta = CWN2.Util.getUrlParam('idRichiesta') || CWN2.Util.getUrlParam('id_richiesta');

        var config = {
            "application": {
                "mapOptions": {
                    //"restrictedExtent": "830036,5402959,1123018,5597635"
                },
                "layout": {
                    "header": {
                        "html": "<div><table><tr><td><img src='http://geoportale.regione.liguria.it/geoviewer/img/ambienteinliguria.gif' ></td><td>&nbsp;&nbsp;</td><td><div id='titolo'></div></td></tr></table></div>",
                        "height": 125,
                        "style": { "background-color": "#ffffff" }
                    },
                    "statusBar": false,
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
/*                            {
                                "items": [
                                    { "name": "pan" },
                                    { "name": "zoomin" },
                                    { "name": "zoomout" },
                                    { "name": "zoomToInitialExtent" },
                                    { "name": "zoomprevious" },
                                    { "name": "zoomnext" }
                                ]
                            },*/
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
                                                    "treeServiceUrl": "http://geoportale.regione.liguria.it/geoservices/REST/config/ag_app_canali_tree/ECO3/"
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
                                    {"name": "window",
                                        "options": {
                                            id: "window",
                                            tooltip: "Metadati",
                                            url: "http://www.cartografiarl.regione.liguria.it/SiraWebGis/sitInfoCarta.asp?Entita=918",
                                            winWidth: 800,
                                            winHeight: 600,
                                            iconCls: "metadati"
                                        }
                                    },
                                    {"type": "combo", "name": "geocoder"},
                                    {
                                        "name": "qpgtematismi",
                                        "options": {}
                                    }
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



        CWN2.app.load({
            appConfig: config,
            qpgRequest: idRichiesta,
            loadBaseLayers: true,
            debug: true,
            setMapTitle: 'titolo'
        });

    } //eo launch
});




