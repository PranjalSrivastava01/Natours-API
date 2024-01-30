const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const appError = require('./utils/appError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const app = express();
//protecting headers should be at top
app.use(helmet());
//Middleware-body parser readind data from the body into req.body
app.use(express.json({ limit: '10Kb' }));

//data sanitisation against nosql query injection
app.use(mongoSanitize());

//data sanitization against xss
app.use(xss());
// app.use(hpp(
//   {
//     whitelist:['duration','price','difficulty','ratingsAverage','maxGroupSize']
//   }
// ));
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log('hello from the server side');
  next();
});
//creating limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP Address please try again in an hour',
});
app.use('/api', limiter);
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

//routes

// app.get('/api/v1/tours',getTours );
// app.get('/api/v1/tours/:id',getTour)
// app.post('/api/v1/tours',createTour);
// app.patch('/api/v1/tours/:id',updateTour);
//routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status:'fail',
  //   message:`can't find ${req.originalUrl} on this server`
  // })
  // const err= new Error(`can't find ${req.originalUrl} on this server`);
  // err.status='fail';
  // err.statusCode=404;
  next(new appError(`can't find ${req.originalUrl} on this server`, 404));
});
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});
module.exports = app;
