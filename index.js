const express = require("express")
const app = express()
require ('dotenv').config()
const cors = require("cors")
const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxdwxas.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    await client.connect();
    const database = client.db("eatTogetherDB")
    const foodCollection = database.collection("foods")
    app.post('/foods' , async(req , res) => {
      const food = req.body
      const result = await foodCollection.insertOne(food)
      res.send(result)
    })
    app.get('/foods' , async(req , res) => {
     const cursor = foodCollection.find()
     const foods = await cursor.toArray()
     res.send(foods)
    })
    app.get('/foods/:id' , async(req , res) => {
     const id = req.params.id
     const query = {_id : new ObjectId(id)}
     const food = await foodCollection.find(query).toArray()
     res.send(food)
    })
    app.get('/foodByQuantity' , async(req , res) => {
    
    const foodsByQuantity = await foodCollection.find().sort({foodQuantity : -1}).limit(6).toArray()
    res.send(foodsByQuantity)

    } )
   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
    // await client.close();
  }
}
run().catch(console.dir);










app.get('/',(req , res) => {
    res.send("Food sharing website running properly")
})
app.listen(port , ()=>{
   console.log(`The server is running on port ${port}`)
})
