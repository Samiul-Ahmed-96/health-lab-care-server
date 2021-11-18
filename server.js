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
        const bookingCollection =database.collection("booking");
        //Get All Services
        app.get('/services',async(req,res)=>{
                const cursor = await servicesCollection.find({});
                const allServices = await cursor.toArray();
                res.send(allServices);
        })
         //Get Service 
         app.get('/services/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const singleService = await servicesCollection.findOne(query);
            res.json(singleService);
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