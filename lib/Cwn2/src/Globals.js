/**
 *
 * Class: CWN2.Globals
 *
 * Variabili globali
 *
 */
Ext.define("CWN2.Globals", {
    singleton: true,

    language: "it",
    debug: false,
    proxy: null,

    USE_SUBDOMAINS: false,

    DEFAULT_PROXY: "/geoservices/proxy/proxy.jsp?url=",

    OL_IMG_PATH: "http://geoportale.regione.liguria.it/geoviewer/lib/OpenLayers/img/",

    BING_MAPS_KEY: "Agzh6x2xuNQ4qhwHW_yc0Yd8vhb-5pMRsAHjkneosLHLesOAGqxv35yqxZBlqqVa",

    RL_MAP_CONFIG_SERVICE: "http://geoportale.regione.liguria.it/geoservices/REST/config/map/",
    RL_AG_REQUEST_CONFIG_SERVICE: "http://geoportale.regione.liguria.it/geoservices/REST/config/ag_request/",
    RL_LAYER_CONFIG_SERVICE: "http://geoportale.regione.liguria.it/geoservices/REST/config/layer/",
    RL_CREATE_SLD_SERVICE: "http://geoportale.regione.liguria.it/geoservices/REST/config/create_sld/",

    GOOGLE_GEOCODE_PROXY: "http://geoportale.regione.liguria.it/geoservices/REST/proxy/google_geocode?region=it&language=it&sensor=false&bounds=7.43,43.75|10.00,44.70",

    INFO_WMS_MAX_FEATURES: 10,

    BASE_RESOLUTIONS: [
        156543.03390625,
        78271.516953125,
        39135.7584765625,
        19567.87923828125,
        9783.939619140625,
        4891.9698095703125,
        2445.9849047851562,
        1222.9924523925781,
        611.4962261962891,
        305.74811309814453,
        152.87405654907226,
        76.43702827453613,
        38.218514137268066,
        19.109257068634033,
        9.554628534317017,
        4.777314267158508,
        2.388657133579254,
        1.194328566789627,
        0.5971642833948135      // 1:1693
        ,0.29858214169740677
        ,0.14929107084870338
    ],

    DEFAULT_CONFIG: {
        "application": {
            "mapOptions": {
                "projection": "EPSG:3857",
                "displayProjection": "EPSG:25832",
                "initialExtent": "830036,5402959,1123018,5597635"
            },
            "layout": {
                "type": "viewport"
            }
        },
        "baseLayers": [
            {
                "type": "bing_aerial",
                "legend": {
                    "label": "Bing Aerial",
                    "icon": "http://geoportale.regione.liguria.it/geoviewer/img/legend/bing.jpeg"
                },
                "visible": false
            }
        ]
    },

    DEFAULT_BASE_LAYERS_LEGEND: {
        'no_base': {
            label: "Sfondo Bianco",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/bianco.gif"
        },
        'OSM': {
            label: "OpenStreetMap",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/openstreetmap.png"
        },
        'google_roadmap': {
            label: "Google Stradario",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/google.png"
        },
        'google_hybrid': {
            label: "Google Ibrido",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/google.png"
        },
        'google_terrain': {
            label: "Google Terreno",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/google.png"
        },
        'google_satellite': {
            label: "Google Satellite",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/google.png"
        },
        'bing_road': {
            label: "Bing Road",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/bing.jpeg"
        },
        'bing_hybrid': {
            label: "Bing Hybrid",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/bing.jpeg"
        },
        'bing_aerial': {
            label: "Bing Aerial",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/bing.jpeg"
        },
        'rl_ortofoto_2000': {
            label: "Ortofoto IT 2000",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_ortofoto_2007': {
            label: "Ortofoto 2007",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_ortofoto_2010': {
            label: "AGEA: Ortofoto 2010",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_ortofoto_2013': {
            label: "AGEA: Ortofoto 2013",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_ortofoto_2016': {
            label: "AGEA: Ortofoto 2016",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_carte_base': {
            label: "Carte di base regionali",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_ortofoto_2013_GS': {
            label: "AGEA: Ortofoto 2013",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_carte_base_GS': {
            label: "Carte di base regionali",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        }

    },

    DEFAULT_RENDER_INTENTS: ["default","select","hover","temporary"],

    MAP_BASE_CONTROL_CONFIG: [
        {
            "type": "control",
            "name": "ArgParser"
        },
        {
            "type": "control",
            "name": "Attribution"
        },
        {
            "type": "control",
            "name": "KeyboardDefaults"
        },
        {
            "type": "control",
            "name": "Navigation"
        },
        {
            "type": "control",
            "name": "LoadingPanel"
        }
    ],

    RUOLO: "PUBBLICO",

    COLOR_SCALES: {
        Rosso: {
            3: ["#fee0d2","#fc9272","#de2d26"],
            4: ["#fee5d9","#fcae91","#fb6a4a","#cb181d"],
            5: ["#fee5d9","#fcae91","#fb6a4a","#de2d26","#a50f15"],
            6: ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"],
            7: ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],
            8: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],
            9: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]
        },
        Blu: {
            3: ["#deebf7","#9ecae1","#3182bd"],
            4: ["#eff3ff","#bdd7e7","#6baed6","#2171b5"],
            5: ["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"],
            6: ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#3182bd","#08519c"],
            7: ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
            8: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
            9: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"]
        },
        Verde: {
            3: ["#e5f5e0","#a1d99b","#31a354"],
            4: ["#edf8e9","#bae4b3","#74c476","#238b45"],
            5: ["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"],
            6: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#31a354","#006d2c"],
            7: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],
            8: ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],
            9: ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"]
        },
        Grigio: {
            3: ["#f0f0f0","#bdbdbd","#636363"],
            4: ["#f7f7f7","#cccccc","#969696","#525252"],
            5: ["#f7f7f7","#cccccc","#969696","#636363","#252525"],
            6: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#636363","#252525"],
            7: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],
            8: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],
            9: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"]
        },
        Random: {
            3: ["#377eb8","#4daf4a","#e41a1c"],
            4: ["#377eb8","#4daf4a","#e41a1c","#984ea3"],
            5: ["#377eb8","#4daf4a","#e41a1c","#984ea3","#ff7f00"],
            6: ["#377eb8","#4daf4a","#e41a1c","#984ea3","#ff7f00","#ffff33"],
            7: ["#377eb8","#4daf4a","#e41a1c","#984ea3","#ff7f00","#ffff33","#a65628"],
            8: ["#377eb8","#4daf4a","#e41a1c","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf"],
            9: ["#377eb8","#4daf4a","#e41a1c","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]
        }
    },

    set: function(initOptions) {
        // impostazioni CWN2
        CWN2.Globals.debug = ((initOptions.debug) || (CWN2.Util.getUrlParam("debug") === "true"));
        CWN2.Globals.proxy = initOptions.proxy || CWN2.Globals.DEFAULT_PROXY;
        CWN2.Globals.language = initOptions.language || "it";
        // impostazioni OL
        OpenLayers.ProxyHost = CWN2.Globals.proxy;
        OpenLayers.Layer.Vector.prototype.renderers = ["SVG2", "SVG", "VML", "Canvas"];
        OpenLayers.ImgPath = CWN2.Globals.OL_IMG_PATH;

    }

});

