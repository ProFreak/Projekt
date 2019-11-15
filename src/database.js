"use strict";

/**
 * Klasse Database: Kümmert sich um die Datenhaltung der App
 * Datenbankverbindung besteht zu Google Firebase und Google Firestore für Bilder
 */
class Database{

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
        this._recipes = [];
        this._recipes = this.getAllRecipes();

        //console.log(getRecipesById("02wWY3Jx08cKAzR1abX5"));
    }

    /*
    *   Gibt alle Rezepte in alphabetischer Reihenfolge sortiert zurück
    */
    async getAllRecipes() {
        //Hilfsarray
        let rezeptliste = [];
        //DB-Zugriff
        await this._db.collection('rezepte').get().then((snapshot) => {
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
    *   für genauere Infos siehe: https://firebase.google.com/docs/database/web/read-and-write
    */
    updateRecipe(id, update) {
        this._db.collection('rezepte').doc(id).update(update);
    }

    /*
    *   Codiert das eigebene Bild in base64, damit es in der DB gespeichert werden kann.
    */
    encodePicture(pic){
        return readFileSync(pic, {encoding: 'base64'});
    }

    /*
    * Rezept durch Namen finden
    */
    getRecipeByName(titel) {
        let tmp = null;
        
        //Rezeptliste nach passendem Rezept mit übereinstimmendem Titel durchsuchen
        for(let i = 0; i < this._recipes.length; i++){
            if(this._recipes[i].titel == titel){
                tmp = this._recipes[i];
                break;
            }
        }

        return tmp;
    }

    /*
    * Rezept durch ID finden
    */
    getRecipeById(id) {
        let tmp = null;
        
        //Rezeptliste nach passendem Rezept mit der korrekten ID durchsuchen
        for(let i = 0; i < this._recipes.length; i++){
            if(this._recipes[i].id == id){
                tmp = this._recipes[i];
                break;
            }
        }

        return tmp;
    }

    getPictureByName(name) {
        return this._picRef.child(name).getDownloadURL().then(function (url) {
            return url;
        });
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
