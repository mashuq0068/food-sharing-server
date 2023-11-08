const express = require("express")
const app = express()
require ('dotenv').config()
const cors = require("cors")
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000
app.use(cors({
  origin :[
    'http://localhost:5173',
    'https://fir-practice-email-pass.web.app',
    'https://fir-practice-email-pass.firebaseapp.com'
  ],
  credentials:true
}))
app.use(express.json())
app.use(cookieParser())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxdwxas.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const verifyToken = async(req , res , next) =>{
  const token  = req.cookies?.token
  if(!token){
    return res.status(401).send({message : "Unauthorized Access"})
  }
   jwt.verify(token ,  process.env.ACCESS_SECRET , (err , decoded)=>{
    if(err){
      return res.status(401).send({message:"Unauthorized Access"})
    }
    console.log(decoded)
    req.user = decoded
    next()
  })


}

async function run() {
  try {
   
  
    const database = client.db("eatTogetherDB")
    const foodCollection = database.collection("foods")
    const requestCollection = database.collection("foodRequests")
    app.post('/foods' ,verifyToken, async(req , res) => {
      const food = req.body
      const result = await foodCollection.insertOne(food)
      res.send(result)
    })
    app.get('/foods' , async(req , res) => {
     const cursor = foodCollection.find()
     const foods = await cursor.toArray()
     res.send(foods)
    })
    app.delete('/foods/:id' ,verifyToken, async(req , res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await foodCollection.deleteOne(query)
      res.send(result)
    
    })
    app.patch('/foods/:id' ,verifyToken, async(req , res) => {
      const id = req.params.id
      const food = req.body
      const filter = {_id : new ObjectId(id)}
      const options = { upsert: true };
      const updatedFood = {
        $set:{
          foodName:food.foodName,
          foodImage:food.foodImage,
          foodQuantity:food.foodQuantity,
          pickupLocation:food.pickupLocation,
          additionalInformation:food.additionalInformation,
          expiredDate:food.expiredDate,
          foodStatus:food.foodStatus,
          donatorName:food.donatorName,
          donatorEmail:food.donatorEmail,
          donatorPhoto:food.donatorPhoto
          
        }
      }
      const result = await foodCollection.updateOne(filter , updatedFood , options)
      res.send(result)

    })
    
    
    app.get('/food/:id' ,verifyToken, async(req , res) => {
     const id = req.params.id
     const query = {_id : new ObjectId(id)}
     const food = await foodCollection.find(query).toArray()
     res.send(food)
    })
    
    // app.get('/foodByQuantity' ,verifyToken, async(req , res) => {
    
    // const foodsByQuantity = await foodCollection.find().sort({foodQuantity : -1}).limit(6).toArray()
    // res.send(foodsByQuantity)

    // } )
    

    app.post ('/foodRequest' ,verifyToken,  async(req , res) => {
        const foodRequest = req.body
        const result = await requestCollection.insertOne(foodRequest)
        res.send(result)
    })
    app.delete ('/foodRequest/:id',verifyToken, async(req , res) => {
       const id = req.params.id
       const query = {_id : new ObjectId (id)}
       const result = await requestCollection.deleteOne(query)
       res.send(result)

    })
    app.get ('/foodRequest' ,verifyToken, async(req , res) => {
        const cursor = requestCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })
    app.post('/jwt' , async(req , res) => {
      const user = req.body
      console.log(user)
      const token = jwt.sign(user , process.env.ACCESS_SECRET)
      console.log(token)
      res
      .cookie("token" , token ,{
       httpOnly:true,
       secure:true,
       sameSite:'none'
      })
      .send({success: true})

      
     

  })
  app.post('/deleteToken' ,verifyToken, async(req , res) => {
    const user = req.body;

    console.log('logging out', user);
    res.clearCookie('token', { maxAge: 0  ,secure:true,
      sameSite:'none' }).send({ successDelete: true })
   })
    app.put('/foodRequest/:id' ,verifyToken, async (req , res) => {
      const id = req.params.id
      const filter = {_id : new ObjectId(id)}
      const options = { upsert: true };
      const updatedFood = {
        $set:{
          
          foodStatus:"Delivered",
         
          
        }
      }
      const result = await requestCollection.updateOne(filter , updatedFood , options)
      res.send(result)
    })
   

   
    
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
