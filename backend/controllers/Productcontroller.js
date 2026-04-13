const ProductModel = require("../models/ProductModel")
const { imageName } = require("../utils/helper");
const { sendBadReaquest, sendConflict, sendServerError, sendSuccess, sendupdate,sendDelete } = require("../utils/response");
const create = async (req,res) => {
    try {
        const {name,slug} = req.body;
        // console.log(categoryId)
        // console.log(name,slug,)
        const image = req.files?.image;
        // console.log(image)
        if (!name || !slug || !image) {
            return sendBadReaquest(res, "All fields required");
        }
        
        const existproduct = await ProductModel.findOne({slug})

        if(existproduct) return sendConflict(res,"Brand already exists")


        let categoryId = []
        if(req.body.categoryId){
            categoryId = JSON.parse(req.body.categoryId)
        }
         
      if (!Array.isArray(categoryId) || categoryId.length === 0) {
        return sendBadReaquest(res, "Category required");
      }
      
        let brandId = []
        if(req.body.brandId){
            brandId = JSON.parse(req.body.brandId)
        }
        if (!Array.isArray(brandId) || brandId.length === 0) {
            return sendBadReaquest(res, "brand required");
          }
          let colorId = []
          if(req.body.colorId){
              colorId = JSON.parse(req.body.colorId)
          }
        const imagename = imageName(image.name)
        const destination = `./public/product/${imagename}`;
        image.mv(destination, async (error)=>{
            if(error) return sendServerError(res,"image not uploaded")
            const data = (await ProductModel.create({name,slug,image:imagename,categoryId,colorId,brandId}))
            return sendSuccess(res,"Brand Created Successfully", data)
        })


    } catch (error) {
        console.log(error)
    }
}




module.exports = {create}