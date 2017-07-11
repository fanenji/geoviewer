/*
 Modulo Custom per il viewer del geoportal

 */

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , jQuery:false, $:false*/

// effettua lo zoom sugli elementi trovati
function zoomToSelected(map, table, filter) {
    var serviceUrl = "/geoservices/REST/corem/get_bbox?filter=" + filter.replace(/%/g,"$") + "&table=" + table;

    CWN2.Util.ajaxRequest({
        type: "JSONP",
        url: serviceUrl,
        callBack: function(response) {
            if (response) {
                var bbox,
                    bounds;
                bbox = response.data.bbox;
                if (bbox) {
                    if (bbox === ',,,') {
                        return;
                    }
                    bounds = OpenLayers.Bounds.fromString(CWN2.Util.transformStrBounds(map.displayProjection.projCode, map.projection, bbox));
                    map.zoomToExtent(bounds);
                    var maxZoomLevel = 18;
                    if (map.zoom > maxZoomLevel) {
                        map.zoomTo(maxZoomLevel);
                    }
                }
            }
        }
    });

}

function loadGrid(idSession) {
    var map = CWN2.app.map;

    // impostazione parametri
    var getLegendUrl = COREM_wmsUrl + "&LAYER=COREM_GRIGLIA&RULE=COREM_GRIGLIA&request=GETLEGENDGRAPHIC&version=1.1&SERVICE=WMS&FORMAT=image/png";
    var infoUrl = "/geoviewer/pages/apps/corem/infoSpecie.html?ID_CELL=${GRD_NEWID}";

    // impostazione nome vista
    var vName = "BIODIV_OSS_FILTRO_CARTO_GEO";

    var filter = "ID_SESSION=" + idSession;

    var layerConfig = {
        type: "WMS",
        name: "COREM_OSS_FILTRO_CARTO_GEO",
        visible: true,
        projection: "EPSG:25832",
        minScale: 0,
        maxScale: 0,
        opacity: 0.8,
        showInLegend: true,
        geomSubType: "POLYGON",
        unremovable: true,
        queryable: false,
        legend: {
            "label": "Distribuzione Specie",
            "icon": getLegendUrl
        },
        infoOptions: {
            infoIdAttr: "GRD_NEWID",
            infoUrl: infoUrl
        },
        classes: [],
        wmsParams: {
            url: COREM_wmsUrl,
            name: "COREM_OSS_FILTRO_CARTO_GEO",
            transparent: true,
            EXP_FILTER: filter
        }
    };

    // faccio zoom su elementi trovati con WFS
    zoomToSelected(map, vName, filter);

    // carico il layer
    map.layerManager.addLayers(layerConfig);
}


function loadSpecie(idSession,ruolo) {
    var map = CWN2.app.map;

    //var infoUrl = "/geoviewer/pages/apps/corem/InfoStazione.html?ID_STAZ=${ID_STAZ}";
    var infoAsp = (ruolo === "LIBIOSS_PRI")? "siraLibiossStazioni_Dettagli_pubblico.asp" : "siraLibiossStazioni_Dettagli.asp";
    var infoUrl = "http://www.cartografiarl.regione.liguria.it/mapfiles/info/repertoriocartografico/" + infoAsp + "?stazione=${ID_STAZ}";
    var getLegendUrl = COREM_wmsUrl + "&LAYER=COREM_OSS_SESSION_A&RULE=COREM_OSS_SESSION_A&request=GETLEGENDGRAPHIC&version=1.1&SERVICE=WMS&FORMAT=image/png";

    var vName = "V_BIODIV_OSS_CARTO_ELE"
    var filter = "ID_SESSION = " + idSession;

    var layerConfig = {
        type: "WMS",
        name: "COREM_OSS",
        visible: true,
        projection: "EPSG:25832",
        minScale: 0,
        maxScale: 0,
        opacity: 0.8,
        showInLegend: true,
        geomSubType: "POINT",
        unremovable: true,
        queryable: true,
        infoOptions: {
            infoIdAttr: "ID_STAZ",
            infoUrl: infoUrl,
            infoTarget: "info"
        },
        legend: {
            "label": "Osservazioni Specie",
            "icon": getLegendUrl
        },
        classes: [],
        wmsParams: {
            url: COREM_wmsUrl,
            name: "COREM_OSS_SESSION_P,COREM_OSS_SESSION_A",
            transparent: true,
            EXP_FILTER: filter
        }
    };

    // carico il layer per l'evidenziazione
    map.layerManager.addLayers(layerConfig);

    // faccio zoom su elementi trovati con WFS
    zoomToSelected(map, vName, filter);

}

function loadHabitat(idSession, ruolo) {
    var map = CWN2.app.map;

    var infoUrl = "/geoviewer/pages/apps/corem/InfoHabitat.html?ID_OSS=${ID_OSS}&LAYER=${LAYER}&RUOLO=" + ruolo;
    var getLegendUrl = COREM_wmsUrl + "&LAYER=COREM_HABITAT_SESSION_A&RULE=COREM_HABITAT_SESSION_A&request=GETLEGENDGRAPHIC&version=1.1&SERVICE=WMS&FORMAT=image/png";

    var vName = "V_BIODIV_HAB_FILTRO_CARTO"
    var filter = "ID_SESSION = " + idSession;
    if (ruolo) {
        filter += " AND nvl(RUOLO,'ALL') != '" + ruolo + "'";
    }

    var layerConfig = {
        type: "WMS",
        name: "COREM_HABITAT",
        visible: true,
        projection: "EPSG:25832",
        minScale: 0,
        maxScale: 0,
        opacity: 0.8,
        showInLegend: true,
        geomSubType: "POINT",
        unremovable: true,
        queryable: true,
        infoOptions: {
            infoIdAttr: "ID_OSS",
            infoTarget: "info",
            infoUrl: infoUrl
        },
        legend: {
            "label": "Habitat",
            "icon": getLegendUrl
        },
        classes: [],
        wmsParams: {
            url: COREM_wmsUrl,
            name: "COREM_HABITAT_SESSION_P,COREM_HABITAT_SESSION_A",
            transparent: true,
            EXP_FILTER: filter
        }
    };

    // carico il layer per l'evidenziazione
    map.layerManager.addLayers(layerConfig);

    // faccio zoom su elementi trovati con WFS
    zoomToSelected(map, vName, filter);

}

function loadGridFiltro(idSession, codiceRegno, codiceClasse, codiceOrdine, codiceFamiglia, codiceGenere, codiceSpecie, dataInizio, dataFine, listaRegioni) {

    showHelpWin();


    // se nessun parametro non carico nessuna griglia
    if (!codiceRegno && !codiceClasse && !codiceOrdine && !codiceFamiglia && !codiceGenere && !codiceSpecie) {
        return;
    }

    var map = CWN2.app.map,
        layer = "COREM_GRIGLIA_SPECIE",
        vName = "V_BIODIV_GRIGLIA_SPECIE",
        filter = null;

    // impostazione parametri
    var getLegendUrl = COREM_wmsUrl + "&LAYER=" + layer + "&RULE=" + layer + "&request=GETLEGENDGRAPHIC&version=1.1&SERVICE=WMS&FORMAT=image/png";
    var infoUrl = "/geoviewer/pages/apps/corem/infoSpecie.html?ID_CELL=${GRD_NEWID}";

    // costruisco il filtro
    if (codiceRegno) {
        filter = "CODICE_REGNO IN (" + codiceRegno + ")";
        filter += " AND CODICE_REGIONE IN (" + listaRegioni + ")"
    }
    if (codiceClasse) {
        filter = "CODICE_CLASSE IN (" + codiceClasse + ")";
        filter += " AND CODICE_REGIONE IN (" + listaRegioni + ")"
    }
    if (codiceOrdine) {
        filter = "CODICE_ORDINE IN (" + codiceOrdine + ")";
        filter += " AND CODICE_REGIONE IN (" + listaRegioni + ")"
    }
    if (codiceFamiglia) {
        filter = "CODICE_FAMIGLIA IN (" + codiceFamiglia + ")";
        filter += " AND CODICE_REGIONE IN (" + listaRegioni + ")"
    }
    if (codiceGenere) {
        filter = "CODICE_GENERE IN (" + codiceGenere + ")";
        filter += " AND CODICE_REGIONE IN (" + listaRegioni + ")"
    }
    if (codiceSpecie) {
        filter = "CODICE_SPECIE IN (" + codiceSpecie + ")";
        filter += " AND CODICE_REGIONE IN (" + listaRegioni + ")"
    }

    if (dataInizio) {
        filter += " AND DATA_OSS > TO_DATE('" + dataInizio + "','DD/MM/YYYY')";
    }
    if (dataFine) {
        filter += " AND DATA_OSS < TO_DATE('" + dataFine + "','DD/MM/YYYY')";
    }

    var layerConfig = {
        type: "WMS",
        name: layer,
        visible: true,
        projection: "EPSG:25832",
        minScale: 3000000,
        maxScale: 0,
        opacity: 0.8,
        showInLegend: true,
        geomSubType: "POLYGON",
        unremovable: true,
        queryable: false,
        legend: {
            "label": "Distribuzione Specie",
            "icon": getLegendUrl
        },
        infoOptions: {
            infoIdAttr: "GRD_NEWID",
            infoUrl: infoUrl
        },
        classes: [],
        wmsParams: {
            url: COREM_wmsUrl,
            name: layer,
            transparent: true,
            EXP_FILTER: filter
        }
    };

    // carico il layer - DISABILITO CARICAMENTO LAYER GRIGLIA
    //map.layerManager.addLayers(layerConfig);

    // faccio zoom su elementi trovati con WFS
    zoomToSelected(map, vName, filter);

}

function showHelpWin() {
    var win = Ext.create('CWN2.IframeWindow', {
        url: "HelpFiltro.html",
        id: "help-filtro",
        width: 500,
        height: 300,
        resizable: false,
        hide: true
    });
    win.show();
}
function leggiSessioneHabitat(idSession, codiceHabitat, dataInizio, dataFine, ruolo) {

    showHelpWin();

    // interrogazione servizio
    var serviceUrl = "/geoservices/REST/corem/get_lista_regioni?idSession=" + idSession;

    CWN2.Util.ajaxRequest({
        type: "JSONP",
        url: serviceUrl,
        callBack: function(response) {
            if (response && response.success) {
                // response contiene elenco regioni
                loadGridFiltroHabitat(idSession, codiceHabitat, dataInizio, dataFine, response.data.regioni, ruolo);
            }
        }
    });
}

function loadGridFiltroHabitat(idSession, codiceHabitat, dataInizio, dataFine, listaRegioni, ruolo) {
    // se nessun parametro non carico nessuna griglia
    if (!codiceHabitat) {
        return;
    }


    var map = CWN2.app.map,
        vName = "V_BIODIV_HABITAT",
        filter = null;

    // impostazione parametri
    var getLegendUrl = COREM_wmsUrl + "&LAYER=COREM_HABITAT_A&RULE=COREM_HABITAT_A&request=GETLEGENDGRAPHIC&version=1.1&SERVICE=WMS&FORMAT=image/png";

    filter = "";
    filter += "CODICE_REGIONE IN (" + listaRegioni + ") "

    // costruisco il filtro
    if (codiceHabitat) {
        //filter += "AND CODICE_NAT2000 IN (" + listaHabitat + ")";
        var arrayHabitat = codiceHabitat.split(',');

        filter += "AND (";
        Ext.each(arrayHabitat, function(codHab) {
            filter += "CODICE_NAT2000 LIKE '" + codHab + "%' OR ";
        });
        filter = filter.substring(0,filter.length - 4);
        filter += ")";
    }

    if (dataInizio) {
        filter += " AND DATA_OSS > TO_DATE('" + dataInizio + "','DD/MM/YYYY')";
    }
    if (dataFine) {
        filter += " AND DATA_OSS < TO_DATE('" + dataFine + "','DD/MM/YYYY')";
    }
    if (ruolo) {
        filter += " AND nvl(RUOLO,'ALL') != '" + ruolo + "'";
    }

    var layerConfig = {
        type: "WMS",
        name: vName,
        visible: true,
        projection: "EPSG:25832",
        minScale: 1000000,
        maxScale: 0,
        opacity: 0.8,
        showInLegend: true,
        geomSubType: "POLYGON",
        unremovable: true,
        queryable: false,
        legend: {
            "label": "Distribuzione Habitat",
            "icon": getLegendUrl
        },
        "infoOptions": {
            "infoIdAttr": "ID",
            "infoLabelAttr": "DESCRIZIONE",
            "fieldMapping": {
                "ID": "ID",
                "ID_OSS": "ID Stazione",
                "CODICE_NAT2000": "Codice Natura 2000",
                "PERCENTUALE": "Percentuale",
                "DESCRIZIONE": "Descrizione Natura 2000"
            }
        },
        classes: [],
        wmsParams: {
            url: COREM_wmsUrl,
            name: "COREM_HABITAT_P,COREM_HABITAT_A",
            transparent: true,
            EXP_FILTER: filter
        }
    };

    // carico il layer - DISABILITO PER ALLINEARE CON SPECIE
    //map.layerManager.addLayers(layerConfig);

    // faccio zoom su elementi trovati con WFS
    zoomToSelected(map, vName, filter);

}





