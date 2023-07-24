//___________________________________________________________________________________________
import express from "express";
//___________________________________________________________________________________________
const { pool } = require("./db-init");
const queryFile = require("./db/queries");
require("dotenv").config();
const app = express();
const port = 3000;
//___________________________________________________________________________________________
app.use(express.json()); // Middleware qui permet de lire l'objet request.body
app.use(express.urlencoded({ extended: true })); // Middleware pour remplir le requset. body avec url encodad et NON JSON

//___GET ALL FILMS __________________________________________________________________________

app.get("/films", (req, res) => {
  pool.connect((error, client, release) => {
    if (error) {
      console.error("Erreur de connexion à la base de données :", error.stack);
      res.status(500).json({
        success: false,
        message: "Erreur de connexion à la base de données",
      });
      return;
    }

    queryFile.getAllFilmsQuery(client, (error, data) => {
      release();

      if (error) {
        console.error(
          "Erreur lors de la récupération des films :",
          error.stack
        );
        res.status(500).json({
          success: false,
          message: "Erreur lors de la récupération des films",
        });
      } else {
        res.json(data.rows);
      }
    });
  });
});

//_____ADD NEW FILM ________________________________________________________________________

app.post("/films", (req, res) => {
  const newData = [
    req.body.title,
    req.body.year,
    req.body.miniature,
    req.body.video_location,
    req.body.actors,
    req.body.synopsis,
    req.body.genre,
    req.body.director,
  ];

  pool.connect((error, client, release) => {
    if (error) {
      console.error("Erreur de connexion à la base de données :", error.stack);
      res.status(500).json({
        success: false,
        message: "Erreur de connexion à la base de données",
      });
      return;
    }

    queryFile.createFilmQuery(client, newData, (error, data) => {
      release();

      if (error) {
        console.error("Erreur lors de l'ajout du film :", error.stack);
        res
          .status(500)
          .json({ success: false, message: "Erreur lors de l'ajout du film" });
      } else {
        res.json({ message: "Film ajouté avec succès" });
      }
    });
  });
});

//____DELETE FILM BY ID __________________________________________________________

app.delete("/films/:id", (req, res) => {
  let id = req.params.id;

  pool.connect((error, client, release) => {
    if (error) {
      console.error("Erreur de connexion à la base de données :", error.stack);
      res.status(500).json({
        success: false,
        message: "Erreur de connexion à la base de données",
      });
      return;
    }

    queryFile.deleteFilmQuery(client, [id], (error, data) => {
      release();

      if (error) {
        console.error("Erreur lors de la suppression du film :", error.stack);
        res.status(500).json({
          success: false,
          message: "Erreur lors de la suppression du film",
        });
      } else {
        res.json({ message: "Film supprimé avec succès" });
      }
    });
  });
});

//____UPDATE FILM BY ID VERSION 1_____________________________________________________________

app.put("/films/:id", (req, res) => {
  const id = req.params.id;
  const {
    title,
    year,
    miniature,
    video_location,
    actors,
    synopsis,
    genre,
    director,
  } = req.body;

  pool.connect((error, client, release) => {
    if (error) {
      console.error("Erreur de connexion à la base de données :", error.stack);
      res.status(500).json({
        success: false,
        message: "Erreur de connexion à la base de données",
      });
      return;
    }

    queryFile.updateFilmQuery(
      client,
      [
        title,
        year,
        miniature,
        video_location,
        actors,
        synopsis,
        genre,
        director,
        id,
      ],
      (error, results) => {
        release();

        if (error) {
          console.error("Erreur lors de la mise à jour du film :", error.stack);
          res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour du film",
          });
        } else if (results.rowCount === 0) {
          res.status(404).json({ success: false, message: "Film non trouvé" });
        } else {
          res.json({ message: "Film mis à jour avec succès" });
        }
      }
    );
  });
});

//___________________________________________________________________________________________
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
//____________________________________________________________________________________________
//____________________________________________________________________________________________
