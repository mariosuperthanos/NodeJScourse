// Unlike tourController module, that handles application logic(aspects like requests or responses)
// tourModel module handles the bussines logic 

const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// schema = the blueprint of the data that will be stored
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual props are props that are not stored in the collection
// I didn't use arrow function because 'this' keyword doesn't exist there
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// 1) DOCUMENT MIDDLEWARE: runs before(pre)/after(post) .save() and .create() a document
// 'this' keyword will point to the document itself
// here is a list with document methods: validate, save, updateOne, deleteOne
tourSchema.pre('save', function(next){
  this.slug = slugify(this.name, {
    lower: true
  });
  next();
});

// tourSchema.pre('save', function(next){
//   console.log('Will save document...') 
//   next();
// })

// tourSchema.post('save', function(doc, next){
//   console.log(doc);
//   next();
// });

// 2) QUERY MIDDLEWERE: runs before(pre)/after(post) awaiting a query
// 'this' keyword will point to query, not to the document
tourSchema.pre(/^find/, function(next) {
// tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true }});

  this.start = Date.now();
  next();
})

tourSchema.post(/^find/, function(docs, next){
  console.log(`Query took ${Date.now() - this.start} miliseconds`)
  // console.log(docs);
  next();
})

// 3) AGGREGATION MIDDLEWERE 
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTours: { $ne: true } } })

  console.log(this.pipeline());
  next();
})

// model = a blueprint based on a schema that allows us to use CRUD operations
// (Create, Read, Update, Delete) on documents
const Tour = mongoose.model('Tour', tourSchema); // 'Tour'(the first parameter) is the name of the model

module.exports = Tour;

 