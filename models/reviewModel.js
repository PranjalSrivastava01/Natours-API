const mongoose = require('mongoose');
const Tour=require('./tourModel')
const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review cant be empty']
        },
        rating: { // Corrected the field name to 'rating'
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        tour: {
            type: mongoose.Schema.ObjectId, // Corrected the spelling to 'ObjectId'
            ref: 'Tour',
            required: [true, 'Review must belong to a tour']
        },
        user: {
            type: mongoose.Schema.ObjectId, // Corrected the spelling to 'ObjectId'
            ref: 'User',
            required: [true, 'Review must belong to a user']
        },
    },
    {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true,
        }
    }
);

// reviewSchema.pre(/^find/,function(next){
//     this.populate({
//         path:'tour',
//         select:'name'
//     }).populate({
//         path:'user',
//         select:'name photo'
//     });
//     next();
// })
// here exist the unique combination of user and tour
reviewSchema.index({tour:1,user:1},{unique:true});
reviewSchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select:'name photo'
    });
    next();
})

reviewSchema.statics.calAverageRatings=async function(tourId){
    const stats=await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:"$tour",
                nRating:{ $sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ]);
    if(stats.length>0)
    {
            await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:stats[0].nRating,
            ratingsAverage:stats[0].avgRating
            });
    } else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:0,
            ratingsAverage:4.5
            });
    }
};
reviewSchema.post('save',function(next){
// this points to current review document
//Review.calAverageRatings(this.tour)
//since Review is not been declared yet thats whe we use this.constrctor and also we cannot declare this middleware after the Review declaration.
this.constructor.calAverageRatings(this.tour)
});

const Review = mongoose.model('Review', reviewSchema);

///revise this part
reviewSchema.pre(/^findOneAnd/,async function(next){
    this.r =await this.findOne();
    // console.log(r)
    next();
});
reviewSchema.pre(/^findOneAnd/,async function(next){
    await this.r.constructor.calAverageRatings(this.r.tour);
});
//revise this part

module.exports = Review;

//post /tour/845y895y895/review-------->nested route
//get /tour/845y895y895/review/123456789876543(review id)-------->nested route