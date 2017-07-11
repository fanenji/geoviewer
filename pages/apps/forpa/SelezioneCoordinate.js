

//http://dts-parodi_s.datasiel.net/geoviewer/pages/apps/forpa/SelezioneCoordinate.html?ID_MAP=56&ID_SESSION=999999997&FIND=SI&ADDRESS=via+vado+genova

    Ext.application({
        name: 'ForpaSelezioneCoordinate',

        launch: function() {
            var config = {
                "application": {
                    "mapOptions": {
                        "displayProjection": "EPSG:25832",
                        "initialExtent": "830036,5402959,1123018,5597635",
                        "restrictedExtent": "830036,5402959,1123018,5597635"
                    },
                    "layout": {
                        "statusBar": true,
                        "widgets": [
                            { "name": "Scale" },
                            { "name": "CoordinateReadOut" }
                        ],
                        "legend": {
                            "type": "simple",
                            "position": "east",
                            "collapsed": false
                        },
                        "toolbar": {
//                            "pressed": "coordinate",
                            "itemGroups": [
                                {
                                    "items": [
                                        { "name": "pan" },
                                        { "name": "zoomin" },
                                        { "name": "zoomout" },
                                        { "name": "fitall" },
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
                                        //{"name": "routeplanner", "options": { "flagLimitaTerritorioLigure": "true" }},
                                        //{"name": "print" },
                                        {"type": "combo", "name": "geocoder"}
                                    ]

                                },
                                {
                                    "items": [
                                        {
                                            "name": "coordinate",
                                            "options": {
                                                "projection": "EPSG:25832"
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                },
                "baseLayers": [
                    { "type": "no_base" },
                    { "type": "OSM" },
                    { "type": "rl_ortofoto_2013" },
                    { "type": "google_terrain" },
                    { "type": "google_roadmap" },
                    { "type": "google_satellite", "visible": true}
                ]
            };

            $(window).on('beforeunload', function() {
                return insertAnnulla();
            });

            var flagInsert = false;

            function cancel() {
                Ext.MessageBox.confirm(
                        CWN2.I18n.get('Conferma'),
                        CWN2.I18n.get('Sei sicuro?'),
                        function(btn) {
                            if (btn === "yes") {
                                insert(0, '');
                            }
                        }
                );
            }

            // funzione richiamata dalla chiusura della finestra
            function insertAnnulla() {
                if (flagInsert) {
                    return;
                }
                insert(0, 0, "NO");
            }

            function insert(x, y, esito) {
                var insertService = "/geoservices/REST/config/ag_insert_coordinate?";
                insertService += "idSession=" + CWN2.Util.getUrlParam('ID_SESSION');
                insertService += "&coord_x=" + x;
                insertService += "&coord_y=" + y;
                insertService += "&esito=" + esito;
                CWN2.Util.ajaxRequest({
                    type: "JSONP",
                    url: insertService,
                    callBack: function(response) {
                        if (response && !response.success) {
                            CWN2.Util.msgBox("Attenzione: - " + response.message);
                        }
                        flagInsert = true;
                        window.close();
                    }
                });
            }

            function impostaFunzioniCallback() {
                CWN2.app.setButtonOption("coordinate", "callBacks", {
                    "submit": function(geom) {
                        insert(geom.x, geom.y, "SI");
                    },
                    "cancel": function(items) {
                        Ext.MessageBox.confirm(
                                CWN2.I18n.get('Conferma'),
                                CWN2.I18n.get('Sei sicuro?'),
                                function(btn) {
                                    if (btn === "yes") {
                                        insert(0, 0, "NO");
                                    }
                                }
                        );
                    }
                });
            }

            var idMap = decodeURIComponent(CWN2.Util.getUrlParam('ID_MAP'));
            var find = decodeURIComponent(CWN2.Util.getUrlParam('FIND'));
            var idLayer = "L" + decodeURIComponent(CWN2.Util.getUrlParam('ID_LAYER'));
            var campoPk = decodeURIComponent(CWN2.Util.getUrlParam('FIELD'));
            var values = decodeURIComponent(CWN2.Util.getUrlParam('CODICE')); //008065E
            var address = decodeURIComponent(CWN2.Util.getUrlParam('ADDRESS')); //008065E

            var findOptions = null;
            if (find === "SI") {
                if (idLayer !== "Lnull") {
                    findOptions = {
                        layers: [idLayer],
                        fields: campoPk,
                        values: values,
                        maxZoomLevel: 18
                    };
                }
                if (address !== "null") {
                    findOptions = {
                        address: address,
                        maxZoomLevel: 18
                    };
                }
            }

            // carico la mappa
            CWN2.app.load({
                appConfig: config,
				proxy: "/geoservices/proxy/proxy.jsp?url=",
				idMap: idMap,
                callBack: impostaFunzioniCallback,
				findOptions: findOptions,
                debug: true
            });

        }
    });
