const categoryModel = require("../models/CategoryModel");
const {sendBadReaquest,sendConflict,sendCreated,sendDelete,sendNotFound,sendServerError,sendSuccess,sendupdate} = require("../utils/response")
// console.log(categoryModel)
// create api
const create = async (req,res)=>{
    try {
        // console.log(req.body) 
        // res.send("sameer")
        const {name,slug} = req.body;
        if(!name || !slug){
            return sendBadReaquest(res,"All feild are required")
        }
        const existCategory =  await categoryModel.findOne({name});
        if(existCategory){
            return sendConflict(res)
        }
        
        await categoryModel.create({name,slug})

        sendCreated(res)

    } catch (error) {
        console.log(error)
    }
}

// read api
const read = async (req,res)=>{
    try {
        // console.log(req.body)
        const category = await categoryModel.find()
        console.log(category)
        if(category){
            return sendSuccess(res,"success",category)
        }
    } catch (error) {
       sendServerError(res)
    }
}

// readbyid
const readById = async (req,res)=>{
    try {
        const id = req.params.id 
        const category = await categoryModel.findById(id)
        console.log(category)
        if(category){
            return sendSuccess(res, "category find", category)
        } 
    } catch (error) {
       sendServerError(res)
    }
}

// readby id


// update api
const update = async (req,res)=>{
    try {
        const {feild} = req.body;
        const id =  (req.params.id)
        const category = await categoryModel.findById(id)
        if(!category){
            return sendNotFound(res)    
        }
        const feilds = ["is_home","is_top","status","is_popular"]
        if(!feilds.includes(feild)){
            return sendBadReaquest(res)
        }
        const newRecord = await categoryModel.findByIdAndUpdate(id,{
            [feild] : !category[feild]
        })

        sendupdate(res,"updated",newRecord)
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    create,read,update,readById
}