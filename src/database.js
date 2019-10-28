"use strict";

/**
 * Klasse Database: Kümmert sich um die Datenhaltung der App
 *
 * Diese Klasse beinhaltet alle Datensätze der App. Entgegen dem Namen handelt
 * es sich nicht wirklich um eine Datenbank, da sie lediglich ein paar statische
 * Testdaten enthält. Ausgefeilte Methoden zum Durchsuchen, Ändern oder Löschen
 * der Daten fehlen komplett, könnten aber in einer echten Anwendung relativ
 * einfach hinzugefügt werden.
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
         this._rezepte = this._db.collection("rezepte");
     }

     async selectAllRezepte() {
      let result = await this._rezepte.orderBy("title").get();
      let rezeptliste = [];

      result.forEach(entry => {
          let rezept = entry.data();
          rezeptliste.push(rezept);
      });

      return rezeptliste;
  }
}
