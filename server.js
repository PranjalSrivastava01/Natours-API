require('dotenv').config();
const mongoose=require('mongoose');
const app = require('./app');
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

//start server
// console.log(process.env.NAME);
app.listen(port, () => {
  console.log(`App running on ${port}...`);
});
//test