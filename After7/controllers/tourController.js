const fs = require('fs');

// The GET method requests data from a server without modifying it.
// It is used to retrieve and display information from a specified resource in an API.
// app.get('/', (req, res) => {
//   res.json({message: 'Hello from the server side!', app: 'Natours'});
// });

// app.post('/' , (req, res) => {
//   res.send('You can post to this endpoint...');
// });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'));

exports.checkID = (req, res, next, val) => {
  if(req.params.id * 1 > tours.length) return res.status(404).json({
    status: "Fail",
    message: "Invalid ID"
  });
  next();
}

// Create a checkBody middlewere
// Check if the body contians the name and price property
// If not, send back 400(bad request)
// Add it to the post handler stack

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      stauts: "fail",
      message: "Missing name or price"
  });
  }
  next();
}

// 2) ROUTE HANDLERS
exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.json({
    status: 'success',
    requestAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  });
}
exports.getTourById = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1 

  const tour = tours.find(el => el.id === id);

  if(!tour) return res.status(404).json({
    status: "Fail",
    message: "Id not found"
  });

  res.json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tour
    }
  });
}
// POST is a method that sends data in the request body to the server.
exports.postTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id +1;
  const newTour = Object.assign({id: newId}, req.body)

  tours.push(newTour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
  })
})};
exports.updateTour = (req, res) => {
  if(req.params.id * 1 > tours.length) return res.status(404).json({
    status: "Fail",
    message: "Invalid ID"
  });

  res.status(200).json({
    status: "success",
    data: {
      tour: "<Update tour here...>"
    }
  });
}
exports.deleteTour = (req, res) => {
  if(req.params.id * 1 > tours.length) return res.status(404).json({
    status: "Fail",
    message: "Invalid ID"
  });

  res.status(204).json({
    status: "success",
    data: null
  });
};