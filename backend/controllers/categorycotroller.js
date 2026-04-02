const categoryModel = require("../models/CategoryModel");
const {sendBadReaquest,sendConflict,sendCreated,sendDelete,sendNotFound,sendServerError,sendSuccess,sendupdate} = require("../utils/response")
const {imageName,} = require("../utils/helper")
// console.log(categoryModel)
// create api
const create = async (req,res)=>{
    try {
        // console.log(req.body) 
        // res.send("sameer")
        const {name,slug,} = req.body;
        const image = req.files?.image;
        console.log(image)
        if(!name || !slug || !image){
            return sendBadReaquest(res,"All feild are required")
        }
        const existCategory =  await categoryModel.findOne({slug});
        if(existCategory){
            return sendConflict(res)
        }
        const imagename = imageName(image.name)
       const destination = `./public/category/${imagename}`;
        image.mv(destination, async(error) =>{
            if(error) return sendServerError (res, "image not upload");
            const data =   await categoryModel.create({name,slug,image:imagename});

             return sendCreated(res,"Created Successfully",data)  
        })
      
    } catch (error) {
        console.log(error)
        return sendServerError(res, "Something went wrong");
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

// delete api

const deleteById = async (req,res)=>{
    try {
        const id = req.params.id 
        const category = await categoryModel.findById(id)
        // console.log(category)
        if(category){
           await categoryModel.findByIdAndDelete(id)
        } 
        sendDelete(res)
    } catch (error) {
       sendServerError(res)
    }
}

module.exports = {
    create,read,update,readById,deleteById
}