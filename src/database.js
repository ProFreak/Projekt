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
    *   !!!Vorsicht bei geschachtelten Feldern! (Felder, deren Wert wieder ein JSON ist.) Hier muss' Feld.Unterfeld: Value ' übergeben werden und NICHT ein einfaches JSON
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
            anleitung: "Nudeln kochen und die Soße zubereiten",
            favorit: true,
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
