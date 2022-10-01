const express = require ('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { initializeApp } = require('firebase-admin/app');
require('dotenv').config()
console.log(process.env.DB_NAME)


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Firebase JWT Token Authentication//
const { getAuth } = require("firebase-admin/auth");
const admin = require("firebase-admin");

const serviceAccount = require("./configs/hotel-burj-al-firebase-adminsdk-i0kyl-8ffba2c147.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});



// const password = hotelburj79;

app.get('/', (req, res) =>{
   res.send('Hello World')
})

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.qw3jyed.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// client.connect(err => {
//    const collection = client.db("hotelburj").collection("bookings");
//       console.log("DB connected Successfully");

//     app.post('/addBooking',  (req, res) => {
//        const newBooking = req.body;
//        collection.insertOne(newBooking)
       
//        .then(result => {
//           console.log(result);
//           console.log('Data added to mongodb');
//        })
//        console.log(newBooking); 
//       //  client.close();          
//     });
    
//  })


//... New Code wright from here...//
async function run() {
   try {
     await client.connect();
     // database and collection code goes here
     const collection = client.db("hotelburj").collection("bookings");
     console.log("DB connected Successfully");
     // insert code goes here
     app.post('/addBooking',  (req, res) => {
      const newBooking = req.body;
      collection.insertOne(newBooking)
      
      .then(result => {
         res.send(result.acknowledged == true)
         console.log(result);
         
      })
      // console.log(newBooking);           
   });

   app.get("/bookings", (req, res) => {
      const bearer = req.headers.authorization;
      if(bearer && bearer.startsWith('Bearer ')){
         const idToken = bearer.split(' ')[1];
         // console.log({idToken});
            getAuth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
            const uid = decodedToken.uid;
            console.log({uid});
            const tokenEmail = decodedToken.email;
            const queryEmail = req.query.email;
            console.log({tokenEmail});
            console.log({queryEmail});
            if(tokenEmail == req.query.email) {
               collection.find({email: req.query.email})
               .toArray((err, documents) =>{
                  res.send(documents);
               })
            }
            
            })
            .catch((error) => {
            // Handle error
            });
      } else {
         res.status(401).send('Unauthorized access')
      }
     
   })
  
   } finally {
     // Ensures that the client will close when you finish/error
   //   await client.close();
   }
 }
 run().catch(console.dir);

 app.listen(2233, () => {
   console.log("Port is live in 2233");
});