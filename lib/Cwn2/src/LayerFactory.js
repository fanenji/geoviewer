/**
 *
 * Class: CWN2.LayerFactory
 *
 *
 * Factory per creazione di layers OpenLayers
 *
 */
Ext.define("CWN2.LayerFactory", {
  singleton: true,

  /**
   *
   * Function: create
   * Crea un Layer OpenLayers in base ad una determinata configurazione
   *
   * Parameters:
   * layerConfig - {Object} Oggetto contenente la configurazione del layer
   *
   * Returns:
   * layer - {OpenLayers.Layer}
   *
   */
  create: function create (layerConfig, map) {
    try {
      var layer = CWN2.LayerFactory[layerConfig.type](layerConfig, map);
      layer.legend = layerConfig.legend;
      if (!layerConfig.legend) {
        layer.displayInLayerSwitcher = false;
      }
      // imnposto un attributo contenente la configurazione del layer
      layer.config = layerConfig;
      return layer;
    }
    catch (exception) {
      throw {
        name: "BadLayerConfig",
        message: "CWN2.LayerFactory.create: Errore creazione layer " + layerConfig.name + " di tipo " + layerConfig.type,
        level: 1
      };
    }
  },

  /*
   *
   * Metodi per creazione dei layer Openlayers dei vari tipi
   *
   */

  setLayerOptions: function (layerConfig, map) {
    var layerOptions = {};
    layerOptions.projection = layerConfig.projection || map.projection;
    layerOptions.opacity = layerConfig.opacity || 1;
    layerOptions.attribution = layerConfig.attribution;
    layerOptions.transitionEffect = "resize";
    //layerOptions.transitionEffect = null;
    layerOptions.metadata = layerConfig.metadata;
    layerOptions.minScale = layerConfig.minScale || null;
    layerOptions.maxScale = layerConfig.maxScale || null;
    layerOptions.infoOptions = layerConfig.infoOptions;
    return layerOptions;
  },

  createGoogleLayer: function (layerType, layerConfig) {
    var maxZoomLevel = (layerType === google.maps.MapTypeId.TERRAIN) ? 15 : 20;
    return new OpenLayers.Layer.Google(
      layerConfig.name,
      {
        type: layerType,
        resolutions: CWN2.Globals.BASE_RESOLUTIONS,
        serverResolutions: CWN2.Globals.BASE_RESOLUTIONS,
        minZoomLevel: 0,
        maxZoomLevel: maxZoomLevel,
        //alwaysInRange: true,
        isBaseLayer: false
      }
    );
  },

  google_roadmap: function (layerConfig) {
    CWN2.Util.log("CWN2.LayerFactory.create google_roadmap");
    return CWN2.LayerFactory.createGoogleLayer(google.maps.MapTypeId.ROADMAP, layerConfig);
  },

  google_satellite: function (layerConfig) {
    CWN2.Util.log("CWN2.LayerFactory.create google_satellite");
    return CWN2.LayerFactory.createGoogleLayer(google.maps.MapTypeId.SATELLITE, layerConfig);
  },

  google_hybrid: function (layerConfig) {
    CWN2.Util.log("CWN2.LayerFactory.create google_hybrid");
    return CWN2.LayerFactory.createGoogleLayer(google.maps.MapTypeId.HYBRID, layerConfig);
  },

  google_terrain: function (layerConfig) {
    CWN2.Util.log("CWN2.LayerFactory.create google_terrain");
    return CWN2.LayerFactory.createGoogleLayer(google.maps.MapTypeId.TERRAIN, layerConfig);
  },

  bing_hybrid: function bing_hybrid () {
    return new OpenLayers.Layer.Bing({
      name: "bing_hybrid",
      key: CWN2.Globals.BING_MAPS_KEY,
      type: "AerialWithLabels",
      resolutions: CWN2.Globals.BASE_RESOLUTIONS,
      isBaseLayer: false
    });
  },

  bing_aerial: function bing_aerial () {
    return new OpenLayers.Layer.Bing({
      name: "bing_aerial",
      key: CWN2.Globals.BING_MAPS_KEY,
      type: "Aerial",
      resolutions: CWN2.Globals.BASE_RESOLUTIONS,
      isBaseLayer: false
    });
  },

  bing_road: function bing_road () {
    return new OpenLayers.Layer.Bing({
      name: "bing_road",
      key: CWN2.Globals.BING_MAPS_KEY,
      type: "Road",
      resolutions: CWN2.Globals.BASE_RESOLUTIONS,
      isBaseLayer: false
    });
  },

  no_base: function no_base (layerConfig) {
    CWN2.Util.log("CWN2.LayerFactory.create no_base");
    return new OpenLayers.Layer(
      layerConfig.name,
      {
        resolutions: CWN2.Globals.BASE_RESOLUTIONS,
        serverResolutions: CWN2.Globals.BASE_RESOLUTIONS,
        alwaysInRange: true,
        isBaseLayer: false
      }
    );
  },

  OSM: function OSM (layerConfig) {
    CWN2.Util.log("CWN2.LayerFactory.create OSM");

    return new OpenLayers.Layer.OSM(
      layerConfig.name,
      null,
      {
        transitionEffect: "resize",
        isBaseLayer: false
      }
    );
  },

  rl_ortofoto_2000_OLD: function (layerConfig, map) {
    var config = {
      "wmsParams": {
        "url": "http://www.cartografiarl.regione.liguria.it/mapfiles/repertoriocartografico/ORTOFOTO/48.asp?",
        "name": "L48",
        "transparent": false,
        "format": "image/jpeg"
      },
      "flagGeoserver": false,
      "type": "WMS",
      "name": "rl_ortofoto_2000",
      "projection": "EPSG:3857",
      "geomType": "RASTER",
      "geomSubType": "RASTER",
      "legend": {
        "label": "Ortofoto IT 2000",
        "icon": "/geoviewer/img/legend/raster.gif"
      },
      "visible": false
    };

    return this.WMS(config, map)
  },

  rl_carte_base_GS: function (layerConfig, map) {
    var config = {
      "wmsParams": {
        "url": "http://geoservizi.regione.liguria.it/geoserver/M1623/wms?",
        "name": "C1623",
        "transparent": false,
        "format": "image/jpeg"
      },
      "flagGeoserver": true,
      "type": "WMS",
      "name": "rl_carte_base_GS",
      "projection": "EPSG:3857",
      "geomType": "RASTER",
      "geomSubType": "RASTER",
      "legend": {
        "label": "Carte di base regionali",
        "icon": "/geoviewer/img/legend/raster.gif"
      },
      "visible": false,
      cacheMinZoomLevel: 7,
      cacheMaxZoomLevel: 17
    };

    return this.WMS(config, map)
  },

  rl_ortofoto_2013_GS: function (layerConfig, map) {
    var config = {
      "wmsParams": {
        "url": "http://geoservizi.regione.liguria.it/geoserver/M1661/wms?",
        "name": "L4419",
        "transparent": false,
        "format": "image/jpeg"
      },
      "flagGeoserver": true,
      "type": "WMS",
      "name": "rl_ortofoto_2013_GS",
      "projection": "EPSG:3857",
      "geomType": "RASTER",
      "geomSubType": "RASTER",
      "legend": {
        "label": "Carte di base regionali",
        "icon": "/geoviewer/img/legend/raster.gif"
      },
      "attribution": "Immagine di proprietà AGEA",
      "visible": false,
      cacheMinZoomLevel: 7,
      cacheMaxZoomLevel: 17
    };

    return this.WMS(config, map)
  },

  rl_ortofoto_2010_GS: function (layerConfig, map) {
    var config = {
      "wmsParams": {
        "url": "http://geoservizi.regione.liguria.it/geoserver/M1505/wms?",
        "name": "L3861",
        "transparent": false,
        "format": "image/jpeg"
      },
      "flagGeoserver": true,
      "type": "WMS",
      "name": "rl_ortofoto_2010_GS",
      "projection": "EPSG:3857",
      "geomType": "RASTER",
      "geomSubType": "RASTER",
      "legend": {
        "label": "Carte di base regionali",
        "icon": "/geoviewer/img/legend/raster.gif"
      },
      "attribution": "Immagine di proprietà AGEA",
      "visible": false,
      cacheMinZoomLevel: 7,
      cacheMaxZoomLevel: 17
    };

    return this.WMS(config, map)
  },

  rl_ortofoto_2007_GS: function (layerConfig, map) {
    var config = {
      "wmsParams": {
        "url": "http://www.cartografiarl.regione.liguria.it/mapfiles/repertoriocartografico/ORTOFOTO/1361.asp?",
        "name": "L3463",
        "transparent": false,
        "format": "image/jpeg"
      },
      "flagGeoserver": false,
      "type": "WMS",
      "name": "rl_ortofoto_2007_GS",
      "projection": "EPSG:3857",
      "geomType": "RASTER",
      "geomSubType": "RASTER",
      "legend": {
        "label": "Ortofoto 2007",
        "icon": "/geoviewer/img/legend/raster.gif"
      },
      "visible": false
    };

    return this.WMS(config, map)
  },

  rl_carte_base: function (layerConfig, map) {
    return this.MapProxyTMS({
      "type": "MapProxyTMS",
      "url": "http://mapproxy.regione.liguria.it/mapproxy/1623/tms/",
      "name": "rl_carte_base",
      "tmsName": "C1623/webmercator",
      "visible": false,
      "projection": "EPSG:3857",
      "attribution": "Regione Liguria"
    }, map)
  },

  rl_ortofoto_2016: function (layerConfig, map) {
    return this.MapProxyTMS({
      "type": "MapProxyTMS",
      "url": "http://mapproxy.regione.liguria.it/mapproxy/1828/tms/",
      "name": "rl_ortofoto_2016",
      "tmsName": "L5802/webmercator",
      "visible": false,
      "projection": "EPSG:3857",
      "attribution": "Immagine di proprietà AGEA"
    }, map)
  },

  rl_ortofoto_2013: function (layerConfig, map) {
    return this.MapProxyTMS({
      "type": "MapProxyTMS",
      "url": "http://mapproxy.regione.liguria.it/mapproxy/1661/tms/",
      "name": "rl_ortofoto_2013",
      "tmsName": "L4419/webmercator",
      "visible": false,
      "projection": "EPSG:3857",
      "attribution": "Immagine di proprietà AGEA"
    }, map)
  },

  rl_ortofoto_2010: function (layerConfig, map) {
    return this.MapProxyTMS({
      "type": "MapProxyTMS",
      "url": "http://mapproxy.regione.liguria.it/mapproxy/1505/tms/",
      "name": "rl_ortofoto_2010",
      "tmsName": "L3861/webmercator",
      "visible": false,
      "projection": "EPSG:3857",
      "attribution": "Immagine di proprietà AGEA"
    }, map)
  },

  rl_ortofoto_2007: function (layerConfig, map) {
    return this.MapProxyTMS({
      "type": "MapProxyTMS",
      "url": "http://mapproxy.regione.liguria.it/mapproxy/1361/tms/",
      "name": "rl_ortofoto_2007",
      "tmsName": "L3463/webmercator",
      "visible": false,
      "projection": "EPSG:3857",
      "attribution": "Immagine di proprietà AGEA"
    }, map)
  },

  rl_ortofoto_2000: function (layerConfig, map) {
    return this.MapProxyTMS({
      "type": "MapProxyTMS",
      "url": "http://mapproxy.regione.liguria.it/mapproxy/48/tms/",
      "name": "rl_ortofoto_2000",
      "tmsName": "L48/webmercator",
      "visible": false,
      "projection": "EPSG:3857"
    }, map);
  },

  TMS: function (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create TMS");

/*    return new OpenLayers.Layer.TMS(
      layerConfig.name,
      layerConfig.layerConfig.tmsParams.url,
      {
        layername: layerConfig.tmsName || layerConfig.name,
        type: 'png',
        resolutions: map.calculateResolutions(layerConfig.minScale, layerConfig.maxScale, layerConfig.units),
        zoomOffset: -1,
        tileSize: new OpenLayers.Size(256, 256),
        minScale: layerConfig.minScale || null,
        maxScale: layerConfig.maxScale || null,
        attribution: layerConfig.attribution,
        isBaseLayer: false
      }
    );*/


    return this.MapProxyTMS({
      type: "MapProxyTMS",
      url: layerConfig.tmsParams.url,
      name: layerConfig.name,
      tmsName: layerConfig.tmsParams.name,
      minScale: layerConfig.minScale,
      maxScale: layerConfig.maxScale
    }, map)


  },

  MapProxyTMS: function MapProxyTMS (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create MapProxyTMS");

    //var url = layerConfig.tmsParams.url.replace('/tms/', '/tiles/')

    return new OpenLayers.Layer.TMS(
      layerConfig.name,
      layerConfig.url,
      {
        layername: layerConfig.tmsName || layerConfig.name,
        type: 'png',
        resolutions: map.calculateResolutions(layerConfig.minScale,  layerConfig.maxScale , layerConfig.units),
        zoomOffset: -1,
        tileSize: new OpenLayers.Size(256, 256),
        minScale: layerConfig.minScale || null,
        maxScale: layerConfig.maxScale || null,
        attribution: layerConfig.attribution,
        isBaseLayer: false
      }
    );
  },

  base_layer: function (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create base_layer");
    var olLayer = new OpenLayers.Layer(
      'base_layer',
      {
        resolutions: map.resolutions,
        serveResolutions: CWN2.Globals.BASE_RESOLUTIONS,
        alwaysInRange: true,
        isBaseLayer: true,
        order: 0
      }
    );
    return olLayer;
  },

  GeoJSON: function GeoJSON (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create GeoJSON");

    // impostazione opzioni di base
    var layerOptions = CWN2.LayerFactory.setLayerOptions(layerConfig, map);

    if (layerConfig.url) {
      // creo il protocollo
      layerOptions.protocol = new OpenLayers.Protocol.HTTP({
        format: new OpenLayers.Format.GeoJSON({ignoreExtraDims: true}),
        url: layerConfig.url
      });
      // creo le strategie
      layerOptions.strategies = CWN2.LayerFactory.createStrategies(layerConfig);
    }
    layerOptions.isBaseLayer = false;
    layerOptions.styleMap = CWN2.LayerFactory.createVectorStyleMap(layerConfig);

    return new OpenLayers.Layer.Vector(
      layerConfig.name,
      layerOptions
    );
  },

  KML: function KML (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create KML");

    // impostazione opzioni di base
    var layerOptions = CWN2.LayerFactory.setLayerOptions(layerConfig, map);

    if (layerConfig.url) {
      // creo il protocollo
      layerOptions.protocol = new OpenLayers.Protocol.HTTP({
        format: new OpenLayers.Format.KML({
          extractStyles: true,
          extractAttributes: true,
          kvpAttributes: true
        }),
        url: layerConfig.url
      });
      // creo le strategie
      layerOptions.strategies = CWN2.LayerFactory.createStrategies(layerConfig);
    }
    layerOptions.isBaseLayer = false;
    //layerOptions.styleMap = CWN2.LayerFactory.createVectorStyleMap(layerConfig);

    return new OpenLayers.Layer.Vector(
      layerConfig.name,
      layerOptions
    );
  },

  GPX: function GPX (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create GPX");

    // impostazione opzioni di base
    var layerOptions = CWN2.LayerFactory.setLayerOptions(layerConfig, map);

    if (layerConfig.url) {
      // creo il protocollo
      layerOptions.protocol = new OpenLayers.Protocol.HTTP({
        format: new OpenLayers.Format.GPX({}),
        url: layerConfig.url
      });
      // creo le strategie
      layerOptions.strategies = CWN2.LayerFactory.createStrategies(layerConfig);
    }
    layerOptions.isBaseLayer = false;
    layerOptions.styleMap = CWN2.LayerFactory.createVectorStyleMap(layerConfig);

    return new OpenLayers.Layer.Vector(
      layerConfig.name,
      layerOptions
    );
  },

  WFS: function WFS (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create WFS");

    var layerOptions = CWN2.LayerFactory.setLayerOptions(layerConfig, map);

    if (layerConfig.wfsParams.method = "GET") {
      var params = {
        request: "GetFeature",
        service: "wfs",
        version: "1.0.0"
      };
      params.typeName = layerConfig.wfsParams.featureType;
      if (layerConfig.wfsParams.filter) {
        params.filter = layerConfig.wfsParams.filter;
      }
      var options = {
        url: layerConfig.wfsParams.url,
        params: params,
        format: new OpenLayers.Format.GML({
          featureNS: "http://ng.org/sf",
          geometryName: "wkb_geometry"
        })
      };
      layerOptions.protocol = new OpenLayers.Protocol.HTTP(options);
    } else {
      layerOptions.protocol = new OpenLayers.Protocol.WFS(layerConfig.wfsParams);
    }

    layerOptions.strategies = CWN2.LayerFactory.createStrategies(layerConfig);
    layerOptions.styleMap = CWN2.LayerFactory.createVectorStyleMap(layerConfig);
    layerOptions.isBaseLayer = false;

    return new OpenLayers.Layer.Vector(
      layerConfig.name,
      layerOptions
    );
  },

  WMS: function WMS (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create WMS " + layerConfig.name);

    // impostazione opzioni di base
    var layerOptions = CWN2.LayerFactory.setLayerOptions(layerConfig, map),
      wmsParams,
      olLayer;

    layerConfig.wmsParams.layers = layerConfig.wmsParams.name;
    wmsParams = Ext.clone(layerConfig.wmsParams);
    wmsParams.url = null;
    wmsParams.name = null;


    // Parametro NO_GWC_CACHE utilizzato da GeoStyler per inibire la cache
    if (layerConfig.flagGeoserver && !CWN2.Globals.NO_GWC_CACHE && layerConfig.cacheMinZoomLevel && layerConfig.cacheMaxZoomLevel) {
      layerOptions.tiled = true;
      wmsParams.tiled = true;
      wmsParams.tilesorigin = [map.maxExtent.left, map.maxExtent.bottom];
      wmsParams.cache_version = layerConfig.cacheVersion;
      if (!wmsParams.format_options) {
        wmsParams.format_options = "antialias:text";
      }
    } else {
      layerOptions.singleTile = true;
    }

    layerOptions.buffer = 0;
    layerOptions.transitionEffect = null;
    layerOptions.isBaseLayer = false;

    // GESTIONE SUBDOMAINS
    if (CWN2.Globals.USE_SUBDOMAINS && layerConfig.wmsParams.url.indexOf('geoservizi.regione.liguria.it') > 0) {
      var appoUrl = layerConfig.wmsParams.url;
      layerConfig.wmsParams.url = [];
      layerConfig.wmsParams.url.push(appoUrl.replace('geoservizi','geoservizi1'));
      layerConfig.wmsParams.url.push(appoUrl.replace('geoservizi','geoservizi2'));
    }

    olLayer = new OpenLayers.Layer.WMS(
      layerConfig.name,
      layerConfig.wmsParams.url,
      wmsParams,
      layerOptions
    );

    // registro l'evento tileerror per gestire errori nei servizi WMS
    olLayer.events.register("tileerror", olLayer, function () {
      var tile = arguments[0].tile;
      var url = tile.url;

      if (url.indexOf("WIDTH=1&HEIGHT=1")>0) {
        return;
      }

      Ext.Ajax.request({
        url: CWN2.Globals.proxy + url,
        method: 'GET',
        success: function (response, opts) {
          //var xml = response.responseXML;
          var xml = CWN2.Util.getXmlDoc(response.responseText);
          // gestione service exception
          var serviceException = Ext.DomQuery.selectValue('ServiceException', xml);
          if (serviceException) {
            CWN2.Util.handleException({
              message: "Errore Servizio WMS <br>Layer " + layerConfig.legend.label + " (" + layerConfig.name + ")" + "<br>Service Exception:<br>" + serviceException + "<br>URL: " + url + "<br><br>",
              level: 0
            });
          }
        },
        failure: function (response, opts) {
          CWN2.Util.handleException({
            message: "WMSServerError - failure",
            level: 0
          });
        }
      });
    });

    return olLayer;
  },

  JSONP: function JSONP (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create JSONP");

    // impostazione opzioni di base
    var layerOptions = CWN2.LayerFactory.setLayerOptions(layerConfig, map),
      olLayer;

    if (layerConfig.url) {

      // creo il protocollo - ATTENZIONE parametri impostati per geoserver
      layerOptions.protocol = new OpenLayers.Protocol.Script({
        format: new OpenLayers.Format.GeoJSON({ignoreExtraDims: true}),
        callbackKey: "format_options",
        callbackPrefix: "callback:",
        url: layerConfig.url
      });

      // creo le strategie
      layerOptions.strategies = CWN2.LayerFactory.createStrategies(layerConfig);

    }
    layerOptions.styleMap = CWN2.LayerFactory.createVectorStyleMap(layerConfig);
    layerOptions.isBaseLayer = false;

    // creo il livello OL
    return new OpenLayers.Layer.Vector(
      layerConfig.name,
      layerOptions
    );
  },

  createVectorStyleMap: function (layerConfig) {
    if (!layerConfig.classes) {
      return null;
    }

    var classes = (layerConfig.classes instanceof Array) ? layerConfig.classes : [layerConfig.classes],
      StyleMapLiteral = {};

    Ext.each(CWN2.Globals.DEFAULT_RENDER_INTENTS, function (renderIntent) {
      var rules = [];
      var clusterStrategyStyle = getClusterStrategyStyle(layerConfig.strategies);
      var noClusterFilter = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.EQUAL_TO,
        property: "count",
        value: 1
      });
      var defaultClassFilter = (clusterStrategyStyle) ? noClusterFilter : null;
      Ext.each(classes, function (styleClass) {
        var classFilter = (styleClass.filter) ? new OpenLayers.Format.CQL().read(styleClass.filter) : null;
        rules.push(buildRule(styleClass.styleMaps, renderIntent, classFilter, styleClass.id));
      });
      var style = new OpenLayers.Style();
      if (clusterStrategyStyle) {
        rules.push(buildClusterRule(clusterStrategyStyle));
        // Aggiungo context per cluster: gestione radius per point
        style.context = {
          //label: label,
          radius: function (feature) {
            return Math.min(feature.attributes.count, 7) + 7;
          }
        };
      }
      style.addRules(rules);
      StyleMapLiteral[renderIntent] = style;
    });

    return new OpenLayers.StyleMap(StyleMapLiteral);

    // Ritorna la rule (filtro e simbolizer) da utilizzare per le feature per un determinato renderIntent
    // Se lo stile non è definito viene costruito uno style di default
    function buildRule (styleMaps, renderIntent, classFilter, id) {
      return new OpenLayers.Rule({
        name: id,
        symbolizer: getClassStyleByIntent(styleMaps, renderIntent) || getClassStyleByIntent(styleMaps, "default"),
        filter: classFilter
      });
    }

    // Ritorna lo style (symbolizer) associato ad una stylemap per un determinato renderIntet
    function getClassStyleByIntent (styleMaps, renderIntent) {
      var len = styleMaps.length;
      for (var s = 0; s<len; s++) {
        if (styleMaps[s].renderIntent === renderIntent) {
          return Ext.clone(styleMaps[s].style);
        }
      }
      return null;
    }

    // Testa se è un cluster
    function getClusterStrategyStyle (strategiesConfig) {
      if (strategiesConfig && strategiesConfig.length) {
        var len = strategiesConfig.length;
        for (var i = 0; i<len; i++) {
          if (strategiesConfig[i].name === "Cluster" && strategiesConfig[i].style) {
            return strategiesConfig[i].style;
          }
        }
      }
      return false;
    }

    // Ritorna la rule (filtro e simbolizer) da utilizzare per le feature in cluster
    function buildClusterRule (style) {
      var symbolizer = {},
        scale = 1,
        graphicWidth,
        graphicHeight,
        graphicYOffset,
        graphicXOffset,
        graphicOpacity;

      if (style.externalGraphic) {
        symbolizer.externalGraphic = style.externalGraphic;
        symbolizer.graphicOpacity = style.graphicOpacity || 1;
        symbolizer.graphicWidth = style.graphicWidth;
        symbolizer.graphicHeight = style.graphicHeight;
        symbolizer.graphicYOffset = style.graphicYOffset || -(style.graphicHeight / 2);
        symbolizer.graphicXOffset = style.graphicXOffset || -(style.graphicWidth / 2);
        symbolizer.graphicTitle = style.graphicTitle || "${count} Elementi";
      } else {
        symbolizer.pointRadius = "${radius}";
        symbolizer.fillColor = style.fillColor || "#ff7700";
        symbolizer.fillOpacity = style.fillOpacity || 0.9;
        symbolizer.strokeColor = style.strokeColor || "#ff7700";
        symbolizer.strokeOpacity = style.strokeOpacity || 0.5;
        symbolizer.strokeWidth = style.strokeWidth || 12;
      }

      if (style.label) {
        symbolizer.label = "${count}";
        symbolizer.fontColor = style.fontColor || "#000000";
        symbolizer.fontOpacity = style.fontOpacity || 1;
        symbolizer.fontSize = style.fontSize || "12px";
        symbolizer.fontWeight = style.fontWeight || "bold";
        symbolizer.fontFamily = style.fontFamily || "Verdana";
        symbolizer.labelOutlineWidth = style.labelOutlineWidth || 0;
        symbolizer.labelAlign = style.labelAlign || "cm";
      }

      if (symbolizer) {
        var rule = new OpenLayers.Rule({
          symbolizer: symbolizer,
          filter: new OpenLayers.Filter.Comparison({
            type: OpenLayers.Filter.Comparison.GREATER_THAN,
            property: "count",
            value: 1
          })
        });
      }
      return rule;
    }

  },

  createStrategies: function (layerConfig) {
    var strategiesConfig = layerConfig.strategies;
    var strategiesArray = [];
    if (strategiesConfig) {
      var len = strategiesConfig.length;
      var isBBox = false;
      for (var i = 0; i<len; i++) {
        strategiesArray.push(createStrategy(strategiesConfig[i]));
        if (strategiesConfig[i] && strategiesConfig[i].name === "BBOX") {
          isBBox = true;
        }
      }
      if (!isBBox) {
        strategiesArray.push(new OpenLayers.Strategy.Fixed());
      }
    } else {
      strategiesArray.push(new OpenLayers.Strategy.Fixed());
    }

    return strategiesArray;

    function createStrategy (strategy) {
      if (strategy.name === "BBOX") {
        return new OpenLayers.Strategy.BBOX();
      }
      if (strategy.name === "Fixed") {
        return new OpenLayers.Strategy.Fixed();
      }
      if (strategy.name === "Cluster") {
        var options = {};
        if (strategy.options && strategy.options.distance) {
          options.distance = strategy.options.distance;
        }
        if (strategy.options && strategy.options.threshold) {
          options.threshold = strategy.options.threshold;
        }
        return new OpenLayers.Strategy.Cluster(options);
      }
      return null;
    }
  }
});


