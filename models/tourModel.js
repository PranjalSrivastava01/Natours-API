const mongoose = require('mongoose');
const slugify=require('slugify');
const validator=require('validator')
const User=require('./userModel')
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'must have a tour name'],
        unique: true,
        trim: true,
        // validate:[validator.isAlpha,'String Should be alphabets']
    },
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ],
    startLocation:{
    type:{
   type:String,
   default:'Point',
   enum:['Point']
    },
     coordinates:[Number],
     address:String,
     description:String
    },
    locations:
    [
    {
   type:{
    type:String,
    default:'Point',
    enum:['Point'],
   },
   coordinates:[Number],
   address:String,
   description:String,
   day:Number,
    }],
    duration: {
        type: Number, 
        required: [true, 'must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum:
        {
            values:['easy','medium','difficult'],
            message:'wrong input'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min:[1,'Rating must be above 1.0'],
        max:[5,'Ratin must be below 5.0'],
        set:val=>Math.round(val*10)/10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'must have a price']
        
    },
    priceDiscount:
    {
type:Number,
validate:
{
    validator:function(val){
        return val<this.price;
        },
        message:'Discount Price should be less than regular price'
}
    } ,
    summary: {
        type: String,
        trim: true,
        required: true
    },
    description: { // Corrected typo here
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: true
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    secretTour:{
        type:   Boolean,
        default:false
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
},
);
tourSchema.virtual('durationweeks').get(
    //this type of validators work only on create operation not on update becausen this keyword only works on the current object
    function()
    {
        return this.duration/7
    }
)
//virtual populate
//actually what we have done for the review is parent referencing, so the the question arises how am I gonna show reviews in both tour as well as user the answer is virtual populate.
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
})
// tourSchema.pre('save',aysnc function(next){
//     const guidesPromises=this.guides.map(
//         aysnc id=> await User.findById(id));
//     this.guides=await Promise.all(guidesPromises);
//     next();

// });
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
//   });
  
// Creating model
//this middleware will run before the create command .save() .create()
tourSchema.pre('save',function(next){
this.slug=slugify(this.name,
    {lower:true});
    next();
})
tourSchema.post('save',function(doc,next)
{
console.log(doc);
next();
})
//query middleware
tourSchema.pre('find',function(next){
    next();
})
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
