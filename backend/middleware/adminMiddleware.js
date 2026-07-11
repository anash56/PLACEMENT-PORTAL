const adminOnly = (req,res,next)=>{

    if(req.user.role !== "admin"){

        return res.status(403).json({
            message:"Access Denied. Admin Only"
        });

    }

    next();

};

export default adminOnly;