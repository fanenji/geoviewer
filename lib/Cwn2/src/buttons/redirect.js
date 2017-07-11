Ext.define('CWN2.button.redirect', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-redirect',

    constructor: function(config) {
        var btnOptions = config.options;

        this.config = config;

        this.superclass.constructor.call(this, {
            tooltip: (btnOptions && btnOptions.tooltip) ? btnOptions.tooltip : CWN2.I18n.get("Redirect"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : btnOptions.id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            id: btnOptions.id
        });
    }
});

// CONTROLLER
Ext.define('CWN2.controller.button.redirect', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.redirect'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-redirect'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.redirect: init');

        this.control({
            'cwn2-button-redirect': {
                click: this.onClick
            }
        });
    },

    onClick: function() {
        window.location.href = this.getButton().config.options.url;
    }

});
