

    //TODO implementare featureclick per click su icone sovrapposte
    //http://openlayers.org/dev/examples/feature-events.html
    //http://dev.openlayers.org/docs/files/OpenLayers/Events/featureclick-js.html

    Ext.application({
        name: 'cultura',

        launch: function() {

            var id = decodeURIComponent(CWN2.Util.getUrlParam('id'));
            //var relUrl = id + "_TRK.json"
            var baseUrl = "http://geoservizi.datasiel.net:8080/geoserver/sentieri/ows?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1000&outputFormat=text/javascript&srsName=EPSG:4326&cql_filter=COD_PERC=%27" + id + "%27";
            var relUrl = baseUrl + "&typeName=sentieri:REL&";
            var poiUrl = baseUrl + "&typeName=sentieri:POI&";
            var srvUrl = baseUrl + "&typeName=sentieri:SRV&";
            var poiSrvUrl = baseUrl + "&typeName=sentieri:POI_SRV&";
            var iconWidth = 30,
                iconHeight = 24;

            var config = {
                "application": {
                    "name": "Sentieri",
                    "mapOptions": {
                        "displayProjection": "EPSG:4326",
                        "restrictedExtent": "830036,5402959,1123018,5597635"
                    },
                    "layout": {
                        "type": "panel",
                        "width": 1000,
                        "height": 600
                    }
                },
                "baseLayers": [
                    { "type": "google_roadmap", "visible": false },
                    { "type": "google_satellite", "visible": true},
                    { "type": "google_terrain", "visible": false}
                ],
                "layers": [
                    {
                        "type": "JSONP",
                        "name": "REL",
                        "projection": "EPSG:4326",
                        "visible": true,
                        "url": relUrl,
                        "classes": [
                            {
                                "styleMaps": [
                                    {
                                        "renderIntent": "default",
                                        "style": {
                                            "strokeColor": "#ff5500",
                                            "strokeWidth": 5
//                                            ,"graphicTitle": "${LABEL} (${SEGNAVIA})"
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "JSONP",
                        "name": "POI_SRV",
                        "projection": "EPSG:4326",
                        "visible": true,
                        "url": poiSrvUrl,
                        "strategies": [
                            {
                                "name": "Cluster",
                                "options": {
                                    "distance": 20,
                                    "threshold": 2
                                },
                                "style" : {
                                    "externalGraphic": "http://geoportale.regione.liguria.it/CartoWebNet2/img/icons/cultura/parchi_giardini.gif",
                                    "graphicWidth": 40,
                                    "graphicHeight": 35,
                                    "label": true,
                                    "labelOutlineWidth": "5"
                                }
                            }
                        ],
//                        "infoOptions": {
//                            "infoPopUp": "default",
//                            "infoLabelAttr": "DESCRIZIONE"
//                        },
                        "classes": [
                            {
                                "filter": "LAYER = 'SRV'",
                                "styleMaps": [
                                    {
                                        "renderIntent": "default",
                                        "style": {
                                            "externalGraphic": "http://geoportale.regione.liguria.it/CartoWebNet2/img/icons/cultura/alberi-monumentali.gif",
                                            "graphicWidth": iconWidth,
                                            "graphicHeight": iconHeight,
                                            "graphicOpacity": 1,
                                            "graphicTitle":"${DESCRIZIONE}"
                                        }
                                    }
                                ]
                            },
                            {
                                "filter": "LAYER = 'POI'",
                                "styleMaps": [
                                    {
                                        "renderIntent": "default",
                                        "style": {
                                            "externalGraphic": "http://geoportale.regione.liguria.it/CartoWebNet2/img/icons/cultura/cinema.gif",
                                            "graphicWidth": iconWidth,
                                            "graphicHeight": iconHeight,
                                            "graphicOpacity": 1,
                                            "graphicTitle":"${DESCRIZIONE}"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
/*
                    ,{
                        "type": "JSONP",
                        "name": "POI",
                        "projection": "EPSG:4326",
                        "visible": true,
                        "url": poiUrl,
                        "strategies": [
                            {
                                "name": "Cluster",
                                "options": {
                                    "distance": 20,
                                    "threshold": 2
                                },
                                "style" : {
                                    "externalGraphic": "http://geoportale.regione.liguria.it/CartoWebNet2/img/icons/cultura/gallerie_arte.gif",
                                    "graphicWidth": 34,
                                    "graphicHeight": 29,
                                    "label": true,
                                    "labelOutlineWidth": "5"
                                }
                            }
                        ],
                        "infoOptions": {
                            "infoPopUp": "default",
                            "infoLabelAttr": "DESCRIZIONE"
                        },
                        "classes": [
                            {
                                "styleMaps": [
                                    {
                                        "renderIntent": "default",
                                        "style": {
                                            "externalGraphic": "http://geoportale.regione.liguria.it/CartoWebNet2/img/icons/nature/beautifulview.png",
                                            "graphicWidth": 32,
                                            "graphicHeight": 37,
                                            "graphicYOffset": -37,
                                            "graphicOpacity": 1,
                                            "graphicTitle":"${DESCRIZIONE}"
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "JSONP",
                        "name": "SRV",
                        "projection": "EPSG:4326",
                        "visible": true,
                        "url": srvUrl,
                        "strategies": [
                            {
                                "name": "Cluster",
                                "options": {
                                    "distance": 20,
                                    "threshold": 2
                                },
                                "style" : {
                                    "externalGraphic": "http://geoportale.regione.liguria.it/CartoWebNet2/img/icons/cultura/parchi_giardini.gif",
                                    "graphicWidth": 34,
                                    "graphicHeight": 29,
                                    "label": true,
                                    "labelOutlineWidth": "4"
                                }
                            }
                        ],
                        "infoOptions": {
                            "infoPopUp": "default",
                            "infoLabelAttr": "TIPO"
                        },
                        "classes": [
                            {
                                //"filter" : "TIPO = '07'",
                                "styleMaps": [
                                    {
                                        "renderIntent": "default",
                                        "style": {
                                            "externalGraphic": "http://geoportale.regione.liguria.it/CartoWebNet2/img/icons/restaurants-bars/restaurant.png",
                                            "graphicWidth": 32,
                                            "graphicHeight": 37,
                                            "graphicOpacity": 1,
                                            "graphicTitle":"${DESCRIZIONE}"
                                        }
                                    }
                                ]
                            }
                           ,{
                                "filter" : "TIPO = '09'",
                                "styleMaps": [
                                    {
                                        "renderIntent": "default",
                                        "style": {
                                            "externalGraphic": "http://geoportale.regione.liguria.it/CartoWebNet2/img/icons/restaurants-bars/icecream.png",
                                            "graphicWidth": 32,
                                            "graphicHeight": 37,
                                            //"graphicYOffset": -37,
                                            "graphicOpacity": 1,
                                            "graphicTitle":"${DESCRIZIONE}"
                                        }
                                    }
                                ]
                            },
                            {
                                "filter" : "TIPO = '11'",
                                "styleMaps": [
                                    {
                                        "renderIntent": "default",
                                        "style": {
                                            "externalGraphic": "http://geoportale.regione.liguria.it/CartoWebNet2/img/icons/restaurants-bars/bar.png",
                                            "graphicWidth": 32,
                                            "graphicHeight": 37,
                                            //"graphicYOffset": -37,
                                            "graphicOpacity": 1,
                                            "graphicTitle":"${DESCRIZIONE}"
                                        }
                                    }
                                ]
                            }

                        ]
                    }*/
                ]
            };

            function clearPopups(map) {
                if (map.popups && map.popups.length > 0) {
                    for (var i = 0; i < map.popups.length; i++) {
                        var popup = map.popups[i];
                        popup.feature.popup = null;
                        popup.destroy();
                    }
                }
            }


            function addPopup(feature) {
                var id = "info";
                var html = buildHtml(feature);
                var size = calculatePopupSize(feature);
                var anchor = {'size': new OpenLayers.Size(0,0), 'offset': new OpenLayers.Pixel(iconWidth/2, iconHeight/2)};
                var closeBox = true;
                //var closeBoxCallback = null;
                var closeBoxCallback = function() {
                    clearPopups(CWN2.app.map);
                };

                var popup = new OpenLayers.Popup.Anchored(
                    id,
                    feature.geometry.getBounds().getCenterLonLat(),
                    size,
                    html,
                    anchor,
                    closeBox,
                    closeBoxCallback
                );
                popup.feature = feature;
                //popup.backgroundColor = "#FFFFFF";
                //popup.opacity = 0.9;
                //popup.relativePosition = "br";
                popup.panMapIfOutOfView = true;
                popup.calculateNewPx = function(px){
                    if (popup.size !== null){
                        px = px.add(popup.anchor.offset.x, -popup.anchor.offset.y);
                    }
                    return px;
                };
                feature.popup = popup;
                CWN2.app.map.addPopup(popup);
            }


            function calculatePopupSize(feature) {
                var popupWidth = 250;
                var popupHeight = 70;
                if (feature.attributes.NOME) {
                    popupHeight = parseInt(popupHeight) + parseInt(60);
                }
                if (feature.attributes.OSSERVAZ) {
                    popupHeight = parseInt(popupHeight) + parseInt(60);
                }
                if (feature.attributes.FOTO) {
                    popupHeight = parseInt(popupHeight) + parseInt(170);
                }
                return new OpenLayers.Size(popupWidth, popupHeight)
            }

            function buildHtml(feature) {
                var html = '';
                html += '<div id="u97" class="ax_paragraph" data-label="baloon">';
                html += '<p><span style="font-family:\'Times New Roman Grassetto\', \'Times New Roman\';font-weight:700;font-size:18px;">' + feature.attributes.DESCRIZIONE + '</span></p>';
                if (feature.attributes.NOME) {
                    html += '<p><span style="font-family:\'Century Gothic Normale\', \'Century Gothic\';font-weight:400;font-size:12px;">' + feature.attributes.NOME + '</span></p>';
                }
                if (feature.attributes.OSSERVAZ) {
                    html += '<p><span style="font-family:\'Century Gothic Normale\', \'Century Gothic\';font-weight:400;font-size:12px;">' + feature.attributes.OSSERVAZ + '</span></p>';
                }
                if (feature.attributes.FOTO) {
                    var imgUrl = "http://www.cartografiarl.regione.liguria.it/Img/REL/" + feature.attributes.COD_PERC + "/" + feature.attributes.FOTO;
                    html += '<div id="u116" class="ax_image">';
                    html += '<a href="' + imgUrl  + '" target="_blank"><img style="width: 235px; height: 170px" src="' + imgUrl + '"></a>';
                    html += '</div>';
                }
                html += '</div>';

                return html;
            }

            function registerEvents() {
                var map = CWN2.app.map;
                // registro evento per zoom sul layer
                var layer = map.getLayerByName("REL");
                layer.events.register('loadend', layer, function(evt) {
                    map.zoomToExtent(layer.getDataExtent());
                })
                // registro eventi selezione feature
                map.featureManager.registerCallback(
                        "onFeatureSelect",
                        function(feature) {
                            //console.log(feature);
                            if (feature.cluster) {
                                map.setCenter(feature.geometry.getBounds().getCenterLonLat(),map.zoom + 2);
                            } else {
                                clearPopups(map);
                                addPopup(feature);
                            }
                        }
                );
            }

            CWN2.app.load({
                appConfig: config,
                divID: 'mappanel',
                callBack: registerEvents,
                debug: true
            });

        } //eo launch
    });

