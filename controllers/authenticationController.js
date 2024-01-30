const crypto=require('crypto')
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAysnc = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');
const sendEmail = require('../utils/email');
const catchAync = require('../utils/catchAsync');
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const cookieOptions={
    expires:new Date(Date.now()+process.env.JWT_COOKIES_EXPIRES_IN*24*60*60*1000),
    secure:false,
    //in prod mode-->secure:true
    httpOnly:true,
  }

const createSendToken=(user,statusCode,res)=>{
  const token = signToken(user._id);
  res.cookie('jwt',token,cookieOptions)
  res.status(statusCode).json({
    status:'success',
    token,
    data:{
      user,
    }
  })
}
exports.signup = catchAysnc(async (req, res, 
     next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role:req.body.role,
    createPasswordResetToken:req.body.createPasswordResetToken,
    passwordResetExpires:req.body.passwordResetExpires,
    passwordChangedAt:req.body.passwordChangedAt,
  });
  createSendToken(newUser,201,res);
  // const token = signToken(newUser._id);
  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
});

exports.login = catchAysnc(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  //check if email and passowrd actually exist
  if (!email || !password) {
    return next(new appError('Please provide email and password'), 400);
  }
  // check if user email & paswword is correct
  const user = await User.findOne({ email }).select('+password');
  // everything is okay
  const correct = await user.correctPassword(password, user.password);
  console.log("Printing password",user.pass);
  console.log("printing user.password",user.password);
  if (!user || !correct) {
    return next(new appError('Incorrect email or password'), 401);
  }
  createSendToken(user,201,res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
}
); 

exports.protect = catchAysnc(async (req, res, next) => {
  let token;
  //1)Getting token and check if it exist
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log('printing token')
  console.log(req.headers.authorization)
  if (!token) {
    return next(
      new appError('you are not logged in , please login to get access', 401)
    );
  }
  //2)verify the token
  //promisify make the code ansynchronous by operation...

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log("printing decoded")
  console.log(decoded);
  //3)check if user exist
  const freshUser = await User.findById(decoded.id);
  console.log("fresh User:",freshUser);
  if (!freshUser) {
    return next(new appError('the token does no longer exist', 401));
  }
  //4)check if user changed password after jwt issued
  if(freshUser.changedPasswordAfter(decoded.iat))
  {
    return next(new appError('please login again password is being changed', 401));
  }
  //access granted to the protected route
  req.user=freshUser;
  next();
  console.log(req.user)
});

exports.restrictTo=(...roles)=>{
    //roles is an array-admin-delete guide
    return (req,res,next)=>{
     if(!roles.includes(req.user.roles))
     {
        return next(new appError('not have permission to chnage'),403)
     }
    }
}
exports.forgotPassword=
catchAysnc(
async (req,res,next)=>{
//1) get user based on the posted email
const user=await User.findOne({email:req.body.email})
if(!user)
{
  return next(new appError("user does not exist",404));
}
//2)generate random token
const resetToken=user.createPasswordResetToken();
console.log("printing resetToken",resetToken)
await user.save({validateBeforeSave:false});
//3)send it back as a email
const resetURL=`${req.protocol}://${req.get(
  'host'
)}/api/v1/users/resetPassowrd/${resetToken}`;

const message=`forgot your password? submit a Patch request with you new password and passwordConfiem to:${resetURL}.\n If you didnt forget ypur password, please ignore this email`;

try{
  await sendEmail({
    email:user.email,
    subject:'your passworrd reset token (vallid for 10 min)',
    message
  })
  res.status(200).json({
    status:"success",
    message:'Token sent to email',
  })
}catch(err)
{
user.createPasswordResetToken=undefined,
user.passwordResetExpires=undefined,
await user.save({validateBeforeSave:false});
return next(new appError(`${err}`,500))
}
});

exports.resetPassword=
catchAysnc(
async (req,res,next)=>{
//1) get user based on the token
const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
console.log("printing hashed token",hashedToken)
const user=await User.findOne({passwordResetToken:hashedToken
})
//2)if token has not expired , and there is user, set the new password
if(!user)
{
  return next(new appError("toke is invalid or expired",400))
}
user.password=req.body.password;
user.passwordConfirm=req.body.passwordConfirm;
user.passwordResetToken=undefined,
user.passwordResetExpires=undefined
await user.save();
//3)update  changedPasswordAt property for the user

//4 log the user in,send JWT
createSendToken(UserActivation,200,res);
// const token=signToken(user._id);
// res.status(200).json({
//   status:'success',
//   token
// })
})

exports.updatePassword=catchAysnc(
  async(req,res,next)=>{
    console.log(req.user);
    const user=await User.findById(req.user.id).select('+password');
    if(!(await user.correctPassword(req.body.passwordCurrent,user.password)))
    {
 return next(new appError('ypu current password is wrong',401))
    }
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    await user.save();
    createSendToken(UserActivation,200,res);
    // const token=signToken(user._id);
    // res.status(200).json({
    //   status:'success',
    //   token
    // })

  }
)