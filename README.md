# FunktionLab – modulär version

## Första publiceringen
Ladda upp **hela innehållet** i den här mappen till GitHub-repot (inte zip-filen som sådan). I GitHub: Settings → Pages → Build and deployment → **GitHub Actions**. GitHub Actions bygger automatiskt `index.html` och publicerar sidan.

## Lägg till en funktion
Skapa en mapp under `verktyg/` med `meta.json`, `view.html` och vid behov `logic.js` och `style.css`. När mappen laddas upp till GitHub byggs menyn, sökningen, katalogen och räknaren från metadata. Om en ny funktion kräver flera filer måste alla dessa laddas upp. En enda fil räcker **bara** för en funktion som kan beskrivas i en befintlig modulfil, inte generellt.

## Lokal kontroll
Kör `python build.py` (standardbiblioteket räcker). Öppna `index.html`. Byggscriptet använder bara Python-standardbiblioteket.

## Viktigt
Denna första uppdelning bevarar de befintliga funktionernas HTML/CSS/JS och återbygger en sammanhållen publiceringsfil. Testa alla tio funktioner i webbläsaren innan du ersätter den nuvarande webbplatsen. Koden som skickas till besökaren är fortfarande synlig.
