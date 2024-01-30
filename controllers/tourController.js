const Tour = require('./../models/tourModel');
const APIFeature=require('../utils/apiFeatures');
const catchAync=require('../utils/catchAsync')
const appError=require('../utils/appError')
const factory=require('../controllers/handlerFactory')
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
exports.getTourStats = 
catchAync(
  async (req, res,next) => {
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
          $group: {
            _id: {$toUpper:'$difficulty'},
            numTours:{$sum:1},
            numRatings:{$sum:'$ratingsQuatity'},
            avgrating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }  // Change $min to $max here
          }
        },
        {
          $sort:{avgPrice:1}
        },
        // {
        // $match:{_id:{$ne:'EASY'}}
        // }
      ]);
  
      res.status(200).json({
        status: 'success',
        data: {
          stats
        }
      });
  }
)

exports.getTours = 
  async (req, res) => {
    try {
      const features = new APIFeature(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();
  
      const tours = await features.query.populate('guides');
      res.status(200).json({
        status: 'success',
        items: tours.length,
        requestedAt: req.requestTime,
        data: {
          tours: tours,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: 'failed',
        data: {
          message: "Can't get the data",
        },
      });
    }
  };

exports.getTour = factory.getOne(Tour,{path:'reviews'})
exports.createTour =factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour);
exports.getAllTours=factory.getAll(Tour);
exports.getMonthlyPlan=
catchAync(
  async (req,res,next)=>{
      const year=req.params.year*1;
      const plan=await Tour.aggregate([
     {
      $unwind:'$startDates'
     },
     {
      $match:{
        startDates:{
          $gte:new Date(`${year}-01-01`),
          $lte:new Date(`${year}-12-31`),
        }
      },
    },
    {
      $group: {
        _id: { $month: { $toDate: '$startDates' } },
        numToursStarts: { $sum: 1 },
        tours:{$push:'$name'}
      }
    },
    {
      $addFields:{
       month:'$_id'
      }
    },
    {
      $project:{
    _id:0
      }
    },
    {
      $sort:{numToursStarts:-1}
    },
    {
      $limit:12
    }
      ])
      res.status(200).json({
        status:'success',
        data:{ 
          plan
        }
      })
  }
)
exports.deleteTour=factory.deleteOne(Tour);
// exports.deleteTour = 
// catchAync(
//   async (req, res,next) => {
//       await Tour.deleteOne({ _id: req.params.id });
//       res.status(200).json({
//         status: 'deleted',
//       });
//   }
// )

