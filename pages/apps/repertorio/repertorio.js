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


      var idMap = decodeURIComponent(CWN2.Util.getUrlParam('id'));

      // calcolo il codice catalogo della mappa nel caso di chiamata da geoportale - (r_liguri:D.383.DS:2015-05-26/c_a922:D.1773:2017-01-23)
      // http://geoportale.regione.liguria.it/geoviewer/pages/apps/repertorio/repertorio.html?id=r_liguri:D.1752:2016-09-09
      // http://geoportale.regione.liguria.it/geoviewer/pages/apps/repertorio/repertorio.html?id=c_a922:D.1773:2017-01-23

      var start = idMap.indexOf(":");
      if (start >= 0) {
        idMap = idMap.substr(start+3);
        var end = idMap.indexOf(":");
        if (end >= 0) {
          idMap = idMap.substr(0,end);
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
                        { "name": "ScaleCombo" },
                        { "name": "CoordinateReadOut" }
                    ],
                    "toolbar": toolbar
                }
            },
            "baseLayers": [
                // { "type": "no_base" },
                // { "type": "rl_ortofoto_2013" },
                // { "type": "OSM" },
                // { "type": "google_terrain" },
                // { "type": "google_roadmap" },
                // { "type": "rl_carte_base"},
                // { "type": "rl_ortofoto_2007"},
                // { "type": "rl_ortofoto_2010"},
                { "type": "rl_ortofoto_2016"},
                { "type": "google_satellite", "visible": true}
            ]
        };

        CWN2.app.load({
            appConfig: config,
            idMap: idMap,
            loadBaseLayers: true,
            debug: true,
            app: 'geoportale',
            setMapTitle: 'titolo'
        });


    } //eo launch
});


