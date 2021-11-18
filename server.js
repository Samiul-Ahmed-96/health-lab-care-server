const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());
//Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iy3km.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        console.log('db connected')
        const database = client.db("health-care");
        const servicesCollection = database.collection("services");
        const doctorsCollection =database.collection("doctors");
        const appoinmentsCollection =database.collection("appoinments");
        //Get All Services
        app.get('/services',async(req,res)=>{
                const cursor = await servicesCollection.find({});
                const allServices = await cursor.toArray();
                res.send(allServices);
        })
        //Get All Doctors
        app.get('/doctors',async(req,res)=>{
                const cursor = await doctorsCollection.find({});
                const allDoctors = await cursor.toArray();
                res.send(allDoctors);
        })
         //Get Service 
         app.get('/services/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const singleService = await servicesCollection.findOne(query);
            res.json(singleService);
        })
        //Add Booking Api
        app.post('/appoinments',async(req,res)=>{
            const appoinment = req.body;
            const result = await appoinmentsCollection.insertOne(appoinment);
            res.json(result);
        })
        //Get All Bookings
        app.get('/bookings',async(req,res)=>{
            const cursor = await appoinmentsCollection.find({});
            const allBookings = await cursor.toArray();
            res.send(allBookings);
        })
        
        //Delete single item from appoinments Api
        app.delete('/bookings/:id', async (req,res)=>{
            const id = req.params.id;
            console.log("hitttttttt")
            const query = {_id : ObjectId(id)};
            const result = await appoinmentsCollection.deleteOne(query);
            console.log(result)
            res.json(result)
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Health-Care Server Running');
});

app.listen(port, () => {
    console.log('Health-Care Server Running', port);
})