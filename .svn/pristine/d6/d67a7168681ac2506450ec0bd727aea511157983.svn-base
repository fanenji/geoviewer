Ext.application({
    name: 'ambienteinliguria',

    launch: function() {
        var idRichiesta = CWN2.Util.getUrlParam('idRichiesta') || CWN2.Util.getUrlParam('id_richiesta');

        var config = {
            "application": {
                "mapOptions": {},
                "layout": {
                    "header": {
                        "html": "<div><table><tr><td><img src='img/headerSfondoStatistica.png' ></td><td>&nbsp;&nbsp;</td><td id='headerSfondo2' style='vertical-align: middle; '><div id='titolo' >Cartogrammi Statistici</div></td></tr></table></div>",
                        "height": 150,
                        "style": { "background-color": "#475677" }
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
                            {
                                "items": [
                                    {"type": "combo", "name": "geocoder"},
                                    {
                                        "name": "qpgtematismi",
                                        "options": {}
                                    },
                                    {"name": "print" }
                                ]
                            }
                        ]
                    }
                }
            },
            "baseLayers": [
                { "type": "no_base", "visible": true },
                { "type": "rl_ortofoto_2013" },
                { "type": "google_roadmap" },
                { "type": "google_satellite"}
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




