const User=require('../models/userModel')
const appError=require('../utils/appError')
const catchAsync=require('../utils/catchAsync')
const handlerFactory=require('../controllers/handlerFactory')
const filterObj=(obj,...allowedFields)=>{
  const newObj={}
Object.keys(obj).forEach(el=>{
  if(allowedFields.includes(el))
  {
    newObj[el]=obj[el];
  }
});
return newObj;
}
exports.getUsers = async (req, res) => {
  const users=await User.find();
    res.status(200).json({
      status: 'success',
       data: users.length,
       data:{
        users,
       }
    });
  };
exports.createUsers = (req, res) => {
    res.status(404).json({
      status: 'failed',
      description: 'not implemented yet',
    });
  };
exports.getUser = handlerFactory.getOne(User);
exports.updateUser = handlerFactory.updateOne(User)
  exports.updateMe=async (req,res,next)=>{
  //1) create error if user post password data
  if(req.body.password || req.body.passwordConfirm)
  {
    return next(new appError('this route is not for password update please use update my password route',400));
  }
  const filteredBody=filterObj(req.body,'name','email');
  const updatedUser=await User.findByIdAndUpdate(req.user.id,filteredBody,
    {
      new:true,
      runValidators:true,
    });
  // user.name='Pappu Charsi'
  // user.save();
  res.status(200).json({
    status:'success',
    data:{
      updatedUser,
    }
  })
  //2)update user docment
  }

  exports.deleteMe=catchAsync(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{
    active:false
  });
  res.status(204).json({
    status:'success',
    data:null,
  })
  })
exports.getMe=(req,res,next)=>{
  req.params.id=req.user.id;
  next();
}
  exports.deleteUser=handlerFactory.deleteOne(User);