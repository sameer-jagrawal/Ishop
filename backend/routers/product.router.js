const productRouter = require("express").Router();

const {
  create,
  read,
  deleteById,
  updateById,
  readById,
  updateDataBySlug,
  readBySlug,
  deleteImage
} = require("../controllers/Productcontroller");
const fileUploader = require("express-fileupload");
productRouter.post(
  "/create",
  fileUploader({ createParentPath: true }),
  create,
);

productRouter.get("/", read)
productRouter.get("/:id", readById )
productRouter.get("/slug/:slug", readBySlug )
productRouter.delete("/delete/:id", deleteById )
productRouter.put("/image_delete/:slug", deleteImage )
productRouter.put("/update/:id", updateById )
productRouter.put("/edit/:slug", fileUploader({ createParentPath: true }),updateDataBySlug )



module.exports = productRouter;
