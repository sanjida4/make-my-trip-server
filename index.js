const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2ieef.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('admins'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) =>{
    res.send("hello it's working!");
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookingCollection = client.db("makeMyTrip").collection("booking");
  const adminCollection = client.db("makeMyTrip").collection("admins");
  const packageCollection = client.db("makeMyTrip").collection("packages");

  
    app.post('/addBooking', (req, res) =>{
        const booking = req.body;
        console.log(booking);
        bookingCollection.insertOne(booking)
        .then(result =>{
            res.send(result.insertedCount> 0)
        })
    });

    app.get('/bookings', (req, res) => {
        bookingCollection.find({})
            .toArray((err, documents) => {
                console.log(documents);
                res.send(documents);
            })
    })

    app.post('/bookingsByDate', (req, res) =>{
        const date = req.body;
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                const filter = { date: date.date }
                if (admins.length === 0) {
                    filter.email = email;
                }
                bookingCollection.find(filter)
                    .toArray((err, documents) => {
                        console.log(email, date.date, admins, documents)
                        res.send(documents);
                    })
            })
    })

    app.post('/addAnAdmin', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        adminCollection.insertOne({ name, email, image })
            .then(result => {
                console.log(result)
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/addPackage', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        console.log(name);

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        packageCollection.insertOne({ name, image })
            .then(result => {
                console.log(result)
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/packages', (req, res) => {
        packageCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.get('/admins', (req, res) => {
        adminCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })

});

app.listen(process.env.PORT || port)