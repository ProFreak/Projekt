"use strict";

/**
 * Klasse PageNotFound: Stellt eine Defaultseite zur Verfügung, die immer
 * dann angezeigt wird, wenn der Anwender eine unbekannte URL aufruft.
 */
class PageNotFound {
    /**
     * Konstruktor
     * @param {App} app Zentrale Instanz der App-Klasse
     */
    constructor(app) {
        this._app = app;
    }

    /**
     * Seite anzeigen. Wird von der App-Klasse aufgerufen.
     */
    async show() {
        // Anzuzeigenden Seiteninhalt nachladen
        let html = await fetch("page-not-found/page-not-found.html");
        let css = await fetch("page-not-found/page-not-found.css");

        if (html.ok && css.ok) {
            html = await html.text();
            css = await css.text();
        } else {
<<<<<<< HEAD
            console.error("Fehler beim Laden des HTML/CSS-Inhalts")
=======
            console.error("Fehler beim Laden des HTML/CSS-Inhalts");
>>>>>>> c39e66b586c77b8f9dfb0dc02d1d7ffcdd601cbc
            return;
        }

        // Seite zur Anzeige bringen
        let pageDom = document.createElement("div");
        pageDom.innerHTML = html;

<<<<<<< HEAD
        this._app.setPageTitle("Seite nicht gefunden");
=======
        this._app.setPageTitle("Seite nicht gefunden", {isSubPage: true});
>>>>>>> c39e66b586c77b8f9dfb0dc02d1d7ffcdd601cbc
        this._app.setPageCss(css);
        this._app.setPageHeader(pageDom.querySelector("header"));
        this._app.setPageContent(pageDom.querySelector("main"));
    }
}
