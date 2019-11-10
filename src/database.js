"use strict";

/**
 * Klasse Database: Kümmert sich um die Datenhaltung der App
 * Datenbankverbindung besteht zu Google Firebase und Google Firestore für Bilder
 */
class Database {
    /**
     * Konstruktor.
     */
    constructor() {
        // Diese Informationen müssen aus der Firebase-Konsole ermittelt
        // werden, indem dort ein neues Projekt mit einer neuen Datenbank
        // angelegt und diese dann mit einer neuen App verknüpft wird.
        firebase.initializeApp({
            apiKey: "AIzaSyBMOahM0XVoUgNQL7fw0TE-JBpIJI2sJyE",
            authDomain: "webseiterezepte-e8e93.firebaseapp.com",
            databaseURL: "https://webseiterezepte-e8e93.firebaseio.com",
            projectId: "webseiterezepte-e8e93",
            storageBucket: "webseiterezepte-e8e93.appspot.com",
            messagingSenderId: "699183372835",
            appId: "1:699183372835:web:06e4817c9f59afc0d56f96",
            measurementId: "G-MFN8VKMJ76"
        });


        // Dieses Objekt dient dem eigentlichen Datenbankzugriff.
        // Dabei können beliebig viele "Collections" angesprochen werden,
        // die in etwa den Tabellen einer klassischen Datenbank entsprechen.
        this._db = firebase.firestore();

        //Klassenvariable für alle Rezepte
        this._recipes = this.getAllRecipes();

        //console.log(getRecipesById("02wWY3Jx08cKAzR1abX5"));
    }

    /*
    *   Gibt alle Rezepte in alphabetischer Reihenfolge sortiert zurück
    */
    getAllRecipes() {
        //Hilfsarray
        let rezeptliste = [];
        //DB-Zugriff
        this._db.collection('rezepte').get().then((snapshot) => {
            snapshot.forEach((doc) => {
                //Dokumente für Hilfsarray erstellen und pushen
                let data = doc.data();
                data["id"] = doc.id;
                rezeptliste.push(data);
            });
            //Hilfsarray alphabetisch sortieren
            rezeptliste.sort((a, b) => this._sortAlphaNum(a.titel, b.titel));
        })
            .catch((err) => { //Fehler bei DB-Zugriff abfangen
                console.log('Error getting documents', err);
            });
        //Klassenvariable aktualisieren und ergebnis zurückgeben
        this._recipes = rezeptliste;
        return rezeptliste;
    }

    /*
    * Gibt alle Rezepte zurück, die als Favorit gekennzeichnet wurden
    */
    getAllFavorites(){
      let rezeptliste = new getAllRecipes();
      let favoritenliste = [];
      for(let i = 0; i < rezeptliste.length(); i++){
        if(rezeptliste[i].favorit){
          favoritenliste.push(rezeptliste[i]);
        }
      }
      favoritenliste.sort((a, b) => this._sortAlphaNum(a.titel, b.titel));
    }

    /*
    *   Fügt ein Rezept in JSON-Form der DB hinzu und generiert automatisch eine ID
    */
    addRecipe(recipe) {
        this._db.collection('rezepte').add(recipe).then(ref => {
            console.log('Added document with ID: ', ref.id);
        });
    }

    /*
    *   Updatet das Dokument mit der entsprechenden ID
    *   update beschreibt ein JSON-Dokument mit den zu aktualisierenden Feldern und deren neuen Werten
    *   !!!Vorsicht bei geschachtelten Feldern! (Felder, deren Wert wieder ein JSON ist.) Hier muss
    *  ' Feld.Unterfeld: Value ' übergeben werden und NICHT ein einfaches JSON
    */
    updateRecipe(id, update) {
        this._db.collection('rezepte').doc(id).update(update);
    }

    /*
    * Rezept durch Namen finden
    */
    getRecipeByName(titel) {
        // "Schleife", die im Array nach dem Titel sucht
        return this._recipes.find(a => {
            // 1:1 Vergleich des Inhalts vom gesuchten Titel
            return a.titel === titel;
        });
    }

    /*
    * Rezept durch ID finden
    */

    getRecipeById(id) {
        let tmp = {
            anleitung: "Das Wichtigste an einer Bolognese ist das sogenannte Soffritto: Dazu einen ordentlichen Klotz Butter (ca. 125 g) und ein wenig Olivenöl (damit die Butter nicht verbrennt) in eine Pfanne geben. Zwiebeln, Möhren und Staudensellerie putzen bzw. schälen, ganz fein hacken und auf möglichst niedriger Flamme langsam (mind. 30 Minuten) darin garen, bis das Gemüse schön glasig und weich geworden ist. Wichtig ist, dass das Gemüse nicht brät, sondern wirklich nur dünstet - also nicht zu heiß werden lassen! Derweil das Rinderhackfleisch so lange in einer weiteren Pfanne scharf braten, bis es anfängt zu karamellisieren. Anschließend mit einem Schuss Weißwein ablöschen, sodass sich alles Angebackene vom Boden lösen lässt. Wichtig: Jetzt je nach Saucenmenge ca.1/4 bis 1/2 Liter Milch hinzugeben, die sich um das Hackfleisch legt und diesem einen ganz milden Geschmack verleiht. Sobald das Fleisch mit Weißwein und Milch aufkocht, die Dosentomaten hinzugeben (die erforderlichen frischen Tomaten sind bei uns leider nicht erhältlich). Am besten geeignet sind hierfür die San Marzano Eiertomaten aus der Gegend von Neapel. Diese haben einen ganz eigenen süßlichen Geschmack, der der Sauce Bolognese und auch einer ordentlichen Sauce Napoli sehr zuträglich ist. Sobald dies alles wieder aufgekocht ist, den Soffritto hinzugeben. Der in Scheiben geschnittene Knoblauch und die zerstampften Peperoncini können jetzt auch mit hinein. Die Bolognese kann dann gar nicht lange genug köcheln. Ideal wären ca. 5 Stunden. Mindestens 2 Stunden sollte sie aber köcheln. Dann ggf. abkühlen lassen und ca. 1 Stunde vor der Mahlzeit langsam aufwärmen (muss aber nicht, man kann sie auch gleich servieren). Tipp: Man kann auch noch ein wenig frisch gehackte Möhre und Staudensellerie nachschieben, um ein wenig mehr Biss an das Gemüse zu kriegen. Mit Meersalz und frisch gemahlenem schwarzem Pfeffer abschmecken. In der Zwischenzeit die Nudeln nach Packungsanweisung bissfest kochen, anschließend abgießen.Die Spaghetti auf Tellern anrichten und die Bolognese darüber verteilen. Heiß servieren. ",
            favorit: false,
            id: "02wWY3Jx08cKAzR1abX5",
            titel: "Spaghetti Bolognese",
            zutaten: [
                "1kg Rinderhackfleisch", "3 Knoblauchzehen", "3 Karotten", "3 Stangen Staudensellerie", "2 Zwiebeln", "600g Dosentomaten", "600g Spaghetti", "125g Butter", "500ml Milch",
                "3 Peperoncini",
                "Meersalz",
                "Pfeffer",
                "Olivenöl",
                "Weißwein"
            ],
            portionen: "5",
            zubereitungszeit: "00:20",
            ruhezeit: "02:30",
            bild: ""
        }

        return tmp;

    }


    /*
    *   Sortiert Strings alphabetisch mit Hilfe von regulären Ausdrücken
    *   Zusammenhängender Text > Selber Text mit Leerzeichen
    *   Großgeschrieben > Kleingeschrieben
    *   Text mit Index > reiner Text
    *
    *  Von StackOverflow entnommen!
    *  Originale Frage von: https://stackoverflow.com/users/317036/solefald
    *  Frage: https://stackoverflow.com/questions/4340227/sort-mixed-alpha-numeric-array
    *  Antwort und unten stehender Code von: https://stackoverflow.com/users/14104/epascarello
    *
    *  @Author: David Tenten
    *  Leerzeichen zu regulären Ausdrücken hinzugefügt
    *  Kommentare
    */
    _sortAlphaNum(a, b) {
        //Regulaere Ausdruecke für Alphabeth (Groß- & Kleinschreibung) und Ziffern/Dezimalzahlen
        let reA = /[^a-zA-Z\s]/g;
        let reN = /[^0-9]/g;

        //Ziffern und Sonderzeichen aus Strings a und b entfernen
        let aA = a.replace(reA, "");
        let bA = b.replace(reA, "");

        //Wenn a und b nach reA identisch sind, dann auf Ziffern reduzieren und vergleichen
        //Ansosnten nur Texte miteinander vergleichen
        //return 0 -> Strings komplett identisch
        //return 1 -> a kommt vor b
        //return -1 -> b vor a
        if (aA === bA) {
            let aN = parseInt(a.replace(reN, ""), 10);
            let bN = parseInt(b.replace(reN, ""), 10);
            return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
            return aA > bA ? 1 : -1;
        }
    }


}
