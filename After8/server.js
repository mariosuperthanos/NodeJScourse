const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const app = require('./app');



mongoose.connect(process.env.DB)
.then(() => {
  console.log("Connected to MongoDB successfully!");
})
.catch((error) => {
  console.log("Error connecting to MongoDB:", error);
});


// 4) START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}...`)
});

