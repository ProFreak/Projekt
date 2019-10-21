class App{

    // Funktioniert so nicht in JavaScript!
    //database = new Database();
    // halloString = "Hallo, Welt!";
    constructor(title, pages){
        this._title = title;
        this._pages = pages;
        this._currentPageObject = null;
        this.database = new Database();

    }




    run(){
        //Klick auf das Hamburger-Icon abfangen
        let menuIcon = document.querySelector("header nav .toggle-menu a")

        menuIcon.addEventListener("click", this.toggleHamburgerMenu);
        }

    toggleHamburgerMenu(){
        alert("Der Hambuerger sagt Danke")
        let menu= document.querySelector("header nav .menu-right");

        if(menu.classList.contains("small-screen-hidden")){
            // Menü war unsichtbar, deshalb jetzt anzeigen
            menu.classList.remove("small-screen-hidden")
        } else{
            // Menü war sichtbar, deshalb jetzt ausblenden
            menu.classList.add("small-screen-hidden")
        }

        //Inhalt der ersten Seite darzustellenden
        this._handleRouting();
        window.addEventListener("hashchange", () => this._handleRouting())
    }
    /**
    * Herzstück unseres kleinen Single Page Routers. Hier wird ein Teil in der
    * URL nach dem Hashtag ausgewertet, um den darzustellenden Teilbereich
    * der App zu ermitteln. Hierfür gehen wir durch die Liste this._pages
    * mit den RegEx-Parametern und suchen darin den ersten Treffer,
    * der auf die aktuelle URL passt. Von diesem erzeugen wir dann ein Objekt
    * der dazugehörigen Page-Klasse und rufen ihre show()-Methode auf.
    */
    _handleRouting(){
        // Aktuelle URL ermitteln (nur der Teil nach dem #)
        let pageUrl = location.hash.slice(1);
        let (pageUrl.length === 0 pageUrl="/");

        // Zur URL passende Seite ermitteln (anhand RegEx)
        let page = this._pages.find(function (p => pageUrl.match(p.url) );

        if(!page){
            console.error("Keine Seite zur URL ${pageUrl} gefunden!");
            return
        }

        // Objekt der gefundenen Seite erzeugen und show()-Methode aufrufen um
        // die seite anzuzeigen


        });

    }
}
