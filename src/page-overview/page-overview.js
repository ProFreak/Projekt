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
    }

    /**
     * Seite anzeigen. Wird von der App-Klasse aufgerufen.
     */
    async show() {
        // TODO: Seite anzeigen
        //this._app.database.getAllRecords();

        let mainElement = document.getElementById("app-main-are");
        mainElement.innerHTML = "<button id='test-button'>Test: Bitte anklicken...</button>";

        let testButton = document.getElementById("test-button")
        testButton.addEventListener("click", this.onTestButtonClicked);
    }

    onTestButtonClicked(){
        alert("Test bestanden. Schönen Feierabend!");
    }
}
