const BrandRouter = require("express").Router();

const {
  create,
  read,
  deleteById,
  updateDataBySlug,
  readBySlug
} = require("../controllers/Brandcontroller");
const fileUploader = require("express-fileupload");
BrandRouter.post(
  "/create",
  fileUploader({ createParentPath: true }),
  create,
);
BrandRouter.get("/", read);
BrandRouter.get("/:slug", readBySlug);
BrandRouter.delete("/delete/:id", deleteById)
BrandRouter.put("/edit/:slug",fileUploader({ createParentPath: true }),updateDataBySlug,);





module.exports = BrandRouter;
