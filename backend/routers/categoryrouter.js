const categoryRouter = require("express").Router();

const {create,read,update,readById,deleteById} = require("../controllers/categorycotroller")
const fileUploader = require("express-fileupload")
categoryRouter.post("/create", fileUploader({createParentPath:true}), create);
categoryRouter.get("/", read)
categoryRouter.patch("/update-status/:id",update)
categoryRouter.get("/:id", readById)
categoryRouter.delete("/delete/:id", deleteById)





module.exports = categoryRouter;