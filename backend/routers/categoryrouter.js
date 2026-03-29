const categoryRouter = require("express").Router();

const {create,read,update,readById} = require("../controllers/categorycotroller")

categoryRouter.post("/create", create);
categoryRouter.get("/", read)
categoryRouter.patch("/update-status/:id",update)
categoryRouter.get("/:id", readById)




module.exports = categoryRouter;