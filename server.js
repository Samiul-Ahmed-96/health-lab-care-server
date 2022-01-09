const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const fileUpload = require("express-fileupload");

const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());
//Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iy3km.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    console.log("db connected");
    const database = client.db("health-care");
    const servicesCollection = database.collection("services");
    const doctorsCollection = database.collection("doctors");
    const appoinmentsCollection = database.collection("appoinments");
    const reviewsCollection = database.collection("reviews");
    const usersCollection = database.collection("users");
    //Get All Services
    app.get("/services", async (req, res) => {
      const cursor = await servicesCollection.find({});
      const allServices = await cursor.toArray();
      res.send(allServices);
    });
    //Get All Doctors
    app.get("/doctors", async (req, res) => {
      const cursor = await doctorsCollection.find({});
      const allDoctors = await cursor.toArray();
      res.send(allDoctors);
    });
    //Get Service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const singleService = await servicesCollection.findOne(query);
      res.json(singleService);
    });
    //Update Single Service
    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const updatedService = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedService.name,
          price: updatedService.price,
          description: updatedService.description,
        },
      };
      const result = await servicesCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    //Add Booking Api
    app.post("/appoinments", async (req, res) => {
      const appoinment = req.body;
      const result = await appoinmentsCollection.insertOne(appoinment);
      res.json(result);
    });
    //Get All Bookings
    app.get("/bookings", async (req, res) => {
      const cursor = await appoinmentsCollection.find({});
      const allBookings = await cursor.toArray();
      res.send(allBookings);
    });
    //Get All Reviews
    app.get("/reviews", async (req, res) => {
      const cursor = await reviewsCollection.find({});
      const allReviews = await cursor.toArray();
      res.send(allReviews);
    });
    //Delete single item from Services Api
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });
    //Delete single item from Bookings Api
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await appoinmentsCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });
    //Delete single item from appoinments Api
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await appoinmentsCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });
    //Add Doctor to Db
    app.post("/doctors", async (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const designation = req.body.designation;
      const pic = req.files.img;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const doctor = {
        name,
        email,
        designation,
        img: imageBuffer,
      };
      const result = await doctorsCollection.insertOne(doctor);
      res.json(result);
    });
    //Add Service to db
    app.post("/services", async (req, res) => {
      const name = req.body.name;
      const price = req.body.price;
      const rating = req.body.rating;
      const description = req.body.description;
      const pic = req.files.img;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const service = {
        name,
        price,
        description,
        rating,
        img: imageBuffer,
      };
      const result = await servicesCollection.insertOne(service);
      res.json(result);
    });
    //Add Reviews Api
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });
    //Added user to Db
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    //Added user to db using upsert
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const update = { $set: user };
      const result = await usersCollection.updateOne(filter, update, options);
      res.json(result);
    });
    //Added Admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    //Check Admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Health-Care Server Running");
});

app.listen(port, () => {
  console.log("Health-Care Server Running", port);
});
