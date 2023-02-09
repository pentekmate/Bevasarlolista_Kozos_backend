const express = require('express')
const mysql = require('mysql')
const app = express()
const port = 3000
const cors = require('cors')
const bcrypt = require('bcryptjs');
var connection

function kapcsolat() {
  connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bevasarlolista'
  })
}

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})
// Összes listalekérése
app.get('/listak', (req, res) => {
  kapcsolat()

  connection.query('SELECT * from listak', (err, rows, fields) => {
    if (err) throw err


    res.send(rows)
  })
  connection.end()
})
//Összes felhasználó adatainak lekérése

//Login.jsben használt, belépésnél összehasonlítja az adatokat
app.post('/felhasznalok', (req, res) => {
  kapcsolat()

  connection.query('SELECT * FROM `felhasznalo` WHERE `felhasznalo_nev` ="' + req.body.bevitel1 + '" ;', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      if (rows.length > 0) {
        const JelszoVissza = bcrypt.compare(req.body.bevitel2, rows[0].felhasznalo_jelszo)
          .then((talalt) => {
            if (talalt) {
              res.send(true)
            }
            else {
              res.send(false)
            }
          })
      }
      else {
        res.send(false)
      }
    }

  })
  connection.end()
})

//Regisztrációs adatokat visz fel az adatbázisba

//Regisztracio.jsben használom
app.post('/regisztracio', async (req, res) => {
  kapcsolat()

  const jelszo = await bcrypt.hash(req.body.bevitel2, 10)
  connection.query('INSERT INTO `felhasznalo` VALUES (NULL, "' + req.body.bevitel1 + '" ,"' + jelszo + '",CURDATE());', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})
//A Lista_input.jsben lévő 2tömb (data,segeddata) adataid fetcheli fel adatbázisba
//Lista_input.jsben használom
app.post('/tartalomfel', (req, res) => {
  kapcsolat()

  connection.query('INSERT INTO `listak` VALUES (NULL, "' + req.body.bevitel1 + '",CURDATE(),NULL, "' + req.body.bevitel2 + '","' + req.body.bevitel3 + '",0,0);', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})

//Lekérdezi a felhasználó által létrehozott listákat

//Profilom.jsben használom
//Felvitel.js


app.post('/felhasznalolistainincskesz', (req, res) => {
  kapcsolat()

  connection.query('SELECT * FROM listak WHERE letrehozofelhasznalo like"' + req.body.bevitel1 + '" and listak_kesz=0 order by listak_datum desc', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})

app.post('/felhasznalolistaikesz', (req, res) => {
  kapcsolat()

  connection.query('SELECT * FROM listak WHERE letrehozofelhasznalo like"' + req.body.bevitel1 + '" and listak_kesz=1 order by listak_datum desc', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})

//Listat töröl


//Szerkeszt.js

app.delete('/regilistatorles', (req, res) => {
  kapcsolat()

  connection.query('DELETE FROM `listak` WHERE listak_datum < (SELECT CURDATE() - INTERVAL 3 MONTH FROM `listak` LIMIT 1);', (err, rows, fields) => {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})

//Lista arat tölti fel utólagosan a Szerkeszt.jsben

//Szserkeszt.js
app.post('/arfel', (req, res) => {
  kapcsolat()

  connection.query('UPDATE listak SET listak_ar= "' + req.body.bevitel3 + '" WHERE listak_id = "' + req.body.bevitel4 + '"', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})

app.post('/listabefejezese', (req, res) => {
  kapcsolat()

  connection.query('UPDATE listak SET listak_ar= "' + req.body.bevitel3 + '",listak_keszdatum=CURDATE(), listak_kesz=1 WHERE listak_id = "' + req.body.bevitel4 + '"', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})


app.get('/aktualis', (req, res) => {
  kapcsolat()

  connection.query('SELECT * FROM `listak` WHERE listak_datum > CURRENT_DATE();', (err, rows, fields) => {
    if (err) throw err


    res.send(rows)
  })
  connection.end()
})
//Listat töröl


//Szerkeszt.js
app.delete('/listatorles', (req, res) => {
  kapcsolat()

  connection.query('DELETE FROM listak WHERE listak_id = "' + req.body.bevitel5 + '"', (err, rows, fields) => {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})
app.post('/felhasznaloossz', (req, res) => {
  kapcsolat()

  connection.query('SELECT count(listak_nev) as osszes  FROM `listak` WHERE `letrehozofelhasznalo` = "' + req.body.bevitel1 + '";', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows[0])
      res.send(rows)

    }
  })
  connection.end()

})
//regisztráciodatum
app.post('/regisztraciodatum', (req, res) => {
  kapcsolat()

  connection.query('SELECT YEAR(`felhasznalo_regisztrdatum`)as"datum",MONTH(felhasznalo_regisztrdatum) as "honap"  FROM `felhasznalo` WHERE `felhasznalo_nev`="' + req.body.bevitel1 + '"', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows[0])
      res.send(rows)
    }
  })
  connection.end()

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
