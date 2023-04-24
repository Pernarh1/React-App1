//Dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//Database Configurations
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'admin',
    port: 8000,
});

//Creating and checking if the database exists
pool.query('SELECT 1 FROM pg_database WHERE datname = $1', ['expressdb'], function (err, res) {
    if (err) {
        console.log(err);
        pool.end();
    } else {
        if (res.rows.length === 0) {
            pool.query('CREATE DATABASE expressdb', function (err, res) {
                if (err) {
                    console.log(err);
                    pool.end();
                } else {
                    console.log('Database created successfully!');
                    CreateTable(); //Calling the creating table function
                }
            });
        } else {
            console.log('Database exists!');
            CreateTable(); //Calling the creating table function
        }
    }
});

//Function to create the table
function CreateTable() {
    // defining the table schema
    const tableLinks = `
        CREATE TABLE IF NOT EXISTS links (
            ID SERIAL PRIMARY KEY,
            name VARCHAR(30),
            URL VARCHAR(30)
        )
    `;
    //creating the table
    pool.query(tableLinks, function (err, res) {
        if (err) {
            console.error(err);
        } else {
            console.log('Table Created Successfully!');
        }
        pool.end();
    });
}

// Creating the route to the react frontend using the express static method
const staticFiles = express.static(path.join(__dirname, '../my-app/build'));
app.use(staticFiles);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../my-app/build', 'index.html'));
    console.log("Express Application Directory");
});

// Route to retrieve all links
app.get('/links', function (req, res) {
    pool.query('SELECT * FROM links ORDER BY id ASC', function (err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log(res.send(result.rows));
            console.log(pool.query('SELECT * FROM links'))
        }
    });
});

// Route to retrieve a link by id
app.get('/links/:id', function (req, res) {
    const id = parseInt(req.params.id);
    pool.query('SELECT * FROM links WHERE id = $1', [id], function (err, result) {
        if (err) {
            //returning the error message
            console.error(err);
        } else {
            //displaying the links
            console.log(res.send(result.rows));
        }
    });
});

// Route to create a new link
app.post('/links', function (req, res) {
    const { name, URL } = req.body;
    pool.query('INSERT INTO links (name, URL) VALUES ($1, $2)', [name, URL], function (err, result) {
        if (err) {
            console.error(err);
        } else {
            res.send('Link added successfully');
        }
    });
});

const PORT = 8000;
app.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}`);
});
