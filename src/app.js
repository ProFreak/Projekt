"use strict";

/**
 * Klasse App: Steuert die Navigation innerhalb der Anwendung
 *
 * Diese Klasse ist sozusagen die Hauptklasse unserer Anwendung. Sie kümmert
 * sich darum, den richtigen Inhalt zu finden und einzublenden, den der
 * Anwender gerade sehen will, wobei der Inhalt selbst hierfür von anderen
 * Klassen bereitgestellt wird.
 */
class App {

    /**
     * Konstruktor. Im Parameter pages muss eine Liste mit den vorhandenen
     * Seiten der App übergeben werden. Die Liste muss folgendes Format haben:
     *
     *      [
     *          {
     *              url: "^/$"              // Regulärer Ausdruck zur URL
     *              klass: PageOverview     // Klasse zur Darstellung der Seite
     *          }, {
     *              url: "^/Details/(.*)$"  // Regulärer Ausdruck zur URL
     *              klass: PageDetails      // Klasse zur Darstellung der Seite
     *          },
     *          ...
     *      ]
     *
     * @param {String} title Anzuzeigender Name der App
     * @param {List} pages Definition der in der App verfügbaren Seiten
     */
    constructor(title, pages) {
        this._title = title;
        this._pages = pages;
        this._currentPageObject = null;

        // Datenbank-Objekt zum Lesen und Speichern von Daten
        this.database = new Database();
    }

    /**
     * Startmethode der App. Hier werden die Event Listener für das generelle
     * Funktionieren der App registriert. Diese Methode muss daher aus der
     * index.html heraus aufgerufen werden.
     */
    async run() {
        // Globale Event Listener registrieren
        document.querySelector("header nav .toggle-menu a").addEventListener("click", this._toggleHamburgerMenu);
        document.querySelector("header nav .go-back a").addEventListener("click", () => window.history.back());

        // Single Page Router starten und die erste Seite aufrufen
        window.addEventListener("hashchange", () => this._handleRouting());
        await this.database.getAllRecipes();
        this._handleRouting();
    }

    /**
     * Hilfsmethode zum Ein- und Ausblenden des Hamburger-Menüs aus kleinen
     * Bildschirmen. Die Methode wird durch einen Event Handler bei jedem
     * Klick auf das Hamburger-Icon aufgerufen.
     *
     * @param {DOMEvent} event Abgefangenes Click-Event
     */
    _toggleHamburgerMenu(event) {
        // Hamburger-Menu ein- oder ausblenden
        let menu = document.querySelector("header nav .menu-right");
        if (!menu) return;

        if (menu.classList.contains("small-screen-hidden")) {
            menu.classList.remove("small-screen-hidden");
        } else {
            menu.classList.add("small-screen-hidden");
        }

        // Weitere Behandlung des Click-Events unterbinden, da wir hier keine
        // neue Seite anfordern wollen.
        if (event) {
            event.preventDefault();
        }
    }

    /**
     * Diese Methode wertet die aktuelle URL aus und sorgt dafür, dass die
     * dazu passende App-Seite geladen und angezeigt wird. Der Einfachheit
     * halber wird eine sog. Hash-URL verwendet, bei der die aufzurufende
     * Seite nach einem #-Zeichen stehen muss. Zum Beispiel:
     *
     *   http://localhost:8080/index.html#/Detail/1234
     *
     * Hier beschreibt "/Detail/1234" den Teil der URL mit der darzustellenden
     * Seite. Der Vorteil dieser Technik besteht darin, dass ein Link mit einer
     * solchen URL keine neue Seite vom Server lädt, wenn sich der vordere Teil
     * der URL (alles vor dem #-Zeichen) nicht verändert. Stattdessen wird
     * ein "hashchange"-Ereignis generiert, auf das wir hier reagieren können,
     * um die sichtbare Unterseite der App auszutauschen.
     *
     * Auf Basis der History-API und dem "popstate"-Ereignis lässt sich ein
     * noch ausgefeilterer Single Page Router entwickeln, der bei Bedarf auch
     * ohne das #-Zeichen in der URL auskommt. Dies würde jedoch sowohl mehr
     * Quellcode in JavaScript sowie eine spezielle Server-Konfiguration
     * erfordern, so dass der Server bei jeder URL immer die gleiche HTML-Seite
     * an den Browser schickt. Diesen Aufwand sparen wir uns deshalb hier. :-)
     */
    _handleRouting() {
        let pageUrl = location.hash.slice(1);
        let id = "";

        if (pageUrl.length === 0) {
            pageUrl = "/";
        }

        if (pageUrl.split("/")[1] === "Detail") {
            id = pageUrl.split("/")[2];
            window.location.hash = "/";
        }

        if(pageUrl.split("/")[1] === "Favorites" && pageUrl.split("/").length === 3){
            id = pageUrl.split("/")[2];
            window.location.hash = "/Favorites";
        }

        let matches = null;
        let page = this._pages.find(p => matches = pageUrl.match(p.url));

        if (!page) {
            console.error(`Keine Seite zur URL ${pageUrl} gefunden!`);
            return;
        }

        this._currentPageObject = new page.klass(this);
        this._currentPageObject.show(matches);

        if(id !== ""){
            this.setModalContent(id);
        }
    }

    /**
     * Angezeigten Titel der App-Seite setzen. Diese Methode muss von den
     * Page-Klassen aufgerufen werden, um den sichtbaren Titel einer Seite
     * festzulegen. Der Titel wird dann in der Titelzeile des Browsers sowie
     * im Kopfbereich der App angezeigt.
     *
     * Über das optionale Konfigurationsobjekt kann gesteuert werden, ob
     * neben dem Seitentitel ein Zurück-Button eingeblendet wird:
     *
     *      {
     *          isSubPage: true,
     *      }
     *
     * Der Zurück-Button wird nur eingeblendet, wenn isSubPage = true gesetzt
     * wird. Die Idee dahinter ist, dass eine App meistens eine zentrale
     * Startseite hat, von der aus in verschiedene Unterseiten verzweigt werden
     * kann. Jede von der Startseite aus direkt oder indirekt aufgerufene Seite
     * ist daher eine Unterseite mit Zurück-Button. Die Startseite hingegen als
     * Mutter aller Seiten besitzt keinen Zurück-Button.
     *
     * @param {String} title   Anzuzeigender Titel der App-Seite
     * @param {Object} options Detailoptionen zur Steuerung der Anzeige
     */
    setPageTitle(title, options) {
        // Optionen auswerten
        options = options ? options : {};
        let isSubPage = options.isSubPage ? options.isSubPage : false;

        // Titel setzen
        document.querySelectorAll(".page-name").forEach(e => e.textContent = title);
        document.title = `${title} – ${this._title}`;

        // Entscheiden, ob der Zurückbutton angezeigt wird, oder nicht
        if (isSubPage) {
            document.querySelector("header nav .go-back").classList.remove("hidden");
            document.querySelector("header nav .dont-go-back").classList.add("hidden");
        } else {
            document.querySelector("header nav .go-back").classList.add("hidden");
            document.querySelector("header nav .dont-go-back").classList.remove("hidden");
        }
    }

    /**
     * Seitenspezifischen CSS-Code aktivieren. Diese Methode muss von den
     * Page-Klassen aufgerufen werden, um seitenspezifische Stylesheet-Regeln
     * zu aktivieren. Das Stylesheet muss hierfür als String übergeben werden.
     *
     * @param {String} css Seitenspezifischer CSS-Code
     */
    setPageCss(css) {
        document.querySelector("#page-css").innerHTML = css;
    }

    /**
    * Austauschen des Inhalts im Kopfbereich der App. Diese Methode muss
    * von den Page-Klassen aufgerufen werden, um etwas im Kopfbereich der
    * App anzuzeigen. Hierfür muss ein (ggf. dynamisch nachgeladenes)
    * HTML-Element mit dem anzuzeigenden Inhalt übergeben werden.
    *
    * BEACHTE: Nicht das HTML-Element selbst, sondern seine Kindelemente
    * werden in der App angezeigt. Somit werden Probleme vermieden, wenn
    * das nachgeladene Element selbst ein <header> oder <main> ist, für
    * dass in der app.css bereits globale Layoutoptionen definiert sind.
    *
     * @param {HTMLElement} element HTML-Element mit dem anzuzeigenden Inhalt
     */
    setPageHeader(element) {
        let container = document.querySelector("header > .content");
        container.innerHTML = "";

        if (!element) return;
        let len = element.childNodes.length;

        for (var i = 0; i < len; i++) {
            let child = element.childNodes[0];
            element.removeChild(child);
            container.appendChild(child);
        }
    }

    /**
     * Austauschen des Inhalts im Hauptbereich der App. Diese Methode muss
     * von den Page-Klassen aufgerufen werden, um etwas im Hauptbereich der
     * App anzuzeigen. Hierfür muss ein (ggf. dynamisch nachgeladenes)
     * HTML-Element mit dem anzuzeigenden Inhalt übergeben werden.
     *
     * BEACHTE: Nicht das HTML-Element selbst, sondern seine Kindelemente
     * werden in der App angezeigt. Somit werden Probleme vermieden, wenn
     * das nachgeladene Element selbst ein <header> oder <main> ist, für
     * dass in der app.css bereits globale Layoutoptionen definiert sind.
     *
     * @param {HTMLElement} element HTML-Element mit dem anzuzeigenden Inhalt
     */
    setPageContent(element) {
        let container = document.querySelector("#app-main-area");
        container.innerHTML = "";

        if (!element) return;
        let len = element.childNodes.length;

        for (var i = 0; i < len; i++) {
            let child = element.childNodes[0];
            element.removeChild(child);
            container.appendChild(child);
        }
    }

    /*
    *   Setzt den Inhalt für das Modal, abhängig vom aufrufenden Objekt
    *   Trigger: entweder "erstellen" oder id aus DB
    */
    setModalContent(trigger) {
        //Dialogfenster als variablen ablegen
        let modal = document.getElementById("modal");
        let headline = document.getElementById("modal-headline");
        let modalBody = document.getElementById("modal-body");
        let modalFooter = document.getElementById("modal-footer");

        //Sicherstellen, dass Modal leer ist
        if (modal.classList.contains("erstellen")) {
            modal.classList.remove("erstellen");
        }
        this.closeModal();

        //Close-Button
        let close = document.getElementsByClassName("close")[0];

        //Content auswählen, je nachdem ob "erstellen" oder "detail"
        if (trigger == "erstellen") {
            modal.classList.add("erstellen");
            headline.textContent = "Neues Rezept";

            //Modal Content
            let nodeUContent = document.createElement("DIV");
            nodeUContent.setAttribute("class", "modalUpperContent");

            //########################
            //Modal Oben Links - Bild
            let nodeULContent = document.createElement("DIV");
            nodeULContent.setAttribute("class", "modalUpperContentLeft");
            let imgInput = document.createElement("INPUT");
            imgInput.setAttribute("type", "text");
            imgInput.setAttribute("id", "imgInput");
            imgInput.setAttribute("placeholder", "URL / Base64-Bild")
            imgInput.addEventListener("change", this.imageSelection);
            let imgPrev = document.createElement("IMG");
            imgPrev.setAttribute("id", "imgPrev");
            imgPrev.setAttribute("src", "#");
            imgPrev.setAttribute("alt", "Geben sie die Bildquelle oder ein Bild im Base64-Format ein.");

            nodeULContent.appendChild(imgInput);
            nodeULContent.appendChild(imgPrev);

            nodeUContent.appendChild(nodeULContent);

            nodeUContent.appendChild(nodeULContent);

            //#################
            //Modal oben Rechts
            let nodeURContent = document.createElement("DIV");
            nodeURContent.setAttribute("class", "modalUpperContentRight");

            //Eingabe für Titel
            let titleInput = document.createElement("INPUT");
            let titleSpan = document.createElement("SPAN");
            nodeURContent.appendChild(titleSpan);
            titleSpan.appendChild(document.createTextNode("Titel:"));
            titleInput.setAttribute("type", "text");
            titleInput.setAttribute("placeholder", "Titel");
            titleInput.setAttribute("id", "titleInput");
            titleInput.setAttribute("required", "true");
            //titleInput.setAttribute("pattern", "[a-zA-Z]+");
            nodeURContent.appendChild(titleInput);

            //Horizontale Liste für Zeit, Portionen
            let nodeURList = document.createElement("UL");
            nodeURList.setAttribute("class", "modal-right-header");

            let portLi = document.createElement("LI");
            let portionInput = document.createElement("INPUT");
            let portSpan = document.createElement("SPAN");
            portLi.appendChild(portSpan);
            portSpan.appendChild(document.createTextNode("Portionen:"));
            portionInput.setAttribute("type", "text");
            portionInput.setAttribute("required", "true");
            portionInput.setAttribute("placeholder", "Portionen");
            portionInput.setAttribute("id", "portionInput");
            portionInput.setAttribute("type", "number");
            portionInput.setAttribute("min", "1");
            portLi.appendChild(portionInput);
            nodeURList.appendChild(portLi);

            let timeLi = document.createElement("LI");
            let timeInput = document.createElement("INPUT");
            let timeSpan = document.createElement("SPAN");
            timeLi.appendChild(timeSpan);
            timeSpan.appendChild(document.createTextNode("Zubereitungszeit:"));
            timeInput.setAttribute("type", "text");
            timeInput.setAttribute("required", "true");
            timeInput.setAttribute("placeholder", "in min.");
            timeInput.setAttribute("id", "timeInput");
            timeInput.setAttribute("type", "number");
            timeInput.setAttribute("min", "1");
            timeLi.appendChild(timeInput);

            nodeURList.appendChild(timeLi);

            let restLi = document.createElement("LI");
            let restInput = document.createElement("INPUT");
            let restSpan = document.createElement("SPAN");
            restLi.appendChild(restSpan);
            restSpan.appendChild(document.createTextNode("Ruhezeit:"));
            restInput.setAttribute("type", "text");
            restInput.setAttribute("placeholder", "in min.");
            restInput.setAttribute("id", "restInput");
            restInput.setAttribute("type", "number");
            restInput.setAttribute("min", "0");
            restLi.appendChild(restInput);
            nodeURList.appendChild(restLi);

            let favLi = document.createElement("LI");
            let favInput = document.createElement("INPUT");
            let favIcon = document.createElement("I");
            favIcon.setAttribute("class", "icon-heart");
            favIcon.setAttribute("href","heart");
            favIcon.setAttribute("id","setFav");
            favIcon.addEventListener("click", this.setFav);

            let favSpan = document.createElement("SPAN");
            favLi.appendChild(favSpan);
            favSpan.setAttribute("id", "favInputSpan");
            let favText = document.createTextNode("Favorit");
            favLi.appendChild(favIcon);
            favSpan.appendChild(favText);

            nodeURList.appendChild(favLi);

            nodeURContent.appendChild(nodeURList);
            let ingredSpan = document.createElement("SPAN");
            nodeURContent.appendChild(ingredSpan);
            ingredSpan.appendChild(document.createTextNode("Zutaten:"));
            let nodeIngedients = document.createElement("UL");
            nodeIngedients.setAttribute("id", "addIngredList");
            let ingredientLi = document.createElement("LI");
            let ingredientInput = document.createElement("INPUT");
            ingredientInput.setAttribute("type", "text");
            ingredientInput.setAttribute("placeholder", "Zutat");
            //Listener fuer Tastenanschläge im Bereich der Liste
            nodeIngedients.addEventListener('keypress', this._ingredOnKeyDown);

            ingredientLi.appendChild(ingredientInput);
            nodeIngedients.appendChild(ingredientLi);

            nodeURContent.appendChild(nodeIngedients);

            nodeUContent.appendChild(nodeURContent);

            //######################################
            //Unterer Body - Zubereitungsanleitung
            let nodeLContent = document.createElement("DIV");
            nodeLContent.setAttribute("class", "modalLowerContent");
            let manualInput = document.createElement("TEXTAREA");
            manualInput.setAttribute("placeholder", "Zubereitungsanleitung");
            manualInput.setAttribute("id", "manual");
            nodeLContent.appendChild(manualInput);


            modalBody.appendChild(nodeUContent);
            modalBody.appendChild(nodeLContent);

            //######################################
            //Submit Button
            let submitButton = document.createElement("BUTTON");
            let btnText = document.createTextNode("Speichern");
            submitButton.appendChild(btnText);
            submitButton.setAttribute("id", "speichern");
            submitButton.addEventListener("click", this.modalSubmit);
            modalFooter.appendChild(submitButton);

        } else {
            //Detail-Modal definieren
            let recipe = this.database.getRecipeById(trigger);


            //Überschrift
            headline.textContent = recipe.titel;

            //Modal Content
            let nodeUContent = document.createElement("DIV");
            nodeUContent.setAttribute("class", "modalUpperContent");

            //########################
            //Modal Oben Links - Bild
            let nodeULContent = document.createElement("DIV");
            nodeULContent.setAttribute("class", "modalUpperContentLeft");
            let nodeImg = document.createElement("IMG");
            nodeImg.setAttribute("src", recipe.bild);
            nodeImg.setAttribute("alt", "Bild: " + recipe.titel);
            nodeULContent.appendChild(nodeImg);

            //#################
            //Modal oben Rechts
            let nodeURContent = document.createElement("DIV");
            nodeURContent.setAttribute("class", "modalUpperContentRight");

            //Horizontale Liste für Zeit, Portionen
            let nodeURList = document.createElement("UL");
            nodeURList.setAttribute("class", "modal-right-header");

            let portLi = document.createElement("LI");
            let portIco = document.createElement("I");
            portIco.setAttribute("class", "icon-users");
            let portSpan = document.createElement("SPAN");
            let pSpanText = document.createTextNode(recipe.portionen + " Portionen");
            portSpan.appendChild(pSpanText);
            portLi.appendChild(portIco);
            portLi.appendChild(portSpan);
            nodeURList.appendChild(portLi);

            let timeLi = document.createElement("LI");
            let timeIco = document.createElement("I");
            timeIco.setAttribute("class", "icon-hourglass");
            let timeSpan = document.createElement("SPAN");
            let tSpanText = document.createTextNode(recipe.zubereitungszeit + " Stunden");
            timeSpan.appendChild(tSpanText);
            timeLi.appendChild(timeIco);
            timeLi.appendChild(timeSpan);
            nodeURList.appendChild(timeLi);

            //Wenn Rezept Ruhezeit enthält, dann hinzufügen
            if (recipe.ruhezeit !== "" && recipe.ruhezeit !== undefined) {
                let restLi = document.createElement("LI");
                let restIco = document.createElement("I");
                restIco.setAttribute("class", "icon-clock");
                let restSpan = document.createElement("SPAN");
                let rSpanText = document.createTextNode(recipe.ruhezeit + " Stunden");
                restSpan.appendChild(rSpanText);
                restLi.appendChild(restIco);
                restLi.appendChild(restSpan);
                nodeURList.appendChild(restLi);
            }

            //Favoriten-Icon
            let favLi = document.createElement("LI");
            let favIco = document.createElement("I");
            let favSpan = document.createElement("SPAN");
            let fSpanText;

            if (recipe.favorit) {
                favIco.setAttribute("class", "icon-heart-filled");
                fSpanText = document.createTextNode("In den Favoriten");
            } else {
                favIco.setAttribute("class", "icon-heart");
                fSpanText = document.createTextNode("Zu Favoriten hinzufügen");
            }
            favSpan.appendChild(fSpanText);
            favLi.appendChild(favIco);
            favLi.appendChild(favSpan);
            nodeURList.appendChild(favLi);

            //Zutatenliste hinzufügen
            let nodeIngedients = document.createElement("UL");
            recipe.zutaten.forEach(x => {
                let nodeLi = document.createElement("LI");
                let liContent = document.createTextNode(x);
                nodeLi.appendChild(liContent);
                nodeIngedients.appendChild(nodeLi);
            });

            nodeURContent.appendChild(nodeURList);
            nodeURContent.appendChild(nodeIngedients);

            nodeUContent.appendChild(nodeULContent);
            nodeUContent.appendChild(nodeURContent);

            //######################################
            //Unterer Body - Zubereitungsanleitung
            let nodeLContent = document.createElement("DIV");
            nodeLContent.setAttribute("class", "modalLowerContent");
            nodeLContent.appendChild(document.createTextNode(recipe.anleitung));

            modalBody.appendChild(nodeUContent);
            modalBody.appendChild(nodeLContent);

            //#############
        }

        //Dialogfenster öffnen
        modal.style.display = "block";
    }

    /*
    *   Schließt das Modal-Fenster. Fragt den Benutzer bei "Erstellen"-Modal, ob er wirklich Schließen möchte, da eingegebene Daten verloren gehen.
    */
    closeModal() {
        let modal = document.getElementById("modal");
        let modalBody = document.getElementById("modal-body");
        let modalFooter = document.getElementById("modal-footer");

        //Typcheck und Doppelte Schließ-Frage!!!
        if (modal.classList.contains("erstellen")) {
            if (confirm('Sind Sie sicher, dass Sie das erstellen abbrechen wollen? Ihr Rezept geht möglicherweise verloren!')) {
                //DB Handling um neues Rezept anzulegen!
                modal.style.display = "none";

                while (modalBody.firstChild) {
                    modalBody.removeChild(modalBody.firstChild);
                }
                modalBody.innerHTML = "";
                modalFooter.innerHTML = "";
            }
        } else {
            modal.style.display = "none";

            while (modalBody.childNodes.length > 0) {
                modalBody.removeChild(modalBody.firstChild);
            }

            modalBody.innerHTML = "";
            modalFooter.innerHTML = "";
        }
    }

    imageSelection(event) {
        if (this.value !== "") {
            document.getElementById("imgPrev").setAttribute("src", this.value);
        }
    }

    modalDragOver(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    _ingredOnKeyDown(e) {
        if (this.childNodes[this.childNodes.length - 1].childNodes[0].value !== "") {
            if (e.keyCode === 13) {
            } else {
                for (let i = 0; i < this.childNodes.length; i++) {
                    if (this.childNodes[i].childNodes[0].value.trim() === "") {
                        this.removeChild(this.childNodes[i]);
                    }
                }

                let ingredientLi = document.createElement("LI");
                let ingredientInput = document.createElement("INPUT");
                ingredientInput.setAttribute("type", "text");
                ingredientInput.setAttribute("placeholder", "Zutat");

                ingredientLi.appendChild(ingredientInput);
                this.appendChild(ingredientLi);
            }
        } else {
            if (e.keyCode === 13) {
                this.childNodes[this.childNodes.length - 1].childNodes[0].focus();
            }
        }
    }


    setFav(){

        let setFavIcon = document.getElementById("setFav");



        if(setFavIcon.classList.contains("icon-heart")){
            setFavIcon.setAttribute("class", "icon-heart-filled");


        }
        else if(setFavIcon.classList.contains("icon-heart-filled")) {
            setFavIcon.setAttribute("class", "icon-heart");
        }


    }

    modalSubmit(e) {
        e.preventDefault();

        let titleInput = document.getElementById("titleInput");
        let portionInput = document.getElementById("portionInput");
        let timeInput = document.getElementById("timeInput");
        let restInput =  document.getElementById("restInput");
        let manualInput = document.getElementById("manual");
        let pictureInput = document.getElementById("imgInput");
        let favorit = document.getElementById("setFav");
        let ingredList = document.getElementById("addIngredList");
        let check = true;
        
        let time = "";
        let restTime = "";

        if(titleInput.value === ""){
          titleInput.classList.add("redField");

          check = false;
        }
        if (portionInput.value === ""){

          portionInput.classList.add("redField");
          check = false;
        }

        if (timeInput.value === "") {

          timeInput.classList.add("redField");
          check = false;
        } else {
            let h = Math.round(parseInt(timeInput.value) / 60);
            let m = Math.round(parseInt(timeInput.value) % 60);
            if(h < 10){
                time += "0"+h;
            } else {
                time += h;
            }
            time += ":";
            if(m < 10){
                time += "0"+m;
            } else {
                time += m;
            }
        }
        if(ingredList.childNodes.length < 2){

            ingredList.classList.add("redField");
          check = false;
        }
        if(manualInput.value === ""){

            manualInput.classList.add("redField");
          check = false;
        }
        if(restInput.value !== ""){
            let h = Math.round(parseInt(restInput.value) / 60);
            let m = Math.round(parseInt(restInput.value) % 60);
            if(h < 10){
                restTime += "0"+h;
            } else {
                restTime += h;
            }
            restTime += ":";
            if(m < 10){
                restTime += "0"+m;
            } else {
                restTime += m;
            }
        }

        if(check === true){
          // alle Eingaben korrekt, weshalb das erstellte Rezept gespeichert werden kann
          let ingredients = [];

          if(favorit.classList.contains("icon-heart")){
              favorit = "false";
          } else {
              favorit = "true";
          }
          
          ingredList.childNodes.forEach(a => {  
              if(a.firstChild.value !== ""){            
                ingredients.push(a.firstChild.value);
              }
          });   

          let recipe = '{"titel":"' + titleInput.value + '", "ruhezeit":"' + restTime + '", "anleitung":"' + manualInput.value + '", "bild":"' + pictureInput.value + '", "favorit":"' + favorit + '", "portionen":"' + portionInput.value + '", "zubereitungszeit":"' + time + '", "zutaten": ["' + ingredients + '"]}';
            document.getElementById("hiddenSubmitButton").title = recipe;     
          document.getElementById("hiddenSubmitButton").click();
        } else {
          let portSpan = document.createElement("SPAN");
          portSpan.appendChild(document.createTextNode("Bitte überprüfen Sie Ihre Eingaben!"));

          document.getElementById("modal-footer").appendChild(portSpan);
        }

    }

    /*
    *   Lädt die Liste der Rezepte aus der Datenbank erneut.
    */
    async refresh() {
        return await this.database.getAllRecipes();
    }
}
