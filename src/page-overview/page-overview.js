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

    _showSlide(n) {
      let i;
      let slides = document.getElementsByClassName("mySlides");
      let dots = document.getElementsByClassName("dot");

      if (n > slides.length) {
          this._slideIndex = 1;
      } else  if (n < 1) {
          this._slideIndex = slides.length;
      } else {
          this._slideIndex = n;
      }

      for (i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";
      }

      for (i = 0; i < dots.length; i++) {
          dots[i].className = dots[i].className.replace(" active", "");
      }

      slides[this._slideIndex-1].style.display = "block";
      dots[this._slideIndex-1].className += " active";
    }

    _plusSlides(n) {
        this._showSlide(this._slideIndex += n);
    }
}
