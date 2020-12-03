// importing
import express from "express";
import mongoose from "mongoose";
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import Cors from 'cors'


//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: '1075004',
    key: '54487c30b1f91b98f8ad',
    secret: '9585ea1043fc5535de8b',
    cluster: 'ap2',
    encrypted: true
  });



//midlewares
app.use(express.json());
app.use(Cors())  //if using cors dont need the commented code

// app.use((req,res,next)=>{
//     res.setHeader('Access-Control-Allow-Origin','*');
//     res.setHeader('Access-Control-Allow-Header','*');
//     next();
    
// })



//DB config
const connection_url = 'mongodb+srv://harshitabrol36:H9968254203a@cluster0.s3gnd.mongodb.net/whatsappdb?retryWrites=true&w=majority'

mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
    
});


const db = mongoose.connection;

db.once('open', ()=>{
    console.log('DB is connected');


    const msgCollection = db.collection('messagecontents'); 
    const changeStream = msgCollection.watch();

    changeStream.on('change',(change) =>{
        console.log('a change occured',change);
        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages','inserted',{
                name:messageDetails.name,
                message : messageDetails.message,
                timestamp:messageDetails.timestamp,
                received:messageDetails.received,
            })
        }else{
            console.log('Error triggering pusher')
        }
    });
})


//api routes
app.get('/',(req,res) => res.status(200).send("hello world")); 
app.post('/messages/new',(req,res) =>{
    const dbMessages = req.body

    Messages.create(dbMessages,(err,data) =>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})
//listener
app.listen(port,()=>console.log('Listening on localhost:${port}'))


