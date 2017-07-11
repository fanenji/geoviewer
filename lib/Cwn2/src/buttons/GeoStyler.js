// Componenti BASE
Ext.define('Ext.picker.Color', {
    extend: 'Ext.Component',
    requires: 'Ext.XTemplate',
    alias: 'widget.colorpicker',
    alternateClassName: 'Ext.ColorPalette',

    /**
     * @cfg {String} [componentCls='x-color-picker']
     * The CSS class to apply to the containing element.
     */
    componentCls: Ext.baseCSSPrefix + 'color-picker',

    /**
     * @cfg {String} [selectedCls='x-color-picker-selected']
     * The CSS class to apply to the selected element
     */
    selectedCls: Ext.baseCSSPrefix + 'color-picker-selected',

    /**
     * @cfg {String} itemCls
     * The CSS class to apply to the color picker's items
     */
    itemCls: Ext.baseCSSPrefix + 'color-picker-item',

    /**
     * @cfg {String} value
     * The initial color to highlight (should be a valid 6-digit color hex code without the # symbol). Note that the hex
     * codes are case-sensitive.
     */
    value: null,

    /**
     * @cfg {String} clickEvent
     * The DOM event that will cause a color to be selected. This can be any valid event name (dblclick, contextmenu).
     */
    clickEvent: 'click',

    /**
     * @cfg {Boolean} allowReselect
     * If set to true then reselecting a color that is already selected fires the {@link #event-select} event
     */
    allowReselect: false,

    /**
     * @property {String[]} colors
     * An array of 6-digit color hex code strings (without the # symbol). This array can contain any number of colors,
     * and each hex code should be unique. The width of the picker is controlled via CSS by adjusting the width property
     * of the 'x-color-picker' class (or assigning a custom class), so you can balance the number of colors with the
     * width setting until the box is symmetrical.
     *
     * You can override individual colors if needed:
     *
     *     var cp = new Ext.picker.Color();
     *     cp.colors[0] = 'FF0000';  // change the first box to red
     *
     * Or you can provide a custom array of your own for complete control:
     *
     *     var cp = new Ext.picker.Color();
     *     cp.colors = ['000000', '993300', '333300'];
     */
    colors: [
        '000000', '993300', '333300', '003300', '003366', '000080', '333399', '333333',
        '800000', 'FF6600', '808000', '008000', '008080', '0000FF', '666699', '808080',
        'FF0000', 'FF9900', '99CC00', '339966', '33CCCC', '3366FF', '800080', '969696',
        'FF00FF', 'FFCC00', 'FFFF00', '00FF00', '00FFFF', '00CCFF', '993366', 'C0C0C0',
        'FF99CC', 'FFCC99', 'FFFF99', 'CCFFCC', 'CCFFFF', '99CCFF', 'CC99FF', 'FFFFFF'
    ],

    /**
     * @cfg {Function} handler
     * A function that will handle the select event of this picker. The handler is passed the following parameters:
     *
     * - `picker` : ColorPicker
     *
     *   The {@link Ext.picker.Color picker}.
     *
     * - `color` : String
     *
     *   The 6-digit color hex code (without the # symbol).
     */

    /**
     * @cfg {Object} scope
     * The scope (`this` reference) in which the `{@link #handler}` function will be called.
     *
     * Defaults to this Color picker instance.
     */

    colorRe: /(?:^|\s)color-(.{6})(?:\s|$)/,

    renderTpl: [
        '<tpl for="colors">',
        '<a href="#" class="color-{.} {parent.itemCls}" hidefocus="on">',
        '<span class="{parent.itemCls}-inner" style="background:#{.}">&#160;</span>',
        '</a>',
        '</tpl>'
    ],

    // @private
    initComponent: function () {
        var me = this;

        me.callParent(arguments);
        me.addEvents(
            /**
             * @event select
             * Fires when a color is selected
             * @param {Ext.picker.Color} this
             * @param {String} color The 6-digit color hex code (without the # symbol)
             */
            'select'
        );

        if (me.handler) {
            me.on('select', me.handler, me.scope, true);
        }
    },


    // @private
    initRenderData: function () {
        var me = this;
        return Ext.apply(me.callParent(), {
            itemCls: me.itemCls,
            colors: me.colors
        });
    },

    onRender: function () {
        var me = this,
            clickEvent = me.clickEvent;

        me.callParent(arguments);

        me.mon(me.el, clickEvent, me.handleClick, me, {delegate: 'a'});
        // always stop following the anchors
        if (clickEvent != 'click') {
            me.mon(me.el, 'click', Ext.emptyFn, me, {delegate: 'a', stopEvent: true});
        }
    },

    // @private
    afterRender: function () {
        var me = this,
            value;

        me.callParent(arguments);
        if (me.value) {
            value = me.value;
            me.value = null;
            me.select(value, true);
        }
    },

    // @private
    handleClick: function (event, target) {
        var me = this,
            color;

        event.stopEvent();
        if (!me.disabled) {
            color = target.className.match(me.colorRe)[1];
            me.select(color.toUpperCase());
        }
    },

    /**
     * Selects the specified color in the picker (fires the {@link #event-select} event)
     * @param {String} color A valid 6-digit color hex code (# will be stripped if included)
     * @param {Boolean} [suppressEvent=false] True to stop the select event from firing.
     */
    select: function (color, suppressEvent) {

        var me = this,
            selectedCls = me.selectedCls,
            value = me.value,
            el;

        color = color.replace('#', '');
        if (!me.rendered) {
            me.value = color;
            return;
        }


        if (color != value || me.allowReselect) {
            el = me.el;

            if (me.value) {
                el.down('a.color-' + value).removeCls(selectedCls);
            }
            el.down('a.color-' + color).addCls(selectedCls);
            me.value = color;
            if (suppressEvent !== true) {
                me.fireEvent('select', me, color);
            }
        }
    },

    /**
     * Clears any selection and sets the value to `null`.
     */
    clear: function () {
        var me = this,
            value = me.value,
            el;

        if (value && me.rendered) {
            el = me.el.down('a.color-' + value);
            el.removeCls(me.selectedCls);
        }
        me.value = null;
    },

    /**
     * Get the currently selected color value.
     * @return {String} value The selected value. Null if nothing is selected.
     */
    getValue: function () {
        return this.value || null;
    }
});

Ext.define('Ext.menu.ColorPicker', {
    extend: 'Ext.menu.Menu',

    alias: 'widget.colormenu',

    requires: [
        'Ext.picker.Color'
    ],

    /**
     * @cfg {Boolean} hideOnClick
     * False to continue showing the menu after a color is selected.
     */
    hideOnClick: true,

    /**
     * @cfg {String} pickerId
     * An id to assign to the underlying color picker.
     */
    pickerId: null,

    /**
     * @cfg {Number} maxHeight
     * @private
     */

    /**
     * @property {Ext.picker.Color} picker
     * The {@link Ext.picker.Color} instance for this ColorMenu
     */

    /**
     * @event click
     * @private
     */

    initComponent: function () {
        var me = this,
            cfg = Ext.apply({}, me.initialConfig);

        // Ensure we don't get duplicate listeners
        delete cfg.listeners;
        Ext.apply(me, {
            plain: true,
            showSeparator: false,
            items: Ext.applyIf({
                cls: Ext.baseCSSPrefix + 'menu-color-item',
                id: me.pickerId,
                xtype: 'colorpicker'
            }, cfg)
        });

        me.callParent(arguments);

        me.picker = me.down('colorpicker');

        /**
         * @event select
         * @inheritdoc Ext.picker.Color#select
         */
        me.relayEvents(me.picker, ['select']);

        if (me.hideOnClick) {
            me.on('select', me.hidePickerOnSelect, me);
        }
    },

    /**
     * Hides picker on select if hideOnClick is true
     * @private
     */
    hidePickerOnSelect: function () {
        Ext.menu.Manager.hideAll();
    }
});

Ext.define('Ext.ux.ColorField', {
    extend: 'Ext.form.TriggerField',
    triggerConfig: {
        src: Ext.BLANK_IMAGE_URL,
        tag: "img",
        cls: "x-form-trigger x-form-color-trigger"
    },
    invalidText: "Colors must be in a the hex format #FFFFFF.",
    regex: /^\#[0-9A-F]{6}$/i,
    allowBlank: false,
    initComponent: function () {
        this.callParent()
        this.addEvents('select');
        this.on('change', function (c, v) {
            this.onSelect(c, v);
        }, this);
    },


    // private
    onDestroy: function () {
        Ext.destroy(this.menu);
        this.callParent()
        //        Ext.ux.ColorField.superclass.onDestroy.call(this);
    },


    // private
    afterRender: function () {
        //Ext.ux.ColorField.superclass.afterRender.call(this);
        this.callParent(arguments)
        this.inputEl.setStyle('background', this.value);
        this.detectFontColor();
    },


    /**
     * @method onTriggerClick
     * @hide
     */
    // private
    onTriggerClick: function (e) {
        if (this.disabled) {
            return;
        }


        this.menu = new Ext.ux.ColorPicker({
            shadow: true,
            autoShow: true,
            hideOnClick: false,
            value: this.value,
            fallback: this.fallback
        });
        this.menu.alignTo(this.inputEl, 'tl-bl?');
        this.menuEvents('on');
        this.menu.show(this.inputEl);
    },


    //private
    menuEvents: function (method) {
        this.menu[method]('select', this.onSelect, this);
        this.menu[method]('hide', this.onMenuHide, this);
        this.menu[method]('show', this.onFocus, this);
    },


    onSelect: function (m, d) {
        d = Ext.isString(d) && d.substr(0, 1) != '#' ? '#' + d : d;
        this.setValue(d);
        this.fireEvent('select', this, d);
        if (this.inputEl) {
            this.inputEl.setStyle('background', d);
            this.detectFontColor();
        }
    },


    // private
    // Detects whether the font color should be white or black, according to the
    // current color of the background
    detectFontColor: function () {
        if (!this.menu || !this.menu.picker.rawValue) {
            if (!this.value) value = 'FFFFFF';
            else {
                var h2d = function (d) {
                    return parseInt(d, 16);
                }
                var value = [
                    h2d(this.value.slice(1, 3)),
                    h2d(this.value.slice(3, 5)),
                    h2d(this.value.slice(5))
                ];
            }
        } else var value = this.menu.picker.rawValue;
        var avg = (value[0] + value[1] + value[2]) / 3;
        this.inputEl.setStyle('color', (avg > 128) ? '#000' : '#FFF');
    },


    onMenuHide: function () {
        this.focus(false, 60);
        this.menuEvents('un');
    }


});

Ext.define('Ext.ux.CanvasPalette', {
    alias: 'widget.canvaspalette',
    extend: 'Ext.Component',
    itemCls: 'x-color-picker',
    defaultValue: "#0000FF",
    width: 200,
    height: 200,
    initComponent: function () {
        this.callParent()
        this.addEvents(
            /**
             * @event select
             * Fires when a color is selected
             * @param {ColorPalette} this
             * @param {String} color The 6-digit color hex code (without the # symbol)
             */
            'select');


        if (!this.value) this.value = this.defaultValue;
    },
    getValue: function () {
        return this.value;
    },


    setValue: function (v) {
        this.value = v;
    },
    onRender: function (container, position) {
        var el = document.createElement("div");
        el.className = this.itemCls;
        container.dom.insertBefore(el, null);
        Ext.get(el).setWidth(this.width);
        this.canvasdiv = Ext.get(el).createChild({
            tag: 'div'
        });
        this.wheel = this.canvasdiv.dom.appendChild(document.createElement("canvas"));
        this.wheel.setAttribute('width', '200');
        this.wheel.setAttribute('height', '200');
        this.wheel.setAttribute('class', 'x-color-picker-wheel');


        /* Draw the wheel image onto the container */
        this.wheel.getContext('2d').drawImage(this.wheelImage, 0, 0);
        this.drawGradient();


        Ext.get(this.wheel).on('click', this.select, this);
        this.callParent();
    },


    // private
    afterRender: function () {
        var me = this;
        me.callParent();
        var t = new Ext.dd.DragDrop(me.wheel)
        t.onDrag = function (e, t) {
            me.select(e, this.DDMInstance.currentTarget);
        };
    },


    select: function (e, t) {
        var context = this.wheel.getContext('2d');
        var coords = [
            e.getX() - Ext.get(t).getLeft(),
            e.getY() - Ext.get(t).getTop()
        ];


        try {
            var data = context.getImageData(coords[0], coords[1], 1, 1);
        } catch (e) {
            return;
        } // The user selected an area outside the <canvas>
        // Disallow selecting transparent regions
        var toHex = function () {
            this.color = new Ext.draw.Color(this.rawValue[0], this.rawValue[1], this.rawValue[2])
            this.value = this.color.toString();
        };
        if (data.data[3] == 0) {
            var context = this.gradient.getContext('2d');
            var data = context.getImageData(coords[0], coords[1], 1, 1);
            if (data.data[3] == 0) return;
            this.rawValue = data.data;
            toHex.call(this);
            this.fireEvent('select', this, this.value);
        } else {
            this.rawValue = data.data;
            toHex.call(this)
            this.drawGradient();
            this.fireEvent('select', this, this.value);
        }
    },


    // private
    drawGradient: function () {
        if (!this.gradient) {
            this.gradient = this.canvasdiv.dom.appendChild(document.createElement("canvas"));
            this.gradient.setAttribute('width', '200');
            this.gradient.setAttribute('height', '200');
            this.gradient.setAttribute('class', 'x-color-picker-gradient');
            if (typeof G_vmlCanvasManager != 'undefined') this.gradient = G_vmlCanvasManager.initElement(this.gradient);
            Ext.get(this.gradient).on('click', this.select, this);
        }
        var context = this.gradient.getContext('2d');
        var center = [97.5, 98];


        // Clear the canvas first
        context.clearRect(0, 0, this.gradient.width, this.gradient.height)


        context.beginPath();
        context.fillStyle = this.value;
        context.strokeStyle = this.value;
        context.arc(center[0], center[0], 65, 0, 2 * Math.PI, false);
        context.closePath();
        context.fill();


        /* Draw the wheel image onto the container */
        this.gradient.getContext('2d').drawImage(this.gradientImage, 33, 32);


    }


}, function () { /* Preload the picker images so they're available at render time */
    var p = this.prototype;
    p.wheelImage = (function () {
        var wheelImage = new Image();
        wheelImage.onload = Ext.emptyFn;
        wheelImage.src = '/geoviewer/stili/default/icons/wheel.png';
        return wheelImage;
    })();
    p.gradientImage = (function () {
        var gradientImage = new Image();
        gradientImage.onload = Ext.emptyFn;
        gradientImage.src = '/geoviewer/stili/default/icons/gradient.png';
        return gradientImage;
    })();
});

Ext.define('Ext.ux.ColorPicker', {
    extend: 'Ext.menu.ColorPicker',
    initComponent: function () {
        var me = this;
        if (!Ext.supports.Canvas || me.fallback == true) {
            me.height = 100;
            me.hideOnClick = true;
            me.callParent();
            return me.processEvent();
        }
        cfg = Ext.apply({}, me.canvasCfg);


        // Ensure we don't get duplicate listeners
        delete cfg.listeners;
        Ext.apply(me, {
            plain: true,
            showSeparator: false,
            items: Ext.applyIf({
                cls: Ext.baseCSSPrefix + 'menu-color-item',
                id: me.pickerId,
                value: me.value,
                xtype: 'canvaspalette'
            }, cfg)
        });


        Ext.menu.ColorPicker.superclass.initComponent.call(me)


        me.picker = me.down('canvaspalette');
        me.processEvent()


    },
    processEvent: function () {
        var me = this;
        me.picker.clearListeners();
        me.relayEvents(me.picker, ['select']);


        if (me.hideOnClick) {
            me.on('select', me.hidePickerOnSelect, me);
        }
    }
});

// --------------------------------

Ext.define('CWN2.button.GeoStyler', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-geostyler',

    constructor: function (config) {
        var btnOptions = config.options;

        this.config = config;
        this.superclass.constructor.call(this, {
            id: "geostyler",
            tooltip: CWN2.I18n.get("GeoStyler"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "styler",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false
        });
    }
});

Ext.define('CWN2.button.GeoStyler.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-btn-geostyler-win',
    closeAction: 'hide',
    title: CWN2.I18n.get("Stili"),
    height: 700,
    width: 500,
    layout: "fit",
    resizable: false,

    constructor: function (config) {
        var me = this;

        this.items = [

            {
                xtype: 'cwn2-btn-geostyler-panel',
                layersConfig: config.layersConfig
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-panel',
    height: "auto",
    width: "auto",
    frame: true,
    buttons: [
        {
            text: CWN2.I18n.get("Salva"),
            action: "geostyler-submit"
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: "geostyler-cancel"
        }
    ],
    autoScroll: true,
    constructor: function (config) {
        this.items = [
            {
                xtype: 'cwn2-btn-geostyler-layer-combo',
                layersConfig: config.layersConfig
            },
            {
                xtype: 'cwn2-btn-geostyler-rule-fieldset',
                layer: config.layersConfig[0]
            },
            {
                xtype: 'cwn2-btn-geostyler-tab-panel',
                rule: config.layersConfig[0].sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[0],
                labelRule: config.layersConfig[0].labelRule,
                columns: config.layersConfig[0].columns,
                geomType: config.layersConfig[0].geomType
            }

        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LayerCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-layer-combo",
    fieldLabel: 'Layer',
    labelWidth: 40,
    mode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    value: "Scegli un livello...",
    valueField: "name",
    displayField: "label",
    width: 300,
    constructor: function (config) {
        Ext.define('GeostylerLayers', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'name', type: 'string'},
                {name: 'label', type: 'string'},
                {name: 'geomType', type: 'string'},
                {name: 'legendUrl', type: 'string'},
                {name: 'labelRule'},
                {name: 'columns'},
                {name: 'sld'}
            ]
        });
        this.store = Ext.create('Ext.data.Store', {
            model: 'GeostylerLayers',
            data: {"layers": config.layersConfig},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'layers'
                }
            }
        });
        this.superclass.constructor.call(this);
        this.setValue(this.getStore().getAt(0).data.name);
    }
});

Ext.define('CWN2.button.GeoStyler.RuleCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-rule-combo",
    fieldLabel: 'Rule',
    labelWidth: 40,
    queryMode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    width: 300,
    valueField: "Name",
    displayField: "Title",
    constructor: function (config) {
        var rules = [];
        Ext.each(config.layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule, function (rule) {
            if (rule.name !== "LABEL") {

                rules.push({
                    "Name": rule.Name,
                    "Title": rule.Title,
                    "legendUrl": config.layer.legendUrl + "&RULE=" + rule.Name,
                    "MinScaleDenominator": parseFloat(rule.MinScaleDenominator),
                    "MaxScaleDenominator": parseFloat(rule.MaxScaleDenominator),
                    "Filter": rule.Filter,
                    "PointSymbolizer": rule.PointSymbolizer,
                    "LineSymbolizer": rule.LineSymbolizer,
                    "PolygonSymbolizer": rule.PolygonSymbolizer
                });
            }
        });


        Ext.define('GeostylerRules', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'Name', type: 'string'},
                {name: 'Title', type: 'string'},
                {name: 'legendUrl', type: 'string'},
                {name: 'MinScaleDenominator'},
                {name: 'MaxScaleDenominator'},
                {name: 'Filter'},
                {name: 'PointSymbolizer'},
                {name: 'LineSymbolizer'},
                {name: 'PolygonSymbolizer'}
            ]
        });
        this.store = Ext.create('Ext.data.Store', {
            model: 'GeostylerRules',
            data: {"rules": rules},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'rules'
                }
            }
        });

        this.superclass.constructor.call(this);
        this.setValue(this.getStore().getAt(0).data.Name);
    }
});


Ext.define('CWN2.button.GeoStyler.RuleFieldSet', {
    extend: 'Ext.form.FieldSet',
    alias: "widget.cwn2-btn-geostyler-rule-fieldset",
    title: ' ',
    border: false,
    layout: 'vbox',
    padding: '0',
    constructor: function (config) {
        this.items = [
            {
                xtype: 'fieldset',
                border: false,
                flex: 1,
                width: 350,
                layout: 'hbox',
                padding: '0',
                items: [
                    {
                        xtype: 'cwn2-btn-geostyler-rule-combo',
                        layer: config.layer
                    },
                    {
                        xtype: 'tbfill'
                    },
                    {
                        xtype: 'cwn2-btn-geostyler-rule-legend',
                        legendUrl: config.layer.legendUrl + "&RULE=" + config.layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[0].Name
                    }
                ]

            }, {
                xtype: 'fieldset',
                border: false,
                flex: 1,
                width: 350,
                layout: 'hbox',
                padding: '0',
                items: [
                    {
                        xtype: 'cwn2-btn-geostyler-add-rule'
                    },
                    {
                        xtype: 'tbfill'
                    },
                    {
                        xtype: 'cwn2-btn-geostyler-delete-rule'
                    },
                    {
                        xtype: 'tbfill'
                    },

                    {
                        xtype: 'cwn2-btn-geostyler-change-rule-order'
                    },
                    {
                        xtype: 'tbfill'
                    },
                    {
                        xtype: 'cwn2-btn-geostyler-generate-rules'
                    }

                ]
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.AddRule', {
    extend: 'Ext.button.Button',
    alias: "widget.cwn2-btn-geostyler-add-rule",
    text: 'Add Rule',
    constructor: function (config) {
        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.DeleteRule', {
    extend: 'Ext.button.Button',
    alias: "widget.cwn2-btn-geostyler-delete-rule",
    text: 'Delete Rule',
    constructor: function (config) {
        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.ChangeRuleOrder', {
    extend: 'Ext.button.Button',
    alias: "widget.cwn2-btn-geostyler-change-rule-order",
    text: 'Cambia Ordine',
    constructor: function (config) {
        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.ChangeRuleOrder.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-btn-geostyler-change-rule-order-window',
    closeAction: 'destroy',
    title: CWN2.I18n.get("Cambia Ordine"),
    height: 500,
    width: 400,
    layout: "fit",
    resizable: false,

    constructor: function (config) {
        var me = this;

        var data = [];
        Ext.each(config.rules, function (rule, index) {
            if (rule.Name !== "LABEL") {
                data.push(rule);
            }
        });
        this.items = [
            {
                xtype: 'cwn2-btn-geostyler-change-rule-order-panel',
                rules: config.rules
            }
        ];

        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.ChangeRuleOrder.Panel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.cwn2-btn-geostyler-change-rule-order-panel',
    hideHeaders: true,
    selModel: {
        mode: 'MULTI'
    },
    viewConfig: {
        plugins: {
            ptype: 'gridviewdragdrop'
        }
    },
    columns: [
        {
            dataIndex: "Title",
            width: 380
        }
    ],
    width: 380,
    height: 150,
    buttons: [
        {
            text: CWN2.I18n.get("Salva"),
            action: "change-rule-order-submit"
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: "change-rule-order-cancel"
        }
    ],
    constructor: function (config) {

        var data = [];
        Ext.each(config.rules, function (rule, index) {
            if (rule.Name !== "LABEL") {
                data.push(rule);
            }
        });

        this.store = Ext.create('Ext.data.Store', {
            fields: [
                {
                    name: "Name", mapping: "Name"
                },
                {
                    name: "Title", mapping: "Title"
                }
            ],
            data: data
        })

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.GenerateRules', {
    extend: 'Ext.button.Button',
    alias: "widget.cwn2-btn-geostyler-generate-rules",
    text: 'Genera Rules',
    constructor: function (config) {
        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.GenerateRules.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-btn-geostyler-generate-rules-window',
    closeAction: 'destroy',
    title: CWN2.I18n.get("Genera Classificazione"),
    height: 500,
    width: 400,
    layout: "fit",
    resizable: false,

    constructor: function (config) {
        var me = this;

        this.items = [
            {
                xtype: 'cwn2-btn-geostyler-generate-rules-order-panel',
                columns: config.columns
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.GenerateRules.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-generate-rules-order-panel',
    frame: true,
    labelWidth: 1,
    bodyStyle: "padding:5px 5px 0",
    height: 215,
    buttons: [
        {
            text: CWN2.I18n.get("Salva"),
            action: "change-generate-rules-submit"
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: "change-rule-order-cancel"
        }
    ],

    constructor: function (config) {
        var me = this;

        this.items = [
            {
                xtype: 'cwn2-btn-geostyler-generate-rules-columns-combo',
                columns: config.columns
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.GenerateRules.ColumnCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-generate-rules-columns-combo",
    fieldLabel: 'Campo',
    labelWidth: 40,
    queryMode: 'local',
    store: [],
    typeAhead: true,
    triggerAction: 'all',
    width: 300,
    previousValue: null,
    constructor: function (config) {
        var columns = [];
        Ext.each(config.columns, function (column) {
            if (column.type === "VARCHAR2") {
                columns.push(column.name);
            }
        });
        this.store = columns;
        this.superclass.constructor.call(this);
    }
});



Ext.define('CWN2.button.GeoStyler.TabPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.cwn2-btn-geostyler-tab-panel',
    activeTab: 0,
    bodyBorder: false,
    deferredRender: false,
    layoutOnTabChange: true,
    border: false,
    flex: 1,
    plain: true,
    items: [],
    constructor: function (config) {
        var me = this;
        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-symbol-tab',
                rule: config.rule,
                geomType: config.geomType
            },
            {
                xtype: 'cwn2-btn-geostyler-advanced-tab',
                rule: config.rule
            },
            {
                xtype: 'cwn2-btn-geostyler-label-tab',
                labelRule: config.labelRule,
                columns: config.columns,
                geomType: config.geomType
            }
        ];

        this.superclass.constructor.call(this);
        this.setActiveTab(config.activeTab);
    }
});


Ext.define('CWN2.button.GeoStyler.LabelTab', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-label-tab',
    frame: false,
    title: "Label",
    labelWidth: 1,
    //height: 250,
    items: [],
    constructor: function (config) {
        var me = this;

        me.items = [
            {
                xtype: "cwn2-btn-geostyler-label-panel",
                labelRule: config.labelRule,
                columns: config.columns,
                geomType: config.geomType
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LabelPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-label-panel',
    frame: true,
    //height: 250,
    title: "",
    items: [],
    constructor: function (config) {
        var me = this;

        me.items = [
            {
                xtype: "cwn2-btn-geostyler-label-columns-combo",
                columns: config.columns,
                labelRule: config.labelRule
            },
            {
                xtype: "cwn2-btn-geostyler-label-font-panel",
                labelRule: config.labelRule
            },
            {
                xtype: "cwn2-btn-geostyler-label-placement-panel",
                labelRule: config.labelRule,
                geomType: config.geomType
            }
        ];


        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LabelColumnsCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-label-columns-combo",
    fieldLabel: 'Campo',
    labelWidth: 40,
    queryMode: 'local',
    store: [],
    typeAhead: true,
    triggerAction: 'all',
    width: 400,
    previousValue: null,
    listeners: {
        select: function (comp, record, index) {
            if (comp.getValue() == "" || comp.getValue() == "&nbsp;")
                comp.setValue(null);
        }
    },
    constructor: function (config) {
        var columns = [];
        Ext.each(config.columns, function (column) {
            columns.push(column.name);
        });
        this.store = columns;
        this.superclass.constructor.call(this);
        if (config.labelRule && config.labelRule.TextSymbolizer && config.labelRule.TextSymbolizer.Label && config.labelRule.TextSymbolizer.Label.PropertyName) {
            this.setValue(config.labelRule.TextSymbolizer.Label.PropertyName);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelFontPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-label-font-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            labelRule = config.labelRule,
            fontFamily = null,
            fontSize = null,
            fontStyle = null,
            fontWeight = null,
            haloColor = null,
            haloRadius = null,
            minScale = null,
            maxScale = null,
            color = null;

        if (labelRule && labelRule.TextSymbolizer) {
            fontFamily = getCssParameter(labelRule.TextSymbolizer.Font, "font-family");
            fontSize = getCssParameter(labelRule.TextSymbolizer.Font, "font-size");
            fontStyle = getCssParameter(labelRule.TextSymbolizer.Font, "font-style");
            fontWeight = getCssParameter(labelRule.TextSymbolizer.Font, "font-weight");
            color = getCssParameter(labelRule.TextSymbolizer.Fill, "fill");
            minScale = parseFloat(labelRule.MinScaleDenominator);
            maxScale = parseFloat(labelRule.MaxScaleDenominator);
            haloColor = (labelRule.TextSymbolizer.Halo) ? getCssParameter(labelRule.TextSymbolizer.Halo.Fill, "fill") : null;
            haloRadius = (labelRule.TextSymbolizer.Halo) ? labelRule.TextSymbolizer.Halo.Radius: null;
        }

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-label-font-family-combo',
                fontFamily: fontFamily
            },
            {
                xtype: 'cwn2-btn-geostyler-label-font-size',
                fontSize: fontSize
            },
            {
                xtype: 'cwn2-btn-geostyler-label-font-style-combo',
                fontStyle: fontStyle
            },
            {
                xtype: 'cwn2-btn-geostyler-label-font-weight-combo',
                fontWeight: fontWeight
            },
            {
                xtype: 'cwn2-btn-geostyler-label-fill-color-field',
                color: color
            },
            {
                xtype: 'cwn2-btn-geostyler-label-halo-radius',
                haloRadius: haloRadius
            },
            {
                xtype: 'cwn2-btn-geostyler-label-halo-color-field',
                haloColor: haloColor
            },
            {
                xtype: "cwn2-btn-geostyler-label-min-scale",
                minScale: minScale
            },
            {
                xtype: "cwn2-btn-geostyler-label-max-scale",
                maxScale: maxScale
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LabelPlacementPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-label-placement-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this;

        //if (config.geomType === "LINE") {
        //    me.items = [
        //        {
        //            xtype: "cwn2-btn-geostyler-label-point-placement-panel",
        //            labelRule: config.labelRule
        //        },
        //        {
        //            xtype: "cwn2-btn-geostyler-label-line-placement-panel",
        //            labelRule: config.labelRule
        //        }
        //    ]
        //} else {
        me.items = [
            {
                xtype: "cwn2-btn-geostyler-label-point-placement-panel",
                labelRule: config.labelRule
            }
        ]
        //}

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LabelLinePlacementPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-label-line-placement-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this;
        me.items = [
            {
                xtype: "cwn2-btn-geostyler-label-line-perpendicular-offset",
                labelRule: config.labelRule
            }
        ]
        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.LabelPerpendicularOffset', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-line-perpendicular-offset",
    fieldLabel: 'Line Offset',
    labelWidth: 80,
    minValue: 1,
    width: 130,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.labelRule && config.labelRule.TextSymbolizer && config.labelRule.TextSymbolizer.LabelPlacement && config.labelRule.TextSymbolizer.LabelPlacement.LinePlacement && config.labelRule.TextSymbolizer.LabelPlacement.LinePlacement.PerpendicularOffset) {
            this.setValue(config.labelRule.TextSymbolizer.LabelPlacement.LinePlacement.PerpendicularOffset);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelPointPlacementPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-label-point-placement-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this;
        me.items = [
            {
                xtype: "cwn2-btn-geostyler-label-anchor-x",
                labelRule: config.labelRule
            },
            {
                xtype: "cwn2-btn-geostyler-label-anchor-y",
                labelRule: config.labelRule
            },
            {
                xtype: "cwn2-btn-geostyler-label-displacement-x",
                labelRule: config.labelRule
            },
            {
                xtype: "cwn2-btn-geostyler-label-displacement-y",
                labelRule: config.labelRule
            }
        ];
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LabelFontSize', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-font-size",
    fieldLabel: 'Size',
    labelWidth: 40,
    minValue: 1,
    width: 100,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.fontSize)) {
            this.setValue(parseInt(config.fontSize));
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelFontFamilyCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-label-font-family-combo",
    fieldLabel: 'Font',
    labelWidth: 40,
    queryMode: 'local',
    store: [],
    typeAhead: true,
    triggerAction: 'all',
    width: 250,
    previousValue: null,
    constructor: function (config) {
        this.store = GeoStyler.app.geoServerFontList;
        this.superclass.constructor.call(this);
        if (config.fontFamily) {
            this.setValue(config.fontFamily);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelFontStyleCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-label-font-style-combo",
    fieldLabel: 'Stile',
    labelWidth: 40,
    queryMode: 'local',
    store: ["normal", "italic", "oblique"],
    typeAhead: true,
    triggerAction: 'all',
    value: "normal",
    width: 150,
    previousValue: null,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.fontStyle) {
            this.setValue(config.fontStyle);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelFontWeightCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-label-font-weight-combo",
    fieldLabel: 'Peso',
    labelWidth: 40,
    queryMode: 'local',
    store: ["normal", "bold"],
    typeAhead: true,
    triggerAction: 'all',
    value: "normal",
    width: 150,
    previousValue: null,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.fontWeight) {
            this.setValue(config.fontWeight);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelFillColorField', {
    extend: 'Ext.ux.ColorField',
    alias: "widget.cwn2-btn-geostyler-label-fill-color-field",
    fieldLabel: 'Color',
    labelWidth: 40,
    width: 200,
    value: '#ffffff',
    msgTarget: 'qtip',
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.color) {
            this.setValue(config.color);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelHaloColorField', {
    extend: 'Ext.ux.ColorField',
    alias: "widget.cwn2-btn-geostyler-label-halo-color-field",
    fieldLabel: 'Halo Color',
    labelWidth: 60,
    width: 200,
    value: '#ffffff',
    msgTarget: 'qtip',
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.haloColor) {
            this.setValue(config.haloColor);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelHaloRadius', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-halo-radius",
    fieldLabel: 'Halo',
    labelWidth: 60,
    minValue: 0,
    width: 120,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.haloRadius)) {
            this.setValue(parseInt(config.haloRadius));
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelMinScaleDenominator', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-min-scale",
    fieldLabel: 'Denom. Scala Min.',
    labelWidth: 120,
    minValue: 1,
    width: 300,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.minScale)) {
            this.setValue(config.minScale);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelMaxScaleDenominator', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-max-scale",
    fieldLabel: 'Denom. Scala Max.',
    labelWidth: 120,
    minValue: 1,
    width: 300,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.maxScale)) {
            this.setValue(config.maxScale);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelAnchorX', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-anchor-x",
    fieldLabel: 'Anchor X',
    labelWidth: 60,
    minValue: 0,
    maxValue: 1,
    width: 110,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.labelRule && config.labelRule.TextSymbolizer && config.labelRule.TextSymbolizer.LabelPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.AnchorPoint) {
            this.setValue(config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.AnchorPoint.AnchorPointX);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelAnchorY', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-anchor-y",
    fieldLabel: 'Anchor Y',
    labelWidth: 60,
    minValue: 0,
    maxValue: 1,
    width: 110,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.labelRule && config.labelRule.TextSymbolizer && config.labelRule.TextSymbolizer.LabelPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.AnchorPoint) {
            this.setValue(config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.AnchorPoint.AnchorPointY);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelDisplacementX', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-displacement-x",
    fieldLabel: 'Displacement X',
    labelWidth: 90,
    minValue: 0,
    maxValue: 100,
    width: 140,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.labelRule && config.labelRule.TextSymbolizer && config.labelRule.TextSymbolizer.LabelPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.Displacement) {
            this.setValue(config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.Displacement.DisplacementX);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelDisplacementY', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-displacement-y",
    fieldLabel: 'Displacement Y',
    labelWidth: 90,
    minValue: 0,
    maxValue: 100,
    width: 140,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.labelRule && config.labelRule.TextSymbolizer && config.labelRule.TextSymbolizer.LabelPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.Displacement) {
            this.setValue(config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.Displacement.DisplacementY);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.AdvancedTab', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-advanced-tab',
    frame: false,
    title: "Avanzate",
    labelWidth: 1,
    //height: 250,
    items: [],
    constructor: function (config) {
        var me = this;


        me.items = [
            {
                xtype: "cwn2-btn-geostyler-advanced-panel",
                rule: config.rule
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.AdvancedPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-advanced-panel',
    frame: true,
    //height: 250,
    title: "",
    items: [],
    buttons: [
        {
            text: CWN2.I18n.get("Validazione"),
            action: "geostyler-validate-cql"
        }
    ],
    constructor: function (config) {
        var me = this;


        me.items = [
            {
                xtype: "cwn2-btn-geostyler-rule-title",
                rule: config.rule
            },
            {
                xtype: "cwn2-btn-geostyler-min-scale",
                rule: config.rule
            },
            {
                xtype: "cwn2-btn-geostyler-max-scale",
                rule: config.rule
            },
            {
                xtype: "cwn2-btn-geostyler-cql-filter",
                rule: config.rule
            }

        ];

        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.RuleTitle', {
    extend: 'Ext.form.field.Text',
    alias: "widget.cwn2-btn-geostyler-rule-title",
    fieldLabel: 'Titolo',
    labelWidth: 70,
    width: 300,
    value: "Classe Base",
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.rule.Title)) {
            this.setValue(config.rule.Title);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.MinScaleDenominator', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-min-scale",
    fieldLabel: 'Denom. Scala Min.',
    labelWidth: 120,
    minValue: 1,
    width: 300,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.rule.MinScaleDenominator)) {
            this.setValue(config.rule.MinScaleDenominator);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.MaxScaleDenominator', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-max-scale",
    fieldLabel: 'Denom. Scala Max.',
    labelWidth: 120,
    minValue: 1,
    width: 300,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.rule.MaxScaleDenominator)) {
            this.setValue(config.rule.MaxScaleDenominator);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.CQLFilter', {
    extend: 'Ext.form.field.TextArea',
    alias: "widget.cwn2-btn-geostyler-cql-filter",
    fieldLabel: 'Filtro',
    labelWidth: 50,
    width: 450,
    rows: 10,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.rule.Filter)) {
            var cqlFilter = CWN2.Util.transformFilterJson2CQL(config.rule.Filter);
            this.setValue(cqlFilter);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.SymbolTab', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-symbol-tab',
    frame: false,
    title: "Simbologia",
    labelWidth: 1,
    //height: 250,
    items: [],
    constructor: function (config) {
        var me = this,
            geomType = config.geomType,
            xType = null;

        switch (geomType) {
            case "POLYGON":
                xType = 'cwn2-btn-geostyler-polygon-panel'
                break;
            case "LINE":
                xType = 'cwn2-btn-geostyler-line-panel'
                break;
            case "POINT":
                xType = 'cwn2-btn-geostyler-point-panel'
                break;
        }

        me.items = [
            {
                xtype: xType,
                rule: config.rule
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.PointPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-point-panel',
    frame: true,
    //height: 250,
    title: "POINT",
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            pointType,
            pointTab;

        if (!rule.PointSymbolizer) {
            console.log("Manca elemento <PointSymbolizer>")
            return;
        }
        if (!rule.PointSymbolizer.Graphic) {
            console.log("Manca elemento <Graphic>")
            return;
        }
        if (rule.PointSymbolizer.Graphic.ExternalGraphic) {
            pointType = "Graphic";
            pointTab = {xtype: "cwn2-btn-geostyler-graphic-point-panel", rule: rule};
        }

        if (rule.PointSymbolizer.Graphic.Mark) {
            pointType = "WKN";
            pointTab = {xtype: "cwn2-btn-geostyler-wkn-point-panel", rule: rule};
        }

        me.items = [
            {
                xtype: "cwn2-btn-geostyler-point-type-combo",
                rule: rule,
                pointType: pointType
            },
            pointTab
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.GraphicPointPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-graphic-point-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            graphic = config.rule.PointSymbolizer.Graphic;

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-external-graphic-url',
                externalGraphic: graphic.ExternalGraphic.OnlineResource["_xlink:href"]
            },
            {
                xtype: 'cwn2-btn-geostyler-graphic-format-combo',
                graphicFormat: graphic.ExternalGraphic.Format
            },
            {
                xtype: 'cwn2-btn-geostyler-symbol-size',
                size: graphic.Size
            },
            {
                xtype: 'cwn2-btn-geostyler-external-graphic-img',
                externalGraphic: graphic.ExternalGraphic.OnlineResource["_xlink:href"],
                size: graphic.Size
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.WknPointPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-wkn-point-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            mark = config.rule.PointSymbolizer.Graphic.Mark;

        setDefaultMark(mark, "POINT");

        var fillColor = getCssParameter(mark.Fill, "fill");
        var fillOpacity = getCssParameter(mark.Fill, "fill-opacity") || "1";
        var strokeColor = getCssParameter(mark.Stroke, "stroke");
        var strokeWidth = getCssParameter(mark.Stroke, "stroke-width");
        var strokeOpacity = getCssParameter(mark.Stroke, "stroke-opacity");

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-symbol-combo',
                symbol: mark.WellKnownName
            },
            {
                xtype: 'cwn2-btn-geostyler-symbol-size',
                size: config.rule.PointSymbolizer.Graphic.Size
            },
            {
                xtype: 'cwn2-btn-geostyler-fill-color-field',
                color: fillColor
            },
            {
                xtype: 'cwn2-btn-geostyler-fill-opacity-slider',
                opacity: fillOpacity
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-color-field',
                color: strokeColor
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-width',
                width: strokeWidth
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-opacity-slider',
                opacity: strokeOpacity
            }
        ];
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LinePanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-line-panel',
    frame: false,
    //height: 250,
    title: "LINE",
    items: [],
    constructor: function (config) {
        var me = this;

        me.items = [
            {
                xtype: "cwn2-btn-geostyler-stroke-panel",
                rule: config.rule
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.PolygonPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-polygon-panel',
    frame: false,
    //height: 250,
    title: "POLYGON",
    items: [],
    constructor: function (config) {
        var me = this;

        me.items = [
            {
                xtype: "cwn2-btn-geostyler-stroke-panel",
                rule: config.rule
            },
            {
                xtype: "cwn2-btn-geostyler-polygon-fill-panel",
                rule: config.rule
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.PolygonFillPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-polygon-fill-panel',
    frame: true,
    //height: 250,
//    title: "Fill",
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            symbolizer = rule.PolygonSymbolizer;

        var fillType,
            fillTab = null;

        if (!symbolizer.Fill) {
            fillType = "None";
            fillTab = null;
        } else {
            if (!symbolizer.Fill.GraphicFill) {
                fillType = "Simple";
                fillTab = {xtype: "cwn2-btn-geostyler-simple-fill-panel", rule: rule};
            } else {
                if (symbolizer.Fill.GraphicFill.Graphic.ExternalGraphic) {
                    fillType = "Graphic";
                    fillTab = {xtype: "cwn2-btn-geostyler-graphic-fill-panel", rule: rule};
                }
                if (symbolizer.Fill.GraphicFill.Graphic.Mark) {
                    fillType = "Hatch";
                    fillTab = {xtype: "cwn2-btn-geostyler-hatch-fill-panel", rule: rule};
                }
            }
        }

        me.items = [
            {
                xtype: "cwn2-btn-geostyler-fill-type-combo",
                rule: rule,
                fillType: fillType
            },
            fillTab
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.SimpleFillPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-simple-fill-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            symbolizer = rule.PolygonSymbolizer;


        var fillColor = getCssParameter(symbolizer.Fill, "fill");
        var fillOpacity = getCssParameter(symbolizer.Fill, "fill-opacity") || "1";

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-fill-color-field',
                color: fillColor
            },
            {
                xtype: 'cwn2-btn-geostyler-fill-opacity-slider',
                opacity: fillOpacity
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.HatchFillPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-hatch-fill-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            symbolizer = rule.PolygonSymbolizer,
            graphic = symbolizer.Fill.GraphicFill.Graphic;

        setDefaultMark(graphic.Mark, "POLYGON");

        var graphicName = graphic.Mark.WellKnownName;
        var symbolSize = graphic.Size;
        var fillColor = getCssParameter(graphic.Mark.Fill, "fill");
        var fillOpacity = getCssParameter(graphic.Mark.Fill, "fill-opacity") || "1";
        var strokeColor = getCssParameter(graphic.Mark.Stroke, "stroke");
        var strokeWidth = getCssParameter(graphic.Mark.Stroke, "stroke-width");
        var strokeOpacity = getCssParameter(graphic.Mark.Stroke, "stroke-opacity");
        var strokeDasharray = getCssParameter(symbolizer.Stroke, "stroke-dasharray");

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-hatch-combo',
                symbol: graphicName
            },
            {
                xtype: 'cwn2-btn-geostyler-symbol-size',
                size: symbolSize
            },
            {
                xtype: 'cwn2-btn-geostyler-hatch-stroke-color-field',
                color: strokeColor
            },
            {
                xtype: 'cwn2-btn-geostyler-hatch-stroke-width',
                width: strokeWidth
            },
            {
                xtype: 'cwn2-btn-geostyler-hatch-stroke-opacity-slider',
                opacity: strokeOpacity
            },
            {
                xtype: 'cwn2-btn-geostyler-hatch-fill-color-field',
                color: fillColor
            },
            {
                xtype: 'cwn2-btn-geostyler-hatch-fill-opacity-slider',
                opacity: fillOpacity
            }

        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.GraphicFillPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-graphic-fill-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            graphic = rule.PolygonSymbolizer.Fill.GraphicFill.Graphic;

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-external-graphic-url',
                externalGraphic: graphic.ExternalGraphic.OnlineResource["_xlink:href"]
            },
            {
                xtype: 'cwn2-btn-geostyler-graphic-format-combo',
                graphicFormat: graphic.ExternalGraphic.Format
            },
            {
                xtype: 'cwn2-btn-geostyler-symbol-size',
                size: graphic.Size
            }, {
                xtype: 'cwn2-btn-geostyler-external-graphic-img',
                externalGraphic: graphic.ExternalGraphic.OnlineResource["_xlink:href"],
                size: graphic.Size
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.StrokePanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-stroke-panel',
    frame: true,
    //height: 200,
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            symbolizer = rule.LineSymbolizer || rule.PolygonSymbolizer;

        var strokeType,
            strokeTab = null;

        if (symbolizer.Stroke || symbolizer.Stroke === "") {
            if (symbolizer.Stroke.GraphicStroke) {
                strokeType = "WKN";
                strokeTab = {xtype: "cwn2-btn-geostyler-wkn-stroke-panel", rule: rule};
            } else {
                strokeType = "Simple";
                strokeTab = {xtype: "cwn2-btn-geostyler-simple-stroke-panel", rule: rule};
            }
        } else {
            strokeType = "None";
            strokeTab = null;
        }


        me.items = [
            {
                xtype: "cwn2-btn-geostyler-stroke-type-combo",
                strokeType: strokeType,
                rule: rule
            },
            strokeTab
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.SimpleStrokePanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-simple-stroke-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            symbolizer = rule.LineSymbolizer || rule.PolygonSymbolizer;

        if (symbolizer.Stroke === "") {
            symbolizer.Stroke = {
                "CssParameter": [
                    {
                        "_name": "stroke",
                        "__text": "#000000"
                    },
                    {
                        "_name": "stroke-width",
                        "__text": "1"
                    }
                ]
            }
        }
        var strokeColor = getCssParameter(symbolizer.Stroke, "stroke") || "#000000";
        var strokeWidth = getCssParameter(symbolizer.Stroke, "stroke-width");
        var strokeOpacity = getCssParameter(symbolizer.Stroke, "stroke-opacity");
        var strokeDasharray = getCssParameter(symbolizer.Stroke, "stroke-dasharray");

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-stroke-color-field',
                color: strokeColor
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-width',
                width: strokeWidth
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-opacity-slider',
                opacity: strokeOpacity
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-dasharray',
                strokeDashstyle: strokeDasharray
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.WknStrokePanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-wkn-stroke-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            symbolizer = rule.LineSymbolizer || rule.PolygonSymbolizer,
            graphic = symbolizer.Stroke.GraphicStroke.Graphic;

        setDefaultMark(graphic.Mark, "LINE");

        var graphicName = graphic.Mark.WellKnownName;
        var symbolSize = graphic.Size;
        var fillColor = getCssParameter(graphic.Mark.Fill, "fill");
        var fillOpacity = getCssParameter(graphic.Mark.Fill, "fill-opacity") || "1";
        var strokeColor = getCssParameter(graphic.Mark.Stroke, "stroke");
        var strokeWidth = getCssParameter(graphic.Mark.Stroke, "stroke-width");
        var strokeOpacity = getCssParameter(graphic.Mark.Stroke, "stroke-opacity");
        var strokeDasharray = getCssParameter(symbolizer.Stroke, "stroke-dasharray");

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-symbol-combo',
                symbol: graphicName
            },
            {
                xtype: 'cwn2-btn-geostyler-symbol-size',
                size: symbolSize
            },
            {
                xtype: 'cwn2-btn-geostyler-fill-color-field',
                color: fillColor
            },
            //{
            //    xtype: 'cwn2-btn-geostyler-fill-opacity-slider',
            //    opacity: fillOpacity
            //},
            {
                xtype: 'cwn2-btn-geostyler-stroke-color-field',
                color: strokeColor
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-width',
                width: strokeWidth
            },
            //{
            //    xtype: 'cwn2-btn-geostyler-stroke-opacity-slider',
            //    opacity: strokeOpacity
            //},
            {
                xtype: 'cwn2-btn-geostyler-stroke-dasharray',
                strokeDashstyle: strokeDasharray
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.FillColorField', {
    extend: 'Ext.ux.ColorField',
    alias: "widget.cwn2-btn-geostyler-fill-color-field",
    fieldLabel: 'Fill Color',
    labelWidth: 50,
    width: 200,
    value: '#ffffff',
    msgTarget: 'qtip',
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.color) {
            this.setValue(config.color);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.HatchFillColorField', {
    extend: 'Ext.ux.ColorField',
    alias: "widget.cwn2-btn-geostyler-hatch-fill-color-field",
    fieldLabel: 'Fill Color',
    labelWidth: 50,
    width: 200,
    value: '#ffffff',
    msgTarget: 'qtip',
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.color) {
            this.setValue(config.color);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.FillOpacitySlider', {
    extend: 'Ext.slider.Single',
    alias: "widget.cwn2-btn-geostyler-fill-opacity-slider",
    fieldLabel: 'Fill Opacity',
    labelWidth: 50,
    width: 200,
    value: 100,
    //increment: 5,
    minValue: 0,
    maxValue: 100,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.opacity) {
            this.setValue(100 * parseFloat(config.opacity));
        }
    }
});


Ext.define('CWN2.button.GeoStyler.HatchFillOpacitySlider', {
    extend: 'Ext.slider.Single',
    alias: "widget.cwn2-btn-geostyler-hatch-fill-opacity-slider",
    fieldLabel: 'Fill Opacity',
    labelWidth: 50,
    width: 200,
    value: 100,
    //increment: 5,
    minValue: 0,
    maxValue: 100,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.opacity) {
            this.setValue(100 * parseFloat(config.opacity));
        }
    }
});
Ext.define('CWN2.button.GeoStyler.StrokeColorField', {
    extend: 'Ext.ux.ColorField',
    alias: "widget.cwn2-btn-geostyler-stroke-color-field",
    fieldLabel: 'Stroke Color',
    labelWidth: 50,
    width: 200,
    value: '#ffffff',
    msgTarget: 'qtip',
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.color) {
            this.setValue(config.color);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.HatchStrokeColorField', {
    extend: 'Ext.ux.ColorField',
    alias: "widget.cwn2-btn-geostyler-hatch-stroke-color-field",
    fieldLabel: 'Stroke Color',
    labelWidth: 50,
    width: 200,
    value: '#ffffff',
    msgTarget: 'qtip',
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.color) {
            this.setValue(config.color);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.StrokeOpacitySlider', {
    extend: 'Ext.slider.Single',
    alias: "widget.cwn2-btn-geostyler-stroke-opacity-slider",
    fieldLabel: 'Stroke Opacity',
    labelWidth: 50,
    width: 200,
    value: 100,
    //increment: 5,
    minValue: 0,
    maxValue: 100,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.opacity) {
            this.setValue(100 * parseFloat(config.opacity));
        }
    }
});

Ext.define('CWN2.button.GeoStyler.HatchStrokeOpacitySlider', {
    extend: 'Ext.slider.Single',
    alias: "widget.cwn2-btn-geostyler-hatch-stroke-opacity-slider",
    fieldLabel: 'Stroke Opacity',
    labelWidth: 50,
    width: 200,
    value: 100,
    //increment: 5,
    minValue: 0,
    maxValue: 100,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.opacity) {
            this.setValue(100 * parseFloat(config.opacity));
        }
    }
});

Ext.define('CWN2.button.GeoStyler.StrokeTypeCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-stroke-type-combo",
    fieldLabel: 'Stroke',
    labelWidth: 40,
    queryMode: 'local',
    store: [],
    typeAhead: true,
    triggerAction: 'all',
    value: "Simple",
    width: 200,
    previousValue: null,
    constructor: function (config) {
        if (config.rule.LineSymbolizer) {
            this.store = [
                ["Simple", "Simple"],
                ["WKN", "WKN"]
            ]
        } else {
            this.store = [
                ["None", "None"],
                ["Simple", "Simple"]
            ]

        }
        this.superclass.constructor.call(this);
        this.setValue(config.strokeType);
        this.previousValue = config.strokeType;
    }

});

Ext.define('CWN2.button.GeoStyler.StrokeWidth', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-stroke-width",
    fieldLabel: 'Width',
    labelWidth: 50,
    width: 100,
    maxValue: 99,
    minValue: 0,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(parseFloat(config.width));
    }
});

Ext.define('CWN2.button.GeoStyler.HatchStrokeWidth', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-hatch-stroke-width",
    fieldLabel: 'Width',
    labelWidth: 50,
    width: 100,
    maxValue: 99,
    minValue: 0.5,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(parseFloat(config.width));
    }
});

Ext.define('CWN2.button.GeoStyler.StrokeDashStyle1', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-stroke-dashstyle1",
    width: 45,
    flex: 1,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(parseFloat(config.value));
    }
});

Ext.define('CWN2.button.GeoStyler.StrokeDashStyle2', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-stroke-dashstyle2",
    width: 45,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(parseFloat(config.value));
    }
});

Ext.define('CWN2.button.GeoStyler.StrokeDashArray', {
    extend: 'Ext.form.FieldContainer',
    alias: "widget.cwn2-btn-geostyler-stroke-dasharray",
    fieldLabel: 'Dash',
    labelWidth: 50,
    width: 190,
    layout: 'hbox',
    items: [],
    constructor: function (config) {

        var dashArray, value1, value2;

        if (config.strokeDashstyle) {
            dashArray = config.strokeDashstyle.split(" ");
            value1 = dashArray[0];
            value2 = dashArray[1];
        }

        this.items = [
            {
                xtype: 'cwn2-btn-geostyler-stroke-dashstyle1',
                flex: 1,
                value: value1
            },
            {
                xtype: 'tbfill'
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-dashstyle2',
                flex: 1,
                value: value2
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.SymbolCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-symbol-combo",
    fieldLabel: 'Symbol',
    labelWidth: 40,
    queryMode: 'local',
    store: [
        ["circle", "circle"],
        ["square", "square"],
        ["triangle", "triangle"],
        ["star", "star"],
        ["cross", "cross"],
        ["x", "x"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "Simple",
    width: 200,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.symbol) {
            this.setValue(config.symbol);
        } else {
            this.setValue("circle");
        }
    }
});

Ext.define('CWN2.button.GeoStyler.ExternalGraphicUrl', {
    extend: 'Ext.form.field.TextArea',
    alias: "widget.cwn2-btn-geostyler-external-graphic-url",
    fieldLabel: 'Url',
    labelWidth: 50,
    width: 400,
    value: "http://geoportale.regione.liguria.it/geoservices/geoserver_sld/sld/img/point-black.png",
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.externalGraphic)) {
            this.setValue(config.externalGraphic);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.RuleLegend', {
    extend: 'Ext.Img',
    alias: "widget.cwn2-btn-geostyler-rule-legend",
    width: 20,
    height: 20,
    value: "",
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.legendUrl) {
            this.setSrc(config.legendUrl);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.ExternalGraphicImg', {
    extend: 'Ext.Img',
    alias: "widget.cwn2-btn-geostyler-external-graphic-img",
    fieldLabel: 'Img',
    labelWidth: 50,
    width: 20,
    height: 20,
    value: "http://geoportale.regione.liguria.it/geoservices/geoserver_sld/sld/img/point-black.png",
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.externalGraphic) {
            this.setSrc(config.externalGraphic);
        }
        if (config.size) {
            this.setHeight(parseInt(config.size));
            this.setWidth(parseInt(config.size));
        }
    }
});

Ext.define('CWN2.button.GeoStyler.GraphicFormatCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-graphic-format-combo",
    fieldLabel: 'Formato',
    labelWidth: 50,
    queryMode: 'local',
    store: [
        ["image/png", "png"],
        ["image/jpeg", "jpeg"],
        ["image/gif", "gif"],
        ["image/svg+xml", "svg"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "Simple",
    width: 120,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.graphicFormat) {
            this.setValue(config.graphicFormat);
        } else {
            this.setValue("image/png");
        }
    }
});

Ext.define('CWN2.button.GeoStyler.HatchCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-hatch-combo",
    fieldLabel: 'Symbol',
    labelWidth: 40,
    queryMode: 'local',
    store: [
        ["circle", "circle"],
        ["square", "square"],
        ["triangle", "triagle"],
        ["star", "star"],
        ["cross", "cross"],
        ["x", "x"],
        ["shape://vertline", "shape://vertline"],
        ["shape://horline", "shape://horline"],
        ["shape://slash", "shape://slash"],
        ["shape://backslash", "shape://backslash"],
        ["shape://dot", "shape://dot"],
        ["shape://plus", "shape://plus"],
        ["shape://times", "shape://times"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "Simple",
    width: 200,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(config.symbol);
    }
});

Ext.define('CWN2.button.GeoStyler.SymbolSize', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-symbol-size",
    fieldLabel: 'Size',
    labelWidth: 50,
    width: 100,
    maxValue: 99,
    minValue: 0.5,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(parseFloat(config.size));
    }
});

Ext.define('CWN2.button.GeoStyler.PointTypeCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-point-type-combo",
    fieldLabel: 'Type',
    labelWidth: 40,
    queryMode: 'local',
    store: [
        ["WKN", "WKN"],
        ["Graphic", "Graphic"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "Simple",
    width: 200,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(config.pointType);
    }
});

Ext.define('CWN2.button.GeoStyler.FillTypeCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-fill-type-combo",
    fieldLabel: 'Fill',
    labelWidth: 40,
    queryMode: 'local',
    store: [
        ["None", "None"],
        ["Simple", "Simple"],
        ["Graphic", "Graphic"],
        ["Hatch", "Hatch"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "Simple",
    width: 200,
    previousValue: null,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(config.fillType);
        this.previousValue = config.fillType;
    }
});


// CONTROLLER
Ext.define('CWN2.controller.button.geostyler', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.GeoStyler'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-geostyler'
        },
        {
            ref: 'win',
            selector: 'cwn2-btn-geostyler-win'
        },
        {
            ref: 'panel',
            selector: 'cwn2-btn-geostyler-panel'
        },
        {
            ref: 'layerCombo',
            selector: 'cwn2-btn-geostyler-layer-combo'
        },
        {
            ref: 'ruleCombo',
            selector: 'cwn2-btn-geostyler-rule-combo'
        },
        {
            ref: 'ruleFieldset',
            selector: 'cwn2-btn-geostyler-rule-fieldset'
        },
        {
            ref: 'tabPanel',
            selector: 'cwn2-btn-geostyler-tab-panel'
        },
        {
            ref: 'labelPanel',
            selector: 'cwn2-btn-geostyler-label-panel'
        },
        {
            ref: 'labelFontPanel',
            selector: 'cwn2-btn-geostyler-label-font-panel'
        },
        {
            ref: 'labelPlacementPanel',
            selector: 'cwn2-btn-geostyler-label-placement-panel'
        },
        {
            ref: 'pointTypeCombo',
            selector: 'cwn2-btn-geostyler-point-type-combo'
        },
        {
            ref: 'strokeTypeCombo',
            selector: 'cwn2-btn-geostyler-stroke-type-combo'
        },
        {
            ref: 'strokePanel',
            selector: 'cwn2-btn-geostyler-stroke-panel'
        },
        {
            ref: 'fillTypeCombo',
            selector: 'cwn2-btn-geostyler-fill-type-combo'
        },
        {
            ref: 'fillPanel',
            selector: 'cwn2-btn-geostyler-polygon-fill-panel'
        },
        {
            ref: 'pointPanel',
            selector: 'cwn2-btn-geostyler-point-panel'
        },
        {
            ref: 'dashLine',
            selector: 'cwn2-btn-geostyler-stroke-dashstyle1'
        },
        {
            ref: 'dashSpace',
            selector: 'cwn2-btn-geostyler-stroke-dashstyle2'
        },
        {
            ref: 'externalGraphicImg',
            selector: 'cwn2-btn-geostyler-external-graphic-img'
        },
        {
            ref: 'cqlFilter',
            selector: 'cwn2-btn-geostyler-cql-filter'
        },
        {
            ref: 'ruleLegend',
            selector: 'cwn2-btn-geostyler-rule-legend'
        },
        {
            ref: 'changeRuleOrderWin',
            selector: 'cwn2-btn-geostyler-change-rule-order-window'
        },
        {
            ref: 'changeRuleOrderPanel',
            selector: 'cwn2-btn-geostyler-change-rule-order-panel'
        },
        {
            ref: 'generateRulesWin',
            selector: 'cwn2-btn-geostyler-generate-rules-window'
        },
        {
            ref: 'generateRulesColumnCombo',
            selector: 'cwn2-btn-geostyler-generate-rules-columns-combo'
        }


    ],

    init: function (application) {
        CWN2.Util.log('CWN2.controller.button.geostyler: init');

        this.control({
            'button[action=geostyler-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=geostyler-cancel]': {
                click: this.onCancelButtonClick
            },
            'button[action=geostyler-validate-cql]': {
                click: this.onValidateCQLButtonClick
            },
            'button[action=change-rule-order-submit]': {
                click: this.onChangeRuleOrderSubmitButtonClick
            },
            'button[action=change-rule-order-cancel]': {
                click: this.onChangeRuleOrderCancelButtonClick
            },
            'button[action=change-generate-rules-submit]': {
                click: this.onChangeGenerateRulesSubmitButtonClick
            },
            'cwn2-btn-geostyler-layer-combo': {
                select: this.onLayerSelect
            },
            'cwn2-btn-geostyler-rule-combo': {
                select: this.onRuleSelect
            },
            'cwn2-btn-geostyler-rule-title': {
                change: this.onRuleTitleChange
            },
            'cwn2-btn-geostyler-min-scale': {
                change: this.onMinScaleChange
            },
            'cwn2-btn-geostyler-max-scale': {
                change: this.onMaxScaleChange
            },
            'cwn2-btn-geostyler-point-type-combo': {
                select: this.onPointTypeSelect
            },
            'cwn2-btn-geostyler-stroke-type-combo': {
                select: this.onStrokeTypeSelect
            },
            'cwn2-btn-geostyler-fill-type-combo': {
                select: this.onFillTypeSelect
            },
            'cwn2-button-geostyler': {
                click: this.onClick
            },
            'cwn2-btn-geostyler-add-rule': {
                click: this.onAddRuleClick
            },
            'cwn2-btn-geostyler-delete-rule': {
                click: this.onDeleteRuleClick
            },
            'cwn2-btn-geostyler-change-rule-order': {
                click: this.onChangeRuleOrderClick
            },
            'cwn2-btn-geostyler-generate-rules': {
                click: this.onGenerateRulesClick
            },
            //
            'cwn2-btn-geostyler-symbol-combo': {
                select: this.onSymbolComboSelect
            },
            'cwn2-btn-geostyler-hatch-combo': {
                select: this.onHatchComboSelect
            },
            'cwn2-btn-geostyler-symbol-size': {
                change: this.onSymbolSizeChange
            },
            'cwn2-btn-geostyler-fill-color-field': {
                select: this.onFillColorFieldChange
            },
            'cwn2-btn-geostyler-hatch-fill-color-field': {
                select: this.onHatchFillColorFieldChange
            },
            'cwn2-btn-geostyler-stroke-color-field': {
                select: this.onStrokeColorFieldChange
            },
            'cwn2-btn-geostyler-hatch-stroke-color-field': {
                select: this.onHatchStrokeColorFieldChange
            },
            'cwn2-btn-geostyler-stroke-width': {
                change: this.onStrokeWidthChange
            },
            'cwn2-btn-geostyler-hatch-stroke-width': {
                change: this.onHatchStrokeWidthChange
            },
            'cwn2-btn-geostyler-stroke-dashstyle1': {
                change: this.onStrokeDashStyleChange
            },
            'cwn2-btn-geostyler-stroke-dashstyle2': {
                change: this.onStrokeDashStyleChange
            },
            'cwn2-btn-geostyler-stroke-opacity-slider': {
                change: this.onStrokeOpacitySliderChange
            },
            'cwn2-btn-geostyler-hatch-stroke-opacity-slider': {
                change: this.onHatchStrokeOpacitySliderChange
            },
            'cwn2-btn-geostyler-fill-opacity-slider': {
                change: this.onFillOpacitySliderChange
            },
            'cwn2-btn-geostyler-hatch-fill-opacity-slider': {
                change: this.onHatchFillOpacitySliderChange
            },
            'cwn2-btn-geostyler-external-graphic-url': {
                change: this.onExternalGraphicUrlChange
            },
            'cwn2-btn-geostyler-graphic-format-combo': {
                select: this.onGraphicFormatSelect
            },
            'cwn2-btn-geostyler-cql-filter': {
                change: this.onCQLFilterChange
            },
            'cwn2-btn-geostyler-label-font-size': {
                change: this.onLabelFontSizeChange
            },
            'cwn2-btn-geostyler-label-font-family-combo': {
                select: this.onLabelFontFamilySelect
            },
            'cwn2-btn-geostyler-label-font-style-combo': {
                select: this.onLabelFontStyleSelect
            },
            'cwn2-btn-geostyler-label-font-weight-combo': {
                select: this.onLabelFontWeightSelect
            },
            'cwn2-btn-geostyler-label-fill-color-field': {
                select: this.onLabelFillColorFieldChange
            },
            'cwn2-btn-geostyler-label-halo-color-field': {
                select: this.onLabelHaloColorFieldChange
            },
            'cwn2-btn-geostyler-label-halo-radius': {
                change: this.onLabelHaloRadiusChange
            },
            'cwn2-btn-geostyler-label-min-scale': {
                change: this.onLabelMinScaleChange
            },
            'cwn2-btn-geostyler-label-max-scale': {
                change: this.onLabelMaxScaleChange
            },
            'cwn2-btn-geostyler-label-anchor-x': {
                change: this.onLabelAnchorXChange
            },
            'cwn2-btn-geostyler-label-anchor-y': {
                change: this.onLabelAnchorYChange
            },
            'cwn2-btn-geostyler-label-displacement-x': {
                change: this.onLabelDisplacementXChange
            },
            'cwn2-btn-geostyler-label-displacement-y': {
                change: this.onLabelDisplacementYChange
            },
            'cwn2-btn-geostyler-label-line-perpendicular-offset': {
                change: this.onLabelPerpendicularOffsetChange
            },
            'cwn2-btn-geostyler-label-columns-combo': {
                change: this.onLabelColumnSelect
            }
            //

        });
    },

    onAddRuleClick: function (button, e, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var rules = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;

        var ind = 0;
        var indLabel = rules.length;
        Ext.each(rules, function (rule, index) {
            if (rule.Name !== "LABEL") {
                ind = parseInt(rule.Name.replace("R", ""));
            } else {
                indLabel = index;
            }
        });
        var ruleName = "R" + parseInt(ind + 1);

        var pointSymbolizer = null,
            lineSymbolizer = null,
            polygonSymbolizer = null,
            rule = {
                Name: ruleName,
                Title: "Nuova Rule"
            };

        switch (selectedLayer.geomType) {
            case "POLYGON":
                rule.PolygonSymbolizer = {
                    Stroke: this.defaultSimpleStrokeStyle
                };
                break;
            case "LINE":
                rule.LineSymbolizer = {
                    Stroke: this.defaultSimpleStrokeStyle
                };
                break;
            case "POINT":
                rule.PointSymbolizer = {
                    Graphic: this.defaultWKNPointStyle
                };
                break;
        }

        rules.splice(indLabel, 0, rule);

        //ricarico panel
        me.selectedRule = me.getSelectedRuleIndex(me.selectedLayer, ruleName);
        this.reloadRuleCombo();
        this.getRuleCombo().setValue(ruleName);
        this.reloadTabPanel();
    },

    getNumRules: function (rules) {
        var numRules = 0;
        Ext.each(rules, function (rule, index) {
            if (rule.Name !== "LABEL") {
                numRules++;
            }
        });
        return numRules;
    },

    onChangeRuleOrderClick: function (button, e, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var rules = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;

        var indLabel = rules.length;
        var numRules = me.getNumRules(rules);
        if (numRules < 2) {
            CWN2.Util.msgBox("Attenzione: Non posso riordinare le rule perchè unica");
            return;
        }

        var win = this.getChangeRuleOrderWin();

        if (!win) {
            win = Ext.create('CWN2.button.GeoStyler.ChangeRuleOrder.Window', {
                rules: rules
            });
        }
        this.showHideWin(win, CWN2.app.layout.mapPanel);
    },


    onGenerateRulesClick: function (button, e, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var columns = selectedLayer.columns;

        var win = this.getGenerateRulesWin();


        if (!win) {
            win = Ext.create('CWN2.button.GeoStyler.GenerateRules.Window', {
                columns: columns
            });
        }
        this.showHideWin(win, CWN2.app.layout.mapPanel);
    },


    onDeleteRuleClick: function (button, e, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var rules = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;

        var indLabel = rules.length;
        var numRules = me.getNumRules(rules);
        if (numRules < 2) {
            CWN2.Util.msgBox("Attenzione: Non posso cancellare la rule perchè unica");
            return;
        }

        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function (btn) {
                if (btn === "yes") {
                    rules.splice(me.selectedRule, 1);
                    me.selectedRule = 0;
                    me.reloadRuleCombo();
                    me.reloadTabPanel();
                }
            }
        );


    },

    onLabelColumnSelect: function (combo, records, eOpts) {
        var newValue = records;
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];

        if (newValue === "&nbsp;") {
            return;
        }
        if (newValue === null) {
            Ext.MessageBox.confirm(
                CWN2.I18n.get('Conferma'),
                CWN2.I18n.get('Sei sicuro?'),
                function (btn) {
                    if (btn === "yes") {
                        me.deleteLabelRule();
                        me.reloadLabelPanel();
                        me.setEditedLayerFlag(selectedLayer.name);
                    }
                }
            );
        } else {
            if (!selectedLayer.labelRule) {
                me.createLabelRule();
                me.reloadLabelPanel();
            }
            selectedLayer.labelRule.TextSymbolizer.Label.PropertyName = newValue;
            me.setEditedLayerFlag(selectedLayer.name);
        }
    },

    reloadLabelPanel: function () {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];

        Ext.suspendLayouts();
        var panel = this.getLabelPanel();
        panel.remove(this.getLabelFontPanel());
        panel.remove(this.getLabelPlacementPanel());

        panel.add({
            xtype: "cwn2-btn-geostyler-label-font-panel",
            labelRule: selectedLayer.labelRule
        });
        panel.add({
            xtype: "cwn2-btn-geostyler-label-placement-panel",
            labelRule: selectedLayer.labelRule,
            geomType: selectedLayer.geomType
        });

        Ext.resumeLayouts(true);
    },

    createLabelRule: function () {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        selectedLayer.labelRule = Ext.clone(me.defaultLabel);

        Ext.each(me.layersConfig, function (layerConfig) {
            if (layerConfig.name === selectedLayer.name) {
                layerConfig.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule.push(selectedLayer.labelRule);
            }
        });
    },

    deleteLabelRule: function () {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];

        delete selectedLayer.labelRule;

        Ext.each(me.layersConfig, function (layerConfig) {
            if (layerConfig.name === selectedLayer.name) {
                delete layerConfig.labelRule;
                var labelRuleIndex = -1;
                Ext.each(layerConfig.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule, function (rule, index) {
                    if (rule.Name === "LABEL") {
                        labelRuleIndex = index;
                    }
                });
                if (labelRuleIndex > -1) {
                    layerConfig.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule.splice(labelRuleIndex, 1);
                }
            }
        });
    },


    onLabelPerpendicularOffsetChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.LabelPlacement && selectedLayer.labelRule.TextSymbolizer.LabelPlacement.LinePlacement) {
            selectedLayer.labelRule.TextSymbolizer.LabelPlacement.LinePlacement.PerpendicularOffset = newValue;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onLabelDisplacementXChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.LabelPlacement && selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement) {
            selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.Displacement.DisplacementX = newValue;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },
    onLabelDisplacementYChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.LabelPlacement && selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement) {
            selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.Displacement.DisplacementY = newValue;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onLabelAnchorXChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.LabelPlacement && selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement) {
            selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.AnchorPoint.AnchorPointX = newValue;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },
    onLabelAnchorYChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.LabelPlacement && selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement) {
            selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.AnchorPoint.AnchorPointY = newValue;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onLabelMaxScaleChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (newValue) {
            if (selectedLayer.labelRule) {
                selectedLayer.labelRule.MaxScaleDenominator = newValue;
            }
        } else {
            delete selectedLayer.labelRule['MaxScaleDenominator'];
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },
    onLabelMinScaleChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (newValue) {
            if (selectedLayer.labelRule) {
                selectedLayer.labelRule.MinScaleDenominator = newValue;
            }
        } else {
            delete selectedLayer.labelRule['MinScaleDenominator'];
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onLabelHaloRadiusChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Halo) {
            selectedLayer.labelRule.TextSymbolizer.Halo.Radius = newValue;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },
    onLabelHaloColorFieldChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Halo) {
            setCssParameter(selectedLayer.labelRule.TextSymbolizer.Halo.Fill, "fill", newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },
    onLabelFillColorFieldChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Fill) {
            setCssParameter(selectedLayer.labelRule.TextSymbolizer.Fill, "fill", newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onSymbolComboSelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];
        // POINT_WNK
        if (selectedRule.PointSymbolizer) {
            selectedRule.PointSymbolizer.Graphic.Mark.WellKnownName = records[0].data.field1;
        }
        // LINE_WKN
        if (selectedRule.LineSymbolizer) {
            selectedRule.LineSymbolizer.Stroke.GraphicStroke.Graphic.Mark.WellKnownName = records[0].data.field1;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },


    onLabelFontWeightSelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var newValue = records[0].data.field1;
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Font) {
            setCssParameter(selectedLayer.labelRule.TextSymbolizer.Font, "font-weight", newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onLabelFontStyleSelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var newValue = records[0].data.field1;
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Font) {
            setCssParameter(selectedLayer.labelRule.TextSymbolizer.Font, "font-style", newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },
    onLabelFontFamilySelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var newValue = records[0].data.field1;
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Font) {
            setCssParameter(selectedLayer.labelRule.TextSymbolizer.Font, "font-family", newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onLabelFontSizeChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Font) {
            setCssParameter(selectedLayer.labelRule.TextSymbolizer.Font, "font-size", newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onCQLFilterChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];
        try {
            if (newValue) {
                selectedRule.Filter = CWN2.Util.transformFilterCQL2json(newValue);
            } else {
                delete selectedRule['Filter'];
            }
        } catch (exception) {
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onExternalGraphicUrlChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        // POINT_GRAPHIC
        if (selectedRule.PointSymbolizer) {
            selectedRule.PointSymbolizer.Graphic.ExternalGraphic.OnlineResource["_xlink:href"] = newValue;
        }
        // POLYGON_GRAPHIC
        if (selectedRule.PolygonSymbolizer) {
            selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.ExternalGraphic.OnlineResource["_xlink:href"] = newValue;
        }
        var externalGraphicImg = this.getExternalGraphicImg()
        if (externalGraphicImg) {
            externalGraphicImg.setSrc(newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onRuleTitleChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        selectedRule.Title = newValue;
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onMinScaleChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        if (newValue) {
            selectedRule.MinScaleDenominator = newValue;
        } else {
            delete selectedRule['MinScaleDenominator'];
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onMaxScaleChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        if (newValue) {
            selectedRule.MaxScaleDenominator = newValue;
        } else {
            delete selectedRule['MaxScaleDenominator'];
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    setFillParam: function (param, newValue) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        // POINT_WNK
        if (selectedRule.PointSymbolizer) {
            setCssParameter(selectedRule.PointSymbolizer.Graphic.Mark.Fill, param, newValue);
        }
        // LINE_WKN
        if (selectedRule.LineSymbolizer) {
            setCssParameter(selectedRule.LineSymbolizer.Stroke.GraphicStroke.Graphic.Mark.Fill, param, newValue);
        }
        // POLYGON_SIMPLE_FILL
        if (selectedRule.PolygonSymbolizer) {
            setCssParameter(selectedRule.PolygonSymbolizer.Fill, param, newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onFillColorFieldChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        this.setFillParam("fill", newValue);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onHatchFillColorFieldChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        setCssParameter(selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Mark.Fill, "fill", newValue);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onFillOpacitySliderChange: function (slider, newValue, thumb, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        this.setFillParam("fill-opacity", newValue / 100);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onHatchFillOpacitySliderChange: function (slider, newValue, thumb, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        setCssParameter(selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Mark.Fill, "fill-opacity", newValue / 100);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onSymbolComboSelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        // POINT_WNK
        if (selectedRule.PointSymbolizer) {
            selectedRule.PointSymbolizer.Graphic.Mark.WellKnownName = records[0].data.field1;
        }
        // LINE_WKN
        if (selectedRule.LineSymbolizer) {
            selectedRule.LineSymbolizer.Stroke.GraphicStroke.Graphic.Mark.WellKnownName = records[0].data.field1;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onHatchComboSelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Mark.WellKnownName = records[0].data.field1;
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onGraphicFormatSelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        if (selectedRule.PointSymbolizer) {
            selectedRule.PointSymbolizer.Graphic.ExternalGraphic.Format = records[0].data.field1;
        }
        if (selectedRule.PolygonSymbolizer) {
            selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.ExternalGraphic.Format = records[0].data.field1;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onSymbolSizeChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        if (selectedRule.PointSymbolizer) {
            selectedRule.PointSymbolizer.Graphic.Size = newValue;
        }
        if (selectedRule.LineSymbolizer) {
            selectedRule.LineSymbolizer.Stroke.GraphicStroke.Graphic.Size = newValue;
        }
        if (selectedRule.PolygonSymbolizer) {
            //selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Size =  newValue;
        }
        var externalGraphicImg = this.getExternalGraphicImg()
        if (externalGraphicImg) {
            externalGraphicImg.setWidth(newValue);
            externalGraphicImg.setHeight(newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    setStrokeParam: function (param, newValue) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        // POINT_WNK
        if (selectedRule.PointSymbolizer) {
            setCssParameter(selectedRule.PointSymbolizer.Graphic.Mark.Stroke, param, newValue);
        }
        // LINE
        if (selectedRule.LineSymbolizer && selectedRule.LineSymbolizer.Stroke) {
            if (selectedRule.LineSymbolizer && selectedRule.LineSymbolizer.Stroke.GraphicStroke) {
                // LINE_WNK
                setCssParameter(selectedRule.LineSymbolizer.Stroke.GraphicStroke.Graphic.Mark.Stroke, param, newValue);
            } else {
                // LINE_SIMPLE
                setCssParameter(selectedRule.LineSymbolizer.Stroke, param, newValue);
            }
        }
        // POLYGON_STROKE
        if (selectedRule.PolygonSymbolizer) {
            setCssParameter(selectedRule.PolygonSymbolizer.Stroke, param, newValue);
        }
    },


    onStrokeColorFieldChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        this.setStrokeParam("stroke", newValue);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onHatchStrokeColorFieldChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        setCssParameter(selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Mark.Stroke, "stroke", newValue);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onStrokeWidthChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        this.setStrokeParam("stroke-width", newValue);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onHatchStrokeWidthChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        setCssParameter(selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Mark.Stroke, "stroke-width", newValue);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onStrokeOpacitySliderChange: function (slider, newValue, thumb, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        this.setStrokeParam("stroke-opacity", newValue / 100);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onHatchStrokeOpacitySliderChange: function (slider, newValue, thumb, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        setCssParameter(selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Mark.Stroke, "stroke-opacity", newValue / 100);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onStrokeDashStyleChange: function (field, newValue, thumb, eOpts) {
        var dashStyleLine = this.getDashLine(),
            dashStyleSpace = this.getDashSpace();

        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        if (dashStyleLine && dashStyleSpace) {
            if (dashStyleLine.getValue() && dashStyleSpace.getValue()) {
                var strokeDasharray = dashStyleLine.getValue() + " " + dashStyleSpace.getValue();
                // LINE
                if (selectedRule.LineSymbolizer) {
                    setCssParameter(selectedRule.LineSymbolizer.Stroke, "stroke-dasharray", strokeDasharray);
                }
                // POLYGON_SIMPLE_STROKE
                if (selectedRule.PolygonSymbolizer) {
                    setCssParameter(selectedRule.PolygonSymbolizer.Stroke, "stroke-dasharray", strokeDasharray);
                }
            }
            else {
                // LINE
                if (selectedRule.LineSymbolizer) {
                    setCssParameter(selectedRule.LineSymbolizer.Stroke, "stroke-dasharray", "");
                }
                // POLYGON_SIMPLE_STROKE
                if (selectedRule.PolygonSymbolizer) {
                    setCssParameter(selectedRule.PolygonSymbolizer.Stroke, "stroke-dasharray", "");
                }
            }
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    setEditedLayerFlag: function (layerName) {
        var layersConfig = this.layersConfig;
        Ext.each(layersConfig, function (layerConfig) {
            if (layerConfig.name === layerName) {
                layerConfig.edited = true;
            }
        });
    },

    onClick: function () {
        var win = this.getWin(),
            button = this.getButton(),
            me = this;

        if (!win) {
            var layers = me.buildLayersConfig(button.config);
            if (!layers) {
                CWN2.Util.msgBox("Attenzione: Nessun livello disponibile");
                return;
            }
            win = Ext.create('CWN2.button.GeoStyler.Window', {
                layersConfig: me.layersConfig
            });
        }
        this.showHideWin(win, CWN2.app.layout.mapPanel);

    },

    showHideWin: function (win, mapPanel) {
        if (!win.isVisible()) {
            win.show();
            win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
        } else {
            win.hide();
        }
    },

    buildLayersConfig: function (config) {
        var me = this;
        var idMap = parseInt(config.options.idMap);
        var layersConfig = CWN2.app.map.layerManager.overlayLayersConfig;
        me.layersConfig = [];
        Ext.each(layersConfig, function (layerConfig) {
            var layer = Ext.clone(layerConfig);
            if (layer.geomType === "VECTOR" && layer.idMap === idMap) {
                var rules = layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;
                var labelRule = null;
                Ext.each(rules, function (rule) {
                    if (rule.Name === 'LABEL') {
                        labelRule = rule;
                        return false;
                    }
                });
                var columns = [{name: "&nbsp;",type: null}];
                Ext.each(layer.dbSchema.columns, function (column) {
                    columns.push(column);
                });
                var url = (Array.isArray(layerConfig.wmsParams.url))? layerConfig.wmsParams.url[0] : layerConfig.wmsParams.url;
                var legendUrl = url + "LAYER=" + layer.name + "&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LEGEND_OPTIONS=forceLabels:off";
                me.layersConfig.push({
                    name: layer.name,
                    label: layer.legend.label,
                    legendUrl: legendUrl,
                    id: layer.id,
                    sld: layer.sld,
                    labelRule: labelRule,
                    columns: columns,
                    edited: false,
                    cachePostGIS: layerConfig.cachePostGIS,
                    geomType: layer.geomSubType
                })
            }
        });
        if (me.layersConfig.length > 0) {
            me.layersConfig.reverse();
            me.selectedLayer = 0;
            me.selectedRule = 0;
            return true;
        } else {
            return false;
        }

    },

    onLayerSelect: function (combo, records, eOpts) {
        var me = this;

        me.selectedLayer = me.getSelectedLayerIndex(records[0].data.name);
        me.selectedRule = 0;

        //ricarico panel
        this.reloadRuleCombo();
        this.reloadTabPanel();
    },

    getSelectedLayerIndex: function (layerName) {
        var me = this,
            layerIndex = 0;

        Ext.each(me.layersConfig, function (layerConfig, index) {
            if (layerConfig.name === layerName) {
                layerIndex = index;
                return false;
            }
        });

        return layerIndex;
    },

    getSelectedRuleIndex: function (layerIndex, ruleName) {
        var me = this,
            ruleIndex = 0;

        var rules = me.layersConfig[layerIndex].sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;
        Ext.each(rules, function (ruleConfig, index2) {
            if (ruleConfig.Name === ruleName) {
                ruleIndex = index2;
                return false;
            }
        });

        return ruleIndex;
    },

    onRuleSelect: function (combo, records, eOpts) {
        var me = this;
        // imposto la rule selezionata
        me.selectedRule = me.getSelectedRuleIndex(me.selectedLayer, records[0].data.Name);
        // imposto immagine legenda
        this.getRuleLegend().setSrc(records[0].data.legendUrl);
        //ricarico panel
        this.reloadTabPanel();
    },

    reloadRuleCombo: function () {
        var me = this;

        Ext.suspendLayouts();
        var panel = me.getPanel();
        panel.remove(me.getRuleFieldset());
        panel.add({
            xtype: 'cwn2-btn-geostyler-rule-fieldset',
            layer: me.layersConfig[me.selectedLayer]
        });

        var ruleCombo = me.getRuleCombo();
        ruleCombo.setValue(ruleCombo.getStore().getAt(me.selectedRule).data.Name);

        Ext.resumeLayouts(true);

    },

    reloadTabPanel: function () {
        var me = this;
        Ext.suspendLayouts();
        var panel = this.getPanel();
        var tabPanel = this.getTabPanel();

        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        var idx = (tabPanel.items) ? tabPanel.items.indexOf(tabPanel.getActiveTab()) : 0;
        panel.remove(tabPanel);
        panel.add({
            xtype: 'cwn2-btn-geostyler-tab-panel',
            rule: selectedRule,
            geomType: selectedLayer.geomType,
            labelRule: selectedLayer.labelRule,
            columns: selectedLayer.columns,
            activeTab: idx
        });
        Ext.resumeLayouts(true);
    },

    onStrokeTypeSelect: function (combo, records, eOpts) {
        var me = this,
            strokeType = records[0].data.field1,
            strokeTab;

        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        //controllo fill/stroke
        if (me.getFillTypeCombo()) {
            var fillType = me.getFillTypeCombo().getValue();
            if (fillType === "None" && strokeType === "None") {
                CWN2.Util.msgBox("Attenzione: Stroke e Fill non possono essere entrambi non impostati");
                combo.setValue(combo.previousValue);
                return;
            }
        }

        combo.previousValue = strokeType;

        //ricarico panel
        Ext.suspendLayouts();
        var panel = this.getStrokePanel();
        panel.remove(panel.items.items[1]);
        var symbolizer = selectedRule.LineSymbolizer || selectedRule.PolygonSymbolizer;

        if (strokeType === "None") {
            // Se stile attuale è di tipo STROKE_* levo elemento Stroke
            if (selectedRule.PolygonSymbolizer && selectedRule.PolygonSymbolizer.Stroke) {
                var fill = selectedRule.PolygonSymbolizer.Fill;
                selectedRule.PolygonSymbolizer = {
                    "Fill": fill
                }
            }
        }
        if (strokeType === "Simple") {
            // Se stile attuale è di tipo STROKE_NONE o STROKE_GRAPHIC cambio in STROKE_SIMPLE di default
            if ((!symbolizer.Stroke) || (symbolizer.Stroke.GraphicStroke)) {
                symbolizer.Stroke = Ext.clone(this.defaultSimpleStrokeStyle);
            }
            strokeTab = {xtype: "cwn2-btn-geostyler-simple-stroke-panel", rule: selectedRule};
            panel.add(strokeTab);
        }
        if (strokeType === "WKN") {
            // Se stile attuale è di tipo STROKE_NONE o STROKE_SIMPLE cambio in STROKE_SIMPLE di default
            if ((!symbolizer.Stroke) || (!symbolizer.Stroke.GraphicStroke)) {
                symbolizer.Stroke = Ext.clone(this.defaultWKNStrokeStyle);
            }
            strokeTab = {xtype: "cwn2-btn-geostyler-wkn-stroke-panel", rule: selectedRule};
            panel.add(strokeTab);
        }

        Ext.resumeLayouts(true);
    },

    onFillTypeSelect: function (combo, records, eOpts) {
        var me = this,
            fillType = records[0].data.field1,
            fillTab;

        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        //controllo fill/stroke
        var strokeType = me.getStrokeTypeCombo().getValue();
        if (fillType === "None" && strokeType === "None") {
            CWN2.Util.msgBox("Attenzione: Stroke e Fill non possono essere entrambi non impostati");
            combo.setValue(combo.previousValue);
            return;
        }

        combo.previousValue = fillType;

        //ricarico panel
        Ext.suspendLayouts();
        var panel = this.getFillPanel();
        panel.remove(panel.items.items[1]);

        var symbolizer = selectedRule.PolygonSymbolizer;

        if (fillType === "None") {
            // Se stile attuale è di tipo STROKE_* levo elemento Stroke
            if (symbolizer && symbolizer.Fill) {
                var stroke = symbolizer.Stroke;
                symbolizer = {
                    "Stroke": stroke
                }
            }
        }
        if (fillType === "Simple") {
            // Se stile attuale non è di tipo FILL_SIMPLE imposto FILL_SIMPLE di default
            if ((!symbolizer.Fill) || (symbolizer.Fill.GraphicFill)) {
                symbolizer.Fill = Ext.clone(this.defaultSimpleFillStyle);
            }
            fillTab = {xtype: "cwn2-btn-geostyler-simple-fill-panel", rule: selectedRule};
            panel.add(fillTab);
        }
        if (fillType === "Graphic") {
            // Se stile attuale non è di tipo FILL_GRAPHIC imposto FILL_GRAPHIC di default
            if ((!symbolizer.Fill) || (!symbolizer.Fill.GraphicFill) || (!symbolizer.Fill.GraphicFill.Graphic.ExternalGraphic)) {
                symbolizer.Fill = Ext.clone(this.defaultGraphicFillStyle);
            }
            fillTab = {xtype: "cwn2-btn-geostyler-graphic-fill-panel", rule: selectedRule};
            panel.add(fillTab);
        }
        if (fillType === "Hatch") {
            // Se stile attuale non è di tipo FILL_HATCH imposto FILL_HATCH di default
            if ((!symbolizer.Fill) || (!symbolizer.Fill.GraphicFill) || (!symbolizer.Fill.GraphicFill.Graphic.Mark)) {
                symbolizer.Fill = Ext.clone(this.defaultHatchFillStyle);
            }
            fillTab = {xtype: "cwn2-btn-geostyler-hatch-fill-panel", rule: selectedRule};
            panel.add(fillTab);
        }
        Ext.resumeLayouts(true);
    },

    onPointTypeSelect: function (combo, records, eOpts) {
        var me = this,
            pointType = records[0].data.field1,
            pointTab;

        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        //ricarico panel
        Ext.suspendLayouts();
        var panel = this.getPointPanel();
        panel.remove(panel.items.items[1]);
        if (pointType === "WKN") {
            // Se stile attuale è di tipo POINT_GRAPHIC cambio stile e imposto lo stile POINT_WKN di default
            if (selectedRule.PointSymbolizer.Graphic.ExternalGraphic) {
                selectedRule.PointSymbolizer.Graphic = Ext.clone(this.defaultWKNPointStyle);
            }
            pointTab = {xtype: "cwn2-btn-geostyler-wkn-point-panel", rule: selectedRule};
        }
        if (pointType === "Graphic") {
            // Se stile attuale è di tipo POINT_WKN cambio stile e imposto lo stile POINT_GRAPHIC di default
            if (selectedRule.PointSymbolizer.Graphic.Mark) {
                selectedRule.PointSymbolizer.Graphic = Ext.clone(this.defaultGraphicPointStyle);
            }
            pointTab = {xtype: "cwn2-btn-geostyler-graphic-point-panel", rule: selectedRule};
        }
        panel.add(pointTab);
        Ext.resumeLayouts(true);
    },


    defaultLabel: {
        "Name": "LABEL",
        "Title": "",
        "TextSymbolizer": {
            "Label": {
                "PropertyName": "NUMERO_PRATICA"
            },
            "Font": {
                "CssParameter": [
                    {
                        "_name": "font-family",
                        "__text": "Verdana"
                    },
                    {
                        "_name": "font-size",
                        "__text": 8
                    },
                    {
                        "_name": "font-style",
                        "__text": "normal"
                    },
                    {
                        "_name": "font-weight",
                        "__text": "normal"
                    }
                ]
            },
            "LabelPlacement": {
                "PointPlacement": {
                    "AnchorPoint": {
                        "AnchorPointX": 0,
                        "AnchorPointY": 0
                    }
                }
            },
            "Halo": {
                "Radius": 2,
                "Fill": {
                    "CssParameter": [{
                        "_name": "fill",
                        "__text": "#F5FFFA"
                    }]
                }
            },
            "Fill": {
                "CssParameter": [{
                    "_name": "fill",
                    "__text": "#000000"
                }]
            },
            "VendorOption": {
                "_name": "conflictResolution",
                "__text": "false"
            }
        }
    },

    defaultSimpleFillStyle: {
        "CssParameter": [
            {
                "_name": "fill",
                "__text": "#FFFFFF"
            },
            {
                "_name": "fill-opacity",
                "__text": "1"
            }
        ]
    },

    defaultGraphicFillStyle: {
        "GraphicFill": {
            "Graphic": {
                "ExternalGraphic": {
                    "OnlineResource": {
                        "_xmlns:xlink": "http://www.w3.org/1999/xlink",
                        "_xlink:type": "simple",
                        "_xlink:href": "http://geoportale.regione.liguria.it/geoservices/geoserver_sld/sld/img/point-black.png"
                    },
                    "Format": "image/png"
                },
                "Size": "6"
            }
        }
    },

    defaultHatchFillStyle: {
        "GraphicFill": {
            "Graphic": {
                "Mark": {
                    "WellKnownName": "shape://slash",
                    "Stroke": {
                        "CssParameter": [
                            {
                                "_name": "stroke",
                                "__text": "#000000"
                            }
                        ]
                    }
                },
                "Size": "8"
            }
        }
    },


    defaultSimpleStrokeStyle: {
        "CssParameter": [
            {
                "_name": "stroke",
                "__text": "#000000"
            },
            {
                "_name": "stroke-opacity",
                "__text": "1"
            },
            {
                "_name": "stroke-width",
                "__text": "1"
            }
        ]
    },


    defaultWKNStrokeStyle: {
        "GraphicStroke": {
            "Graphic": {
                "Mark": {
                    "WellKnownName": "circle",
                    "Fill": {
                        "CssParameter": [
                            {
                                "_name": "fill",
                                "__text": "#FF0000"
                            }
                        ]
                    },
                    "Stroke": {
                        "CssParameter": [
                            {
                                "_name": "stroke",
                                "__text": "#000000"
                            }
                        ]
                    }
                },
                "Size": "6"
            }
        }
    },


    defaultWKNPointStyle: {
        "Mark": {
            "WellKnownName": "circle",
            "Fill": {
                "CssParameter": [
                    {
                        "_name": "fill",
                        "__text": "#FF0000"
                    },
                    {
                        "_name": "fill-opacity",
                        "__text": "1"
                    }
                ]
            },
            "Stroke": {
                "CssParameter": [
                    {
                        "_name": "stroke",
                        "__text": "#000000"
                    },
                    {
                        "_name": "stroke-opacity",
                        "__text": "1"
                    },
                    {
                        "_name": "stroke-width",
                        "__text": "1"
                    }
                ]
            }
        },
        "Size": "10"
    },

    defaultGraphicPointStyle: {
        "ExternalGraphic": {
            "OnlineResource": {
                "_xmlns:xlink": "http://www.w3.org/1999/xlink",
                "_xlink:type": "simple",
                "_xlink:href": "http://geoportale.regione.liguria.it/geoservices/geoserver_sld/sld/img/point-black.png"
            },
            "Format": "image/png"
        },
        "Size": "10"
    },

    onCancelButtonClick: function () {
        var me = this;
        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function (btn) {
                if (btn === "yes") {
                    //Rispristino configurazione salvata
                    me.buildLayersConfig(me.getButton().config);
                    //Ricostruisco finestra
                    var win = me.getWin();
                    win.destroy();
                    win = Ext.create('CWN2.button.GeoStyler.Window', {
                        layersConfig: me.layersConfig
                    });
                    me.showHideWin(win, CWN2.app.layout.mapPanel);
                }
            }
        );
    },

    onValidateCQLButtonClick: function () {
        var cqlFilter = this.getCqlFilter().getValue();
        if (cqlFilter) {
            try {
                var testFilter = CWN2.Util.transformFilterCQL2json(cqlFilter);
                CWN2.Util.msgBox("Parsing Corretto");
            } catch (exception) {
                CWN2.Util.msgBox("Errore parsing del filtro.<br> " + exception);
            }
        }
    },

    onSubmitButtonClick: function (button, e, eOpts) {
        var me = this;

        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function (btn) {
                if (btn === "yes") {
                    // aggiorno configurazione sld del LayerManager
                    Ext.each(me.layersConfig, function (layerConfig) {
                        if (layerConfig.edited) {
                            // controllo stroke-width se = 0 cancello elemento <Stroke>
                            me.checkStrokeWidth(layerConfig)
                            // controllo che scala_min sia minore di scala max
                            if (me.checkScale(layerConfig) && me.checkExternalGraphic(layerConfig)) {
                                var layerConfig2 = Ext.clone(layerConfig);
                                var layerManagerConfig = CWN2.app.map.layerManager.getLayerConfigByName(layerConfig2.name);
                                layerManagerConfig.sld = layerConfig2.sld
                                //mando sld a geoserver
                                var sldXml = GeoStyler.app.x2js.json2xml_str(layerConfig2.sld);
                                var url = "/geoservices/REST/geoserver/geoserver_sld?id=" + layerConfig2.id + "&cache_postgis=" + layerConfig.cachePostGIS
                                Ext.Ajax.request({
                                    url: url,
                                    headers: {'Content-Type': 'application/xml; charset=UTF-8'},
                                    xmlData: sldXml,
                                    success: function (response) {
                                        if (response.responseText.substring(0, 2) === "OK") {
                                            layerConfig.edited = false;
                                        }
                                        // Aggiorno il layer sulla mappa
                                        var olLayer = CWN2.app.map.getLayerByName(layerConfig.name);
                                        olLayer.redraw(true);
                                        // Aggiorno l'immmagine sulla legenda
                                        var legendImg = document.getElementById("legend_img_" + layerConfig.name);
                                        legendImg.src = layerManagerConfig.legend.icon + "?" + new Date().getTime();
                                    }
                                });
                                // imposto flag multiclasse
                                var rules = layerConfig2.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;
                                var numRules = me.getNumRules(rules);
                                CWN2.Util.ajaxRequest({
                                    type: "JSON",
                                    url: "/geoservices/REST/geoserver/set_flag_multiclasse?id=" + layerConfig2.id + "&num_rules=" + numRules,
                                    callBack: function (response) {
                                        console.log(response.message);
                                    }
                                });

                            }
                        }
                    });
                    me.reloadRuleCombo();

                    me.reloadTabPanel();
                    var layer = me.layersConfig[me.selectedLayer]
                    var legendUrl = layer.legendUrl + "&RULE=" + layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule].Name + '&dc=' + new Date().getTime();
                    ;
                    me.getRuleLegend().setSrc(legendUrl);
                }
            }
        );
    },

    checkScale: function (layerConfig) {
        var rules = layerConfig.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;
        var isValid = true;
        Ext.each(rules, function (rule) {
            if (rule.MinScaleDenominator && rule.MaxScaleDenominator && rule.MinScaleDenominator >= rule.MaxScaleDenominator) {
                CWN2.Util.msgBox("Attenzione: la Scala Min. deve essere minore di Scala Max. <br>Layer: " + layerConfig.name + " - " + layerConfig.label);
                isValid = false;
                return false;
            }
        });
        return isValid;
    },

    checkStrokeWidth: function (layerConfig) {
        var rules = layerConfig.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;
        Ext.each(rules, function (rule) {
            // POINT_GRAPHIC
            if (rule.PointSymbolizer && rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Stroke) {
                if (getCssParameter(rule.PointSymbolizer.Graphic.Mark.Stroke, "stroke-width") === 0) {
                    // se stroke-width = 0 levo elemento stroke
                    rule.PointSymbolizer.Graphic.Mark = {
                        WellKnownName: rule.PointSymbolizer.Graphic.Mark.WellKnownName,
                        Fill: rule.PointSymbolizer.Graphic.Mark.Fill
                    };
                }
            }
        });
    },

    checkExternalGraphic: function (layerConfig) {
        var rules = layerConfig.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;
        var isValid = true;
        var imgUrl = null;
        Ext.each(rules, function (rule) {
            // POINT_GRAPHIC
            if (rule.PointSymbolizer && rule.PointSymbolizer.Graphic.ExternalGraphic) {
                imgUrl = rule.PointSymbolizer.Graphic.ExternalGraphic.OnlineResource["_xlink:href"];
            }
            // POLYGON_GRAPHIC
            if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Fill && rule.PolygonSymbolizer.Fill.GraphicFill && rule.PolygonSymbolizer.Fill.GraphicFill.Graphic && rule.PolygonSymbolizer.Fill.GraphicFill.Graphic.ExternalGraphic) {
                imgUrl = rule.PolygonSymbolizer.Fill.GraphicFill.Graphic.ExternalGraphic.OnlineResource["_xlink:href"];
            }
            if (imgUrl) {
                var nImg = document.createElement('img');
                nImg.onerror = function () {
                    CWN2.Util.msgBox("Attenzione: l'immagine " + imgUrl + " non esiste!");
                    isValid = false;
                    return false;
                }
                nImg.src = imgUrl;
            }
        });
        return isValid;
    },

    checkFilter: function (rule, layerConfig) {
        if (rule.Filter) {
            try {
                var testFilter = CWN2.Util.transformFilterJson2CQL(rule.Filter);
            } catch (exception) {
                CWN2.Util.msgBox("Attenzione: Errore Parsing del filtro. <br>Layer: " + layerConfig.name + " - " + layerConfig.label + "<br>Rule: " + rule.Name + " - " + rule.Title + "<br>Errore: " + exception);
            }
        }
    },

    onChangeGenerateRulesSubmitButtonClick: function (button, e, eOpts) {
        var me = this;

        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function (btn) {
                if (btn === "yes") {
                    var column = me.getGenerateRulesColumnCombo().getValue(),
                        layer = me.layersConfig[me.selectedLayer];

                    if (column) {
                        CWN2.Util.ajaxRequest({
                            type: "JSONP",
                            url: "/geoservices/REST/config/query_layer_valuelist/" + layer.name.replace("L", "") + "?column=" + column,
                            callBack: function(response) {
                                if (response && !response.success) {
                                    CWN2.Util.msgBox("Attenzione: - " + response.message);
                                    return;
                                }
                                (response.data && response.data.length > 0) ?
                                    me.generateRules(column, response.data) :
                                    CWN2.Util.msgBox("Nessun oggetto trovato");
                            }
                        });

                    } else {
                        CWN2.Util.msgBox("Attenzione: Selezionare una colonna");
                        return;

                    }
                    var win = me.getGenerateRulesWin();
                    win.destroy();
                }
            }
        );
    },

    generateRules: function(column,values) {
        var me = this,
            layer = me.layersConfig[me.selectedLayer],
            rules = [];

        Ext.each(values, function (value,index) {
            if (value.value) {
                var rule = {};
                rule.Name = "R" + index;
                rule.Title = column + " = " + value.value;
                rule.Filter = CWN2.Util.transformFilterCQL2json(column + " = '" + value.value + "'");
                var colorIndex = (index < 9)? index : index - 9;
                var color = CWN2.Globals.COLOR_SCALES["Random"]["9"][colorIndex];
                switch (layer.geomType) {
                    case "POLYGON":
                        rule.PolygonSymbolizer = {
                            Stroke: me.defaultSimpleStrokeStyle,
                            Fill: {
                                "CssParameter": [
                                    {
                                        "_name": "fill",
                                        "__text": color
                                    },
                                    {
                                        "_name": "fill-opacity",
                                        "__text": "1"
                                    }
                                ]
                            }
                        };
                        break;
                    case "LINE":
                        rule.LineSymbolizer = {
                            Stroke: {
                                "CssParameter": [
                                    {
                                        "_name": "stroke",
                                        "__text": color
                                    },
                                    {
                                        "_name": "stroke-opacity",
                                        "__text": "1"
                                    },
                                    {
                                        "_name": "stroke-width",
                                        "__text": "1"
                                    }
                                ]
                            }
                        };
                        break;
                    case "POINT":
                        rule.PointSymbolizer = {
                            Graphic:{
                                "Mark": {
                                    "WellKnownName": "circle",
                                    "Fill": {
                                        "CssParameter": [
                                            {
                                                "_name": "fill",
                                                "__text": color
                                            },
                                            {
                                                "_name": "fill-opacity",
                                                "__text": "1"
                                            }
                                        ]
                                    }
                                },
                                "Size": "10"
                            }
                        };
                        break;
                }
                rules.push(rule);
            }
        });
        layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule = rules;
        me.reloadRuleCombo();
        me.reloadTabPanel();
        var legendUrl = layer.legendUrl + "&RULE=" + layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule].Name + '&dc=' + new Date().getTime();
        me.getRuleLegend().setSrc(legendUrl);


    },

    onChangeRuleOrderSubmitButtonClick: function (button, e, eOpts) {
        var me = this;

        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function (btn) {
                if (btn === "yes") {
                    var layer = me.layersConfig[me.selectedLayer],
                        rules = layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule,
                        items = me.getChangeRuleOrderPanel().store.data.items,
                        newRules = [];

                    Ext.each(items, function (item) {
                        Ext.each(rules, function (rule) {
                            if (rule.Name === item.data.Name) {
                                newRules.push(rule);
                            }
                        });
                    });
                    Ext.each(rules, function (rule) {
                        if (rule.Name === "LABEL") {
                            newRules.push(rule);
                        }
                    });
                    layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule = newRules;

                    me.reloadRuleCombo();
                    me.reloadTabPanel();
                    var legendUrl = layer.legendUrl + "&RULE=" + layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule].Name + '&dc=' + new Date().getTime();
                    me.getRuleLegend().setSrc(legendUrl);
                    var win = me.getChangeRuleOrderWin();
                    win.destroy();
                }
            }
        );
    },

    onChangeRuleOrderCancelButtonClick: function () {
        var me = this;
        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function (btn) {
                if (btn === "yes") {
                    var win = me.getChangeRuleOrderWin();
                    win.destroy();
                }
            }
        );
    },
    layersConfig: [],

    selectedLayer: null,

    selectedRule: null
});


function getCssParameter(element, paramName) {
    var params = (element) ? element.CssParameter : null,
        value = null;

    Ext.each(params, function (param) {
        if (param["_name"] === paramName) {
            value = param["__text"];
            return false;
        }
    });

    return value;
};

function setCssParameter(element, paramName, paramValue) {
    if (!element) return;

    var params = element.CssParameter,
        flagFound = false;

    Ext.each(params, function (param) {
        if (param["_name"] === paramName) {
            // se esiste parametro lo aggiorno
            param["__text"] = paramValue;
            flagFound = true;
            return false;
        }
    });

    if (!flagFound) {
        if (!element.CssParameter) {
            element.CssParameter = [];
        }
        // se non esiste parametro lo inserisco
        element.CssParameter.push({
            "_name": paramName,
            "__text": paramValue
        })
    }

};

function setDefaultMark(mark, type) {
    // se non esiste fill lo creo
    if (!mark.Fill) {
        mark.Fill = {
            CssParameter: [
                {
                    "_name": "fill",
                    "__text": "#000000"
                }
            ]
        }
        if (type === "POINT") {
            mark.Fill.CssParameter.push(
                {
                    "_name": "fill-opacity",
                    "__text": "1"
                }
            );
        }

    }

    // se non esiste stroke lo creo
    if (typeof mark.Stroke === 'undefined') {
        if (type === "POINT") {
            var stroke = getCssParameter(mark.Fill, "fill");
            mark.Stroke = {
                CssParameter: [
                    {
                        "_name": "stroke",
                        "__text": stroke
                    },
                    {
                        "_name": "stroke-width",
                        "__text": "0"
                    },
                    {
                        "_name": "stroke-opacity",
                        "__text": "1"
                    }
                ]
            }
        } else {
            mark.Stroke = {
                CssParameter: [
                    {
                        "_name": "stroke",
                        "__text": "#000000"
                    },
                    {
                        "_name": "stroke-width",
                        "__text": "1"
                    }
                ]
            }
        }
    }

    // se esiste ma è vuoto (<Stroke />) lo creo
    if (mark.Stroke === "") {
        if (type === "POINT") {
            mark.Stroke = {
                CssParameter: [
                    {
                        "_name": "stroke",
                        "__text": "#000000"
                    },
                    {
                        "_name": "stroke-width",
                        "__text": "1"
                    },
                    {
                        "_name": "stroke-opacity",
                        "__text": "1"
                    }
                ]
            }
        } else {
            mark.Stroke = {
                CssParameter: [
                    {
                        "_name": "stroke",
                        "__text": "#000000"
                    },
                    {
                        "_name": "stroke-width",
                        "__text": "1"
                    }
                ]
            }
        }
    }

    // se Stroke è impostato ma stroke-width non è impostato lo imposto a default (1)
    var strokeWidth = getCssParameter(mark.Stroke, "stroke-width");
    if (mark.Stroke && !strokeWidth && strokeWidth !== 0) {
        setCssParameter(mark.Stroke, "stroke-width", "1");
    }

};
