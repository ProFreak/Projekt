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

        if(window.location.hash === "#/Favorites"){
        this._renderFavorites(pageDom);
        let herzIcon = document.getElementById("menu_heart");
        herzIcon.classList.remove("icon-heart");
        herzIcon.classList.add("icon-heart-filled");
      } else {
        this._renderRecipes(pageDom);
        let herzIcon = document.getElementById("menu_heart");
        herzIcon.classList.remove("icon-heart-filled");
        herzIcon.classList.add("icon-heart");
      }      

        this._app.setPageTitle("Mein Rezeptbuch");
        this._app.setPageCss(css);
        this._app.setPageHeader(pageDom.querySelector("header"));
        this._app.setPageContent(pageDom.querySelector("main"));
    }

    /**
     * Hilfsmethode, welche den HTML-Code zur Darstellung der Kacheln auf
     * der Startseite erzeugt.
     *
     * @param {HTMLElement} pageDom Wurzelelement der eingelesenen HTML-Datei
     * mit den HTML-Templates dieser Seite.
     */
    _renderRecipes(pageDom) {
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

    _renderFavorites(pageDom) {
        let mainElement = pageDom.querySelector("main");
        let templateElement = pageDom.querySelector("#template-tile");

        this._app.database.getAllFavorites().forEach(recipe => {
            let html = templateElement.innerHTML;
            html = html.replace("{HREF}", `#/Detail/${recipe.id}`);
            html = html.replace("{IMG}", recipe.bild);
            html = html.replace("{NAME}", recipe.titel);
            html = html.replace("{PORTIONS}", recipe.portionen);
            html = html.replace("{TIME}", recipe.zubereitungszeit);

            mainElement.innerHTML += html;
        });

    }
}
