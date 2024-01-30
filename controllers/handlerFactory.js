const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const APIFeature = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new appError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'updated',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new appError('No element with such ID exists', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    try {
      const features = new APIFeature(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();

      const doc = await features.query.populate('guides');
      res.status(200).json({
        status: 'success',
        items: doc.length,
        requestedAt: req.requestTime,
        data: {
          doc,
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
  });
