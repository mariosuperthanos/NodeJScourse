const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apifeatures')

exports.aliasTopTours = (req, res, next) => {
  // if the user acces /top-5-cheap' routesort=-ratingsAverage,price
  // the query params will be prefilled
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
} 

exports.getAllTours = async (req, res) => {
  try{
    // BUILD QUERY
    // A query is a request for information, typically used to filter, 
    // sort, or retrieve specific data from a database or API, but also for
    // the other CRUD operations. 
    // It is primarily associated with the Read aspect of CRUD operations.
    // When a function returns a query, it means the function provides a statement or a set of conditions (such as filtering or sorting rules) that can later be executed to retrieve or manipulate data.

    // EXECUTE QUERY
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
  } catch(err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
}
exports.getTourById = async (req, res) => {
  try{
    console.log(req.params.id);
    
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id:req.params.id })

    res.json({
      status: 'success',
      data: {
        tours: tour
      }
  })
  } catch(err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
}

// const catchAsync = fn => {
//   fn(req, res, next).catch(err => next(err))
// }

exports.createTour = async (req, res) => {
  try{
    console.log(req.body)
    // const newTours = new Tour({});
    // newTours.save().then()

    // create new document(newTour) based on a model(Tour) + save it in the db
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'succes',
      data: {
        tour: newTour
      }
    })
  } catch (err){
    // validation error(trying to create a document without the required fields)
    res.status(400).json({
      status: 'fail',
      message: err
    })
  }
};
exports.updateTour = async (req, res) => {
  try{
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    res.json({
      status: 'success',
      data: {
        tour
      }
  })
  } catch(err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
}
exports.deleteTour = async (req, res) => {
  try{
    await Tour.findByIdAndDelete(req.params.id);
    res.json({
      status: 'success',
      data: null
  })
  } catch(err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
};

// Statistics about the data:
exports.getTourStats = async (req,res) =>{
  try{
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
  } catch(err){
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
}

exports.getMothlyPlan = async (req, res) =>{
  try{
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
  } catch(err){
    res.status(404).json({
      status: 'fail',
      message: err
    })
  } 
}