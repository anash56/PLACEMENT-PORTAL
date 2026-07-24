import Job from "../models/Job.js";
import Application from "../models/Application.js";

export const createJob = async (req,res)=>{

    try{

        const {
            title,
            company,
            location,
            salary,
            description,
            minCgpa,
            allowedBranches,
            deadline
        } = req.body;

        const job = await Job.create({

            title,
            company,
            location,
            salary,
            description,
            minCgpa,
            allowedBranches,
            deadline,

            createdBy:req.user.id

        });

        res.status(201).json(job);

    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};
export const getJobs = async (req, res) => {

    try {

        const keyword = req.query.keyword || "";
        const location = req.query.location || "";
        const sort = req.query.sort;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const skip = (page - 1) * limit;

        const query = {};

        // Search by title, company, or description using partial regex matching
        if (keyword) {
            const regex = new RegExp(keyword, "i");
            query.$or = [
                { title: regex },
                { company: regex },
                { description: regex }
            ];
        }

        // Filter by location
        if (location) {

            query.location = {
                $regex: location,
                $options: "i"
            };

        }

        const totalJobs =
            await Job.countDocuments(query);

        let jobsQuery =
            Job.find(query)
                .populate(
                    "createdBy",
                    "name email"
                )
                .lean();

        // Sort by salary
        if (sort === "salary") {

            jobsQuery =
                jobsQuery.sort({
                    salary: -1
                });

        }

        // Sort by latest jobs
        if (sort === "latest") {

            jobsQuery =
                jobsQuery.sort({
                    createdAt: -1
                });

        }

        const jobs =
            await jobsQuery
                .skip(skip)
                .limit(limit);

        res.status(200).json({

            totalJobs,

            currentPage: page,

            totalPages:
              Math.max(1,Math.ceil(
                    totalJobs / limit
                ))  ,

            jobs

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

    

export const getJobById = async (req,res)=>{

    try{

        const job = await Job.findById(req.params.id)
            .populate("createdBy","name email")
            .lean();


        if(!job){
            return res.status(404).json({
                message:"Job Not Found"
            });
        }

        res.status(200).json(job);

    }catch(error){

        res.status(500).json({
            message:error.message
        });
    }
};

export const updateJob = async (req, res) => {

    try {

        const job = await Job.findByIdAndUpdate(

            req.params.id,

            req.body,

            {

                new: true,

                runValidators: true

            }

        );

        if (!job) {

            return res.status(404).json({

                message: "Job Not Found"

            });

        }

        res.status(200).json({

            message: "Job Updated Successfully",

            job

        });

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};


export const deleteJob = async (req, res) => {

    try {

        const job = await Job.findByIdAndDelete(
            req.params.id
        );

        if (!job) {

            return res.status(404).json({

                message: "Job Not Found"

            });

        }

        // Cascade delete applications associated with this job
        await Application.deleteMany({ job: req.params.id });

        res.status(200).json({

            message: "Job Deleted Successfully"

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};