const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  // if the user acces /top-5-cheap' routesort=-ratingsAverage,price
  // the query params will be prefilled
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
} 

exports.getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    
    // In this line the pre-query middlewere will be applied:
    const tours = await features.query;

    // SEND RESPONSE
    res.json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
});

exports.getTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({ _id:req.params.id })
  
  if(!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.json({
    status: 'success',
    data: {
      tours: tour
    }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'succes',
    data: {
      tour: newTour
    }
  })
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if(!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.json({
      status: 'success',
      data: {
        tour
      }
  })
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if(!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }
    
    res.json({
      status: 'success',
      data: null
  })
});

// Statistics about the data:
exports.getTourStats = catchAsync(async (req,res, next) =>{
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: {$gte:4.5} }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty'},
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity'},
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        }
      },
      {
        $sort: { avgPrice: 1 }
      },
      {
        $match: { _id: { $ne: 'EASY' }}
      }
    ])
    res.json({
      status: 'success',
      data: {
        stats
      }
  })
});

exports.getMothlyPlan = catchAsync(async (req, res, next) =>{
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        // get the first element of startDates array
        $unwind: '$startDates'
      },
      {
        // to filter documents comparing the date
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          }
        }
      },
      {
        // to select the important fields, rewriting the document
        $group: {
          _id: { $month: '$startDates'},
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { 
          month: '$_id' 
        }
      },
      {
        // delete the _id field
        $project: {
          _id: 0
        }
      },
      {
        $sort: {
          numTourStarts: 1
        }
      },
      {
        $limit: 12
      }
      
    ]);

    res.json({
      status: 'success',
      data: {
        plan
      }
    });
});