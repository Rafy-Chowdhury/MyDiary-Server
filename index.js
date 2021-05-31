const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;

const port = process.env.PORT || 5500

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzlxy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.get('/', (req, res) => {
  res.send('Hello World!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const postCollection = client.db("diary").collection("posts");

  // load all post from database
  app.get('/posts', (req, res) => {
    //console.log(req.query.email);
    postCollection.find({email: req.query.email})
    .toArray((err, items) => {
    res.send(items);
    })
  });
  
  // get post by id
  app.get('/post/:id', (req, res) => {
    postCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err, items) => {
      res.send(items[0]);
    })
  });

  // add post to database
  app.post('/addpost', (req, res) => {
    const newPost = req.body;
    console.log(newPost);
    
    postCollection.insertOne(newPost)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
    });

    // delete post by id
  app.delete('/deletePost/:id', (req, res) => {
    postCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then (result => {
      res.send(result.deletedCount > 0);
    })
  });  

  //update existing post
  app.patch('/updatePost/:id', (req, res) => {
    postCollection.updateOne({_id: ObjectId(req.params.id)},
    {
      $set: {title: req.body.title, description: req.body.description}
    })
    .then(result => {
      res.send(result.modifiedCount > 0);
    })
  });

});



app.listen(process.env.PORT || port);