// review / rating / createdAt / ref to tour / ref to user 

// We don't know how muchg the reviews number will grow
// so it can be a 1:few/many relationship, but it also can be a 1:ton relationship so we choose the parent referncing
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    require: [true, 'Review can not be empty']
  },
  rating: {
    type: Number,
    require: true,
    min:1,
    max:5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    require: [true, 'Review must belong to a tour.']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    require: [true, 'Review must belong to a user']
  }
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function(next) {
  // this.populate('tour', 'name')
  //     .populate('user', 'name photo');

  this.populate('user', 'name photo');

  next();   
})


reviewSchema.statics.calcAverageRatings =  async function(tourId) {
  // console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating'}
      }
    }
  ]);
  console.log(stats);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  })
}

reviewSchema.pre('save', function(next){

  // this points to current review
  // this.constructor points to the model
  this.constructor.calcAverageRatings(this.tour);
  next();
});

reviewSchema.pre(/^findOneAnd/, async function(next){ 
  const queryFilter = this.getQuery();
  // this.r = await this.model.findOne(queryFilter);
  const obj = await this.model.findOne(queryFilter);
  this.r = obj.tour;
  console.log('k', this.r);
  next();
})

reviewSchema.post(/^findOneAnd/, async function(next){ 
  // await this.model.findOne(queryFilter); // does NOT work here, the query has already executed
  await Review.calcAverageRatings(this.r);
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

