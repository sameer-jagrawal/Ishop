const productRouter = require("express").Router();

const {
  create,

} = require("../controllers/Productcontroller");
const fileUploader = require("express-fileupload");
productRouter.post(
  "/create",
  fileUploader({ createParentPath: true }),
  create,
);


module.exports = productRouter;
