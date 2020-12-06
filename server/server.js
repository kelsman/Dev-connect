const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('config');
require('dotenv').config();
// const router = require('./routes/api/users');


//initialize app
const app = express();


//middlewares

app.use(express.json());
app.use(cors());


const PORT = process.env.PORT || 4000;
//mongodb connection
const db = config.get('MongoUrl')
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}, (err) => {
    if (err) console.log('error in connecting to mongodb', err.message)
    else {
        console.log('db connected');
        app.listen(PORT, () => console.log(`app running on port ${PORT}`));
    }
})

//listen 

//define routes
app.use('/api/user', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));

