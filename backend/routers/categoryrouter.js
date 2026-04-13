const categoryrouter = require("express").Router();

const {
  create,
  read,
  deleteById,
  updateDataBySlug,
  readBySlug,
  updateById
} = require("../controllers/categorycotroller");
const fileUploader = require("express-fileupload");
categoryrouter.post(
  "/create",
  fileUploader({ createParentPath: true }),
  create,
);
categoryrouter.get("/", read);
categoryrouter.get("/:slug", readBySlug);
categoryrouter.delete("/delete/:id", deleteById)
categoryrouter.put("/update/:id", updateById)
categoryrouter.put("/edit/:slug",fileUploader({ createParentPath: true }),updateDataBySlug,);





module.exports = categoryrouter;
