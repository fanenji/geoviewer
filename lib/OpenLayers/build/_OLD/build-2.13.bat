@echo off
REM -- build a partire dalla versione 2.13 ----

cd E:\Tomcat6\webapps\ROOT\geoviewer\lib\OpenLayers\build

REM -- build versione debug ------------------
build.py E:\Tomcat6\webapps\ROOT\geoviewer\lib\OpenLayers\build\custom.cfg -c none
copy OpenLayers.js E:\Tomcat6\webapps\ROOT\geoviewer\lib\OpenLayers\OpenLayers.js

REM -- build versione esercizio --------------------
build.py E:\Tomcat6\webapps\ROOT\geoviewer\lib\OpenLayers\build\custom.cfg
copy OpenLayers.js I:\webapps\ROOT\geoviewer\lib\OpenLayers\OpenLayers.js



