<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xsl:output version="1.0" encoding="UTF-8" indent="no" omit-xml-declaration="no" media-type="text/html"/>
    <xsl:template match="/">
        <html>
            <head>
                <title>Interfaccia Cartografica Web</title>
            </head>
            <link rel="stylesheet" href="info.css" type="text/css"/>
            <body>
                <p/>
                <br/>
                <center>
                    <table border="0" width="90%" cellpadding="2">
                        <tr>
                            <td class="sfondoBianco">
                                <center>
                                    <!-- - - - - INTESTAZIONE - - - - - -->
                                    <table width="92%">
                                        <tr>
                                            <td class="fogliaBT2" width="10%">
                                                <img src="img/logo_reg.gif" border="0" vspace="15"/>
                                            </td>
                                            <td id="Titolo" class="fogliaBT2">
                                                <!-- TITOLO -->
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- - - - - CAMPI DELLA TAVOLA - - - - - -->
                                    <table id="tableData" width="92%">
                                        <tr>
                                            <th colspan="2" class="fogliaT">
                                                <font color="#FFFFFF" size="-1">Risultato della Selezione</font>
                                            </th>
                                        </tr>
                                        <xsl:for-each select="msGMLOutput/*/*/*">

                                            <xsl:choose>
                                                <xsl:when
                                                        test="substring(name(.),1,4) != 'gml:' and name(.) != 'VALORE_NUM'">
                                                    <tr>
                                                        <td class="fogliaL">
                                                            <xsl:value-of select="name(.)"/>
                                                        </td>
                                                        <td class="foglia">
                                                            <xsl:value-of select="."/>
                                                        </td>
                                                    </tr>
                                                </xsl:when>
                                            </xsl:choose>

                                        </xsl:for-each>
                                    </table>
                                    <!-- - - - - FINE CAMPI DELLA TAVOLA - - - - - -->
                                    <br/>
                                    <table width="92%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td id="linkGestionale" colspan="2">
                                                <!-- LINK AD UN EVENTUALE APPLICAZIONE ESTERNA -->
                                            </td>
                                        </tr>
                                        <tr>
                                        </tr>
                                    </table>
                                    <br/>
                                </center>
                            </td>
                        </tr>
                    </table>
                </center>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
