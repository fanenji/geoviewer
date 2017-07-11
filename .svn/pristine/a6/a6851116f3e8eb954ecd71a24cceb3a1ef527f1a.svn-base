/**
 *
 * Class: CWN2.I18n
 *
 * Gestione multilinguismo
 *
 */
Ext.define("CWN2.I18n", {

    singleton: true,

    dict: {
        "Scala": {
            "en": "Scale"
        },
        "Coordinate:": {
            "en": "Coordinates:"
        },
        "Ricerche": {
            "en": "Find"
        },
        "Attenzione": {
            "en": "Attention"
        },
        "Nessun indirizzo indicato": {
            "en": "No Address"
        },
        "Il punto è fuori dai limiti geografici della mappa": {
            "en": "Address is outside the map boundary"
        },
        "Indirizzo": {
            "en": "Address"
        },
        "Vai": {
            "en": "OK"
        },
        "Annulla": {
            "en": "Cancel"
        },
        "Aggiunta Livelli": {
            "en": "Add Layers"
        },
        "Zoom alla massima estensione": {
            "en": "Zoom to max extension"
        },
        "Zoom alla estensione iniziale": {
            "en": "Zoom to initial extension"
        },
        "Temi": {
            "en": "Themes"
        },
        "Aggiungi": {
            "en": "Add"
        },
        "Nessun livello selezionato": {
            "en": "No layer selected"
        },
        "Misure Areali": {
            "en": "Measure Area"
        },
        "Area": {
            "en": "Area"
        },
        "Misure Lineari": {
            "en": "Measure Line"
        },
        "Distanza": {
            "en": "Distance"
        },
        "Pan": {
            "en": "Pan"
        },
        "Togli Livelli": {
            "en": "Remove Layers"
        },
        "Seleziona i livelli da eliminare": {
            "en": "Select the layers to remove"
        },
        "Calcolo Percorsi": {
            "en": "Route Planner"
        },
        "Mezzo": {
            "en": "Mode"
        },
        "In auto": {
            "en": "Driving"
        },
        "A piedi": {
            "en": "Walking"
        },
        "Invio": {
            "en": "OK"
        },
        "Inverti direzione": {
            "en": "Swap"
        },
        "Seleziona punto di partenza sulla mappa": {
            "en": "Select start point on map"
        },
        "Seleziona punto di arrivo sulla mappa": {
            "en": "Select end point on map"
        },
        "Distanza totale": {
            "en": "Distance"
        },
        "Durata totale": {
            "en": "Duration"
        },
        "Calcola": {
            "en": "OK"
        },
        "Reset": {
            "en": "Reset"
        },
        "Zoom In": {
            "en": "Zoom In"
        },
        "Zoom Successivo": {
            "en": "Zoom Next"
        },
        "Zoom Out": {
            "en": "Zoom Out"
        },
        "Zoom Precedente": {
            "en": "Zoom Previous"
        },
        "Trasparenza": {
            "en": "Transparency"
        },
        "Sfondi": {
            "en": "Base Layer"
        },
        "Livelli": {
            "en": "Overlays"
        },
        "": {
            "en": ""

        }

    },

    /**
     *
     *  Function: get
     *
     *  Ritorna una stringa dal dizionario nella lingua impostata.
     *
     *  Parameters:
     *  string - {string} Stringa

     */
    get: function get(string) {

        if (CWN2.I18n.dict[string]) {
            return CWN2.I18n.dict[string][CWN2.Globals.language] || string;
        } else {
            return string;
        }

    }
});


