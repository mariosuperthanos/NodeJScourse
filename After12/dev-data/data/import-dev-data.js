const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

const { dirname } = require('path');

dotenv.config({ path: './../../config.env' });

console.log(process.env.DB);

mongoose.connect(process.env.DB)
.then(() => {
  console.log("Connected to MongoDB successfully!");
})
.catch((error) => {
  console.log("Error connecting to MongoDB:", error);
});

// READ JSON FILE
const tours =  JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users =  JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews =  JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
console.log(reviews);

// IMPORT DATA INTO DB
const importData = async () => {
  try{
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    console.log('Data succesfully loaded!');
  } catch(err) {
    console.log(err);
  }
  process.exit();
}

// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try{
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data succesfully deleted!');
  } catch(err) {
    console.log(err);
  }
  process.exit();
}

if(process.argv[2] === '--import') {
  importData();
} else if(process.argv[2] === '--delete'){
  deleteData();
}

importData();
// console.log(process.argv);