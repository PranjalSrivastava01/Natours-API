const fs=require('fs');
require('dotenv').config();
const mongoose=require('mongoose');
const Tour=require('../../models/tourModel');
const Review=require('../../models/reviewModel');
const User=require('../../models/userModel');
const { dirname } = require('path');
const port = 3000;
const DB=process.env.DATABASE.replace(
  '<PASSWORD>',process.env.DATABASE_PASSWORD
);
mongoose
.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology:true
}).then(()=>{
  // console.log(con.connections);
  console.log('DB connection succesfuL!');
});

const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'))
const users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'))
const reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'))
//Importing data into the data base
const importData=async()=>{
    try{
   await Tour.create(tours)
   await User.create(users,{validateBeforeSave:false})
   await Review.create(reviews)
   console.log("added sucessfully")
    }catch(err){
    console.log(err)
    }
}
//delete All data
const deleteData=async()=>{
    try{
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log("deleted sucessfully")
        }catch(err){
         console.log(err)
         }
}
if(process.argv[2]=='--import')
{
  importData();
}
else if(process.argv[2]=='--delete')
{
  deleteData();
}
console.log('printing process argv',process.argv);