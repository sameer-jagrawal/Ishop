const ColorRouter = require("express").Router();

const {create,read,deleteById,updateStatus} = require("../controllers/Colorcontroller")


ColorRouter.post("/create",create)
ColorRouter.get("/",read)
ColorRouter.delete("/delete/:id",deleteById)
ColorRouter.put("/update/:id",updateStatus)


module.exports = ColorRouter