const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const app = require('./app');



mongoose.connect(process.env.DB)
.then(() => {
  console.log("Connected to MongoDB successfully!");
})
// .catch(err => console.log('ERROR'));


// 4) START SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App listening on port ${port}...`)
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLER REJECTION!')
  console.log(err.name, err.message);
  server.close(() =>{
    process.exit(1);
  })
})

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION!');
  console.log(err.name, err.message);
  server.close(() =>{
    process.exit(1);
  })
})
