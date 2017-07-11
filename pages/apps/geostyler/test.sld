<StyledLayerDescriptor version="1.0.0"
                       xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
                       xmlns="http://www.opengis.net/sld"
                       xmlns:ogc="http://www.opengis.net/ogc"
                       xmlns:xlink="http://www.w3.org/1999/xlink"
                       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <NamedLayer>
        <Name>Polygon</Name>
        <UserStyle>
            <Title>SLD Cook Book: Polygon with styled label</Title>
            <FeatureTypeStyle>
                <Rule>
                    <!-- POLYGON SimpleFill -->
                    <PolygonSymbolizer>
                        <Fill>
                            <CssParameter name="fill">#40FF40</CssParameter>
                            <CssParameter name="fill-opacity">0.5</CssParameter>
                        </Fill>
                        <Stroke>
                            <CssParameter name="stroke">#FFFFFF</CssParameter>
                            <CssParameter name="stroke-width">2</CssParameter>
                        </Stroke>
                    </PolygonSymbolizer>

                    <!-- POLYGON GraphicFill/ExternalGraphic -->
                    <PolygonSymbolizer>
                        <Fill>
                            <GraphicFill>
                                <Graphic>
                                    <ExternalGraphic>
                                        <OnlineResource
                                                xlink:type="simple"
                                                xlink:href="colorblocks.png" />
                                        <Format>image/png</Format>
                                    </ExternalGraphic>
                                    <Size>93</Size>
                                </Graphic>
                            </GraphicFill>
                        </Fill>
                        <Stroke>
                            <CssParameter name="stroke">#FFFFFF</CssParameter>
                            <CssParameter name="stroke-width">2</CssParameter>
                        </Stroke>
                    </PolygonSymbolizer>

                    <!-- POLYGON GraphicFill/Mark -->
                    <PolygonSymbolizer>
                        <Fill>
                            <GraphicFill>
                                <Graphic>
                                    <Mark>
                                        <WellKnownName>shape://times</WellKnownName>
                                        <Stroke>
                                            <CssParameter name="stroke">#990099</CssParameter>
                                            <CssParameter name="stroke-width">1</CssParameter>
                                        </Stroke>
                                    </Mark>
                                    <Size>16</Size>
                                </Graphic>
                            </GraphicFill>
                        </Fill>
                        <Stroke>
                            <CssParameter name="stroke">#FFFFFF</CssParameter>
                            <CssParameter name="stroke-width">2</CssParameter>
                        </Stroke>
                    </PolygonSymbolizer>

                    <!-- POLYGON GraphicFill/TTF -->
                    <PolygonSymbolizer>
                        <Fill>
                            <GraphicFill>
                                <Graphic>
                                    <Mark>
                                        <WellKnownName>ttf://Webdings#0x0064</WellKnownName>
                                        <Fill>
                                            <CssParameter name="fill">#AAAAAA</CssParameter>
                                        </Fill>
                                        <Stroke/>
                                    </Mark>
                                    <Size>16</Size>
                                </Graphic>
                            </GraphicFill>
                        </Fill>
                        <Stroke>
                            <CssParameter name="stroke">#FFFFFF</CssParameter>
                            <CssParameter name="stroke-width">2</CssParameter>
                        </Stroke>
                    </PolygonSymbolizer>

                    <!-- LINE DashArray -->
                    <LineSymbolizer>
                        <Stroke>
                            <CssParameter name="stroke">#0000FF</CssParameter>
                            <CssParameter name="stroke-width">3</CssParameter>
                            <CssParameter name="stroke-dasharray">5 2</CssParameter>
                        </Stroke>
                    </LineSymbolizer>

                    <!-- LINE GraphicStroke -->
                    <LineSymbolizer>
                        <Stroke>
                            <GraphicStroke>
                                <Graphic>
                                    <Mark>
                                        <WellKnownName>shape://vertline</WellKnownName>
                                        <Stroke>
                                            <CssParameter name="stroke">#333333</CssParameter>
                                            <CssParameter name="stroke-width">1</CssParameter>
                                        </Stroke>
                                    </Mark>
                                    <Size>12</Size>
                                </Graphic>
                            </GraphicStroke>
                        </Stroke>
                    </LineSymbolizer>

                    <!-- POINT WKN-->
                    <PointSymbolizer>
                        <Graphic>
                            <Mark>
                                <WellKnownName>square</WellKnownName>
                                <Fill>
                                    <CssParameter name="fill">#FF0000</CssParameter>
                                    <CssParameter name="fill-opacity">0.2</CssParameter>
                                </Fill>
                                <Stroke>
                                    <CssParameter name="stroke">#000000</CssParameter>
                                    <CssParameter name="stroke-width">2</CssParameter>
                                </Stroke>
                            </Mark>
                            <Size>12</Size>
                            <Rotation>45</Rotation>
                        </Graphic>
                    </PointSymbolizer>


                    <!-- POINT ExternalGraphics-->
                    <PointSymbolizer>
                        <Graphic>
                            <ExternalGraphic>
                                <OnlineResource
                                        xlink:type="simple"
                                        xlink:href="smileyface.png" />
                                <Format>image/png</Format>
                            </ExternalGraphic>
                            <Size>32</Size>
                        </Graphic>
                    </PointSymbolizer>


                    <!-- TEXT -->
                    <TextSymbolizer>
                        <Label>
                            <ogc:PropertyName>name</ogc:PropertyName>
                        </Label>
                        <Font>
                            <CssParameter name="font-family">Arial</CssParameter>
                            <CssParameter name="font-size">11</CssParameter>
                            <CssParameter name="font-weight">bold</CssParameter>
                            <CssParameter name="font-style">normal</CssParameter>
                        </Font>
                        <Fill>
                            <CssParameter name="fill">#000000</CssParameter>
                            <CssParameter name="fill-opacity">0.5</CssParameter>
                        </Fill>
                        <Graphic>
                            <Mark>
                                <WellKnownName>square</WellKnownName>
                                <Fill>
                                    <CssParameter name="fill">#59BF34</CssParameter>
                                    <CssParameter name="fill-opacity">0.8</CssParameter>
                                </Fill>
                                <Stroke>
                                    <CssParameter name="stroke">#2D6917</CssParameter>
                                </Stroke>
                            </Mark>
                            <Size>24</Size>
                        </Graphic>
                        <Priority>
                            <ogc:PropertyName>population</ogc:PropertyName>
                        </Priority>
                        <VendorOption name="autoWrap">60</VendorOption>
                        <VendorOption name="followLine">true</VendorOption>
                        <VendorOption name="repeat">300</VendorOption>
                        <VendorOption name="maxDisplacement">150</VendorOption>
                        <VendorOption name="forceLeftToRight">false</VendorOption>
                        <VendorOption name="graphic-margin">3</VendorOption>
                        <VendorOption name="graphic-resize">stretch</VendorOption>
                        <VendorOption name="group">yes</VendorOption>
                        <VendorOption name="spaceAround">10</VendorOption>
                        <VendorOption name="labelAllGroup">true</VendorOption>
                        <VendorOption name="maxAngleDelta">15</VendorOption>
                        <VendorOption name="conflictResolution">false</VendorOption>
                        <VendorOption name="goodnessOfFit">0.3</VendorOption>
                        <VendorOption name="polygonAlign">mbr</VendorOption>
                    </TextSymbolizer>

                </Rule>
            </FeatureTypeStyle>
        </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>