"use strict";

/**
 * Klasse PageOverview: Stellt die Startseite der App zur Verfügung
 */
class PageOverview {
    /**
     * Konstruktor
     * @param {App} app Zentrale Instanz der App-Klasse
     */
    constructor(app) {
        this._app = app;
        this._slideIndex = 1;
    }

    /**
     * Seite anzeigen. Wird von der App-Klasse aufgerufen.
     */
    async show() {
        // Anzuzeigenden Seiteninhalt nachladen
        let html = await fetch("page-overview/page-overview.html");
        let css = await fetch("page-overview/page-overview.css");

        if (html.ok && css.ok) {
            html = await html.text();
            css = await css.text();
        } else {
            console.error("Fehler beim Laden des HTML/CSS-Inhalts");
            return;
        }
        // Seite zur Anzeige bringen
        let pageDom = document.createElement("div");
        pageDom.innerHTML = html;

        let prevLink = pageDom.querySelector(".prev");
        prevLink.addEventListener("click", () => this._plusSlides(-1));

        let nextLink = pageDom.querySelector(".next");
        nextLink.addEventListener("click", () => this._plusSlides(1));

        let dotLinks = pageDom.querySelectorAll(".dot");

        for (let i = 0; i < dotLinks.length; i++) {
            let dotLink = dotLinks[i];
            dotLink.addEventListener("click", () => this._showSlide(i + 1));
        }

        this._app.setPageTitle("Mein Rezeptbuch");
        this._app.setPageCss(css);
        this._app.setPageHeader(pageDom.querySelector("header"));
        this._app.setPageContent(pageDom.querySelector("main"));

        this._showSlide(this._slideIndex);
    }

    /**
     * Hilfsmethode, welche den HTML-Code zur Darstellung der Kacheln auf
     * der Startseite erzeugt.
     *
     * @param {HTMLElement} pageDom Wurzelelement der eingelesenen HTML-Datei
     * mit den HTML-Templates dieser Seite.
     */
    _renderBoatTiles(pageDom) {
        let mainElement = pageDom.querySelector("main");
        let templateElement = pageDom.querySelector("#template-tile");
        
        this._app.database._recipes.forEach(recipe => {
            let html = templateElement.innerHTML;
            html = html.replace("{HREF}", `#/Detail/${recipe.id}`);
            html = html.replace("{IMG}", recipe.bild);
            html = html.replace("{NAME}", recipe.titel);
            html = html.replace("{PORTIONS}", recipe.portionen);
            html = html.replace("{TIME}", recipe.zubereitungszeit);
            
            mainElement.innerHTML += html;
        });
        
    }

    _plusSlides(n) {
        this._showSlide(this._slideIndex += n);
    }
}
