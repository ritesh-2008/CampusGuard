export const adminMiddleware = (req,res,next)=>{
   try{
    const user = req.user;

    if(!user){
        return res.status(401).json({
            success:false,
            message:"unauthorized"
        });
    }

    if(user.email !== process.env.ADMIN_EMAIL){
        return res.status(403).json({
            success:false,
            message:"admin access required"
        })
    }

    next();
   }catch (error) {
        console.error("Admin middleware error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}