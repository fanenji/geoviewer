Ext.application({
    name: 'repertorio',

    ricercaParticellaCatastale: function (codiceLivello, bounds, layer, chiave, valore) {
        var searchBounds = OpenLayers.Bounds.fromString(CWN2.Util.transformStrBounds("EPSG:3003", CWN2.app.map.projection, bounds));

        CWN2.FeatureLoader.loadMarker(
            {
                x: searchBounds.getCenterLonLat().lon,
                y: searchBounds.getCenterLonLat().lat,
                map: CWN2.app.map,
                label: valore.replace('_','unica'),
                zoomLevel: 17
            }
        );
    },

    launch: function() {
        // imposto la url del servizio di configurazione
        var title = decodeURIComponent(CWN2.Util.getUrlParam('title')).replace(/\+/g, ' ');
        var resource = decodeURIComponent(CWN2.Util.getUrlParam('resource'));
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
                    //"displayProjection": "EPSG:3857",
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

        CWN2.app.load({
            appConfig: config,
            callBack: addResource,
            callBackArgs: {
                idMap: idMap,
                title: title,
                resource: resource
            }
        });

    } //eo launch
});

addResource = function(args) {

    var idMap = args.idMap,
        title = args.title,
        resource = args.resource,
        tipoServizio = null,
        serviceUrl = null;

    if (resource !== "null" && resource !== "0") {
        tipoServizio = resource.substr(0, resource.indexOf(':'));
        serviceUrl = resource.substr(resource.indexOf(':') + parseInt(1));
    }

    if (resource !== "null" && resource !== "0" && tipoServizio !== "wms") {
        alert('Risorsa di tipo ' + tipoServizio + ' non gestita');
        return false;
    }

    var setExtent = function(extent) {
        var transformedExtent = CWN2.Util.transformStrBounds("EPSG:3003", "EPSG:3857", extent);
        var bounds = transformedExtent.split(',');
        CWN2.app.map.zoomToExtent(bounds);
    };

    var getIdMapFromServiceUrl = function(serviceUrl) {
        var result;
        result = new RegExp("([0-9]+)\.map").exec(serviceUrl);
        if (result) {
            return result[1];
        }
        result = new RegExp("([0-9]+)\.asp").exec(serviceUrl);
        if (result) {
            return result[1];
        }
    };

    var map = idMap;
    if (map === "null") {
        if (serviceUrl !== null) {
            map = getIdMapFromServiceUrl(serviceUrl);
        } else {
            var exception = {};
            exception.message = "Errore: parametri 'id' o 'resource' non impostati";
            exception.level = 2;
            CWN2.Util.handleException(exception);
            return;
        }
    }

    CWN2.app.loadMap({
        idMap: map,
        loadBaseLayers: true,
        setMapTitle: 'titolo'
    });

};



