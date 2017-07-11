'''
Created on 04/apr/2012

@author: parodi

Comprime e ottimizza tutti i png all'interno di una directory in maniera ricorsiva

Parametri:  Directory da elaborare

Esempio: pgnCompress.py E:\progetti\sfondi\MOS_CARG25_228

'''

import os,shutil,sys

PNGNQ_EXE = "pngnqi.exe"
PNGCRUSH_EXE = "pngcrush.exe"

if len(sys.argv) < 2:
    print "Indicare una directory da elaborare. Es: pgnCompress.py E:\progetti\sfondi\prova"
    exit()
 
inputDir = sys.argv[1]

if os.path.isdir(inputDir):
    listFile = []
    listFile2 = []
    listFile3 = []

    print "INIZIO ELABORAZIONE"

    for root, subFolder, files in os.walk(inputDir):
        for filename in files:
            if filename[-3:] == "png":
                listFile.append(os.path.join(root, filename))
                filename2 = filename[:-4] + "-nq8" + filename[-4:]
                listFile2.append(os.path.join(root, filename2))
                filename3 = filename[:-4] + "-crush" + filename[-4:]
                listFile3.append(os.path.join(root, filename3))
            
    i = 0
    for pngPath in listFile:
        png2Path = listFile2[i]
        png3Path = listFile3[i]
        print pngPath
        print png2Path
        print png3Path
        pngnqCmd = PNGNQ_EXE + " -n 256 " + pngPath
        pngcrushCmd = PNGCRUSH_EXE + " " + png2Path + " " + png3Path 
        os.system(pngnqCmd)
        os.system(pngcrushCmd)
        os.remove(png2Path)
        shutil.move(png3Path,pngPath)
        i = i + 1

    print "FINE ELABORAZIONE"
else:
    print "Directory non esistente"