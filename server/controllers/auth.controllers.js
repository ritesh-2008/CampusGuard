export const getme = async(req,res) => {
    return res.json({
        success:true,
        user:{
            id:req.user.id,
            email:req.user.email
        }
    });
}