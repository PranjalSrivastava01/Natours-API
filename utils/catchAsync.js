const catchAync=fn=>{
    return (req,res,next)=>{
      fn(req,res,next).catch(next);
      //it will throw error to thr next  global error handler middleware
    };
  }

  module.exports=catchAync;