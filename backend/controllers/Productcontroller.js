const ProductModel = require("../models/ProductModel");
const mongoose = require("mongoose");
const fs = require("fs");
const { imageName } = require("../utils/helper");
const {
  sendBadReaquest,
  sendConflict,
  sendServerError,
  sendSuccess,
  sendupdate,
  sendDelete,
  sendNotFound,
} = require("../utils/response");

// create api
const create = async (req, res) => {
  try {
    // 1. Destructure with defaults
    const {
      name,
      slug,
      categoryId,
      brandId,
      discount_percentage,
      final_price,
      original_price,
      short_description,
      long_description,
    } = req.body;

    // 2. Get uploaded files
    const images = req.files?.images;
    const thumbnailFile = req.files?.thumbnail;

    // 3. Validate required fields (including categoryId and brandId)
    if (
      !name ||
      !slug ||
      !categoryId ||
      !brandId ||
      !images ||
      !thumbnailFile
    ) {
      return sendBadReaquest(res, "All required fields must be provided:");
    }

    // 4. Validate ObjectId format for categoryId and brandId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return sendBadReaquest(res, "Invalid categoryId");
    }
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return sendBadReaquest(res, "Invalid brandId");
    }

    // 5. Check for duplicate product by slug
    const existingProduct = await ProductModel.findOne({ slug });
    if (existingProduct) {
      return sendConflict(res, "Product already exists");
    }

    // 6. Parse colorId (optional, can be array or JSON string)
    let colorId = [];
    if (req.body.colorId) {
      try {
        colorId =
          typeof req.body.colorId === "string"
            ? JSON.parse(req.body.colorId)
            : req.body.colorId;
        if (!Array.isArray(colorId)) colorId = [colorId];
      } catch (err) {
        return sendBadReaquest(res, "Invalid colorId format");
      }
    }

    // 7. Process multiple images
    const files = Array.isArray(images) ? images : [images];
    const imageNames = [];
    for (const file of files) {
      const imagename = imageName(file.name);
      const destination = `./public/product/${imagename}`;
      await new Promise((resolve, reject) => {
        file.mv(destination, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      imageNames.push(imagename);
    }

    // 8. Process thumbnail
    const thumbName = imageName(thumbnailFile.name);
    const thumbPath = `./public/product/${thumbName}`;
    await new Promise((resolve, reject) => {
      thumbnailFile.mv(thumbPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 9. Create product in database
    const data = await ProductModel.create({
      name,
      slug,
      images: imageNames,
      thumbnail: thumbName,
      categoryId,
      brandId,
      colorId,
      long_description,
      short_description,
      final_price,
      discount_percentage,
      original_price,
    });
    const plainData = data.toObject();
    console.log("Plain object categoryId:", plainData.categoryId);
    return sendSuccess(res, "Product created sucessfully", plainData);
    // return res.status(200).json({ success: true, data: plainData });
  } catch (error) {
    console.error("Product creation error:", error);
    // Always send an error response to the client
    return sendServerError(res, error.message || "Internal Server Error", 500);
  }
};

// edit updateBySlug


// read api
const read = async (req, res) => {
  try {
    const data = await ProductModel.find().populate([
      "categoryId",
      "brandId",
      "colorId",
    ]);
    sendSuccess(res, "Product find succesfully", data);
  } catch (error) {
    sendServerError(res);
  }
};

// readbyId api
const readById = async (req, res) => {
  try {
    const id = req.params.id;
    product = await ProductModel.findById(id).populate([
      "categoryId",
      "brandId",
      "colorId",
    ]);
    if (product) {
      return sendSuccess(res, "Product Found Successfully", product, {
        image: "http://localhost:5000/product",
      });
    }
    // const data = sendSuccess(res, "Product find succesfully", data);
  } catch (error) {
    sendServerError(res);
  }
};

// readbyslug
const readBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
   const product = await ProductModel.findOne({slug:slug}).populate([
      "categoryId",
      "brandId",
      "colorId",
    ]);
    if (product) {
      return sendSuccess(res, "Product Found Successfully", product, {
        image: "http://localhost:5000/product",
      });
    }else {
      return sendNotFound(res, "Product not found");
  }
  } catch (error) {
    sendServerError(res,error.message);
  }
};

// Delete By Id

const deleteById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const deleted = await ProductModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Brand not found" });
    }

    return sendDelete(res, "deleted succesfully");
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// delete images




const deleteImage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { image_name } = req.body;
    console.log(image_name)

    const product = await ProductModel.findOne({ slug });
    if (!product) {
      return sendBadReaquest(res, "Product not found");
    }

    // Remove image from DB array
    await ProductModel.findOneAndUpdate(
      { slug },
      { $pull: { images: image_name } },
      { new: true }
    );

    // Delete file from storage
    fs.unlink(`./public/product/${image_name}`,(error)=>{
      if(error) {
        return sendBadReaquest(res,"Unable to delete image")
      } 
      return sendSuccess(res,"Image deleted successfully")
    })
  } catch (error) {
    return sendServerError(res, "Internal server error");
  }
};

// update status

const updateById = async (req, res) => {
  try {
    const { feild } = req.body;
    const id = req.params.id;
    const category = await ProductModel.findById(id);
    if (!category) {
      return sendNotFound(res);
    }
    const feilds = [
      "is_best",
      "is_top",
      "status",
      "stock",
      "is_popular",
      "is_home",
      "is_hot",
    ];
    if (!feilds.includes(feild)) {
      return sendBadReaquest(res);
    }
    const newRecord = await ProductModel.findByIdAndUpdate(id, {
      [feild]: !category[feild],
    });

    sendupdate(res, "status updated successfully", newRecord);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
};

// updateDataBySlug
const updateDataBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      name,
      slug: newSlug,
      categoryId,
      brandId,
      discount_percentage,
      final_price,
      original_price,
      short_description,
      long_description,
    } = req.body;

    console.log(req?.body?.name)
    const images = req.files?.images;
    const thumbnailFile = req.files?.thumbnail;

    if (!name || !categoryId || !brandId || !short_description || !long_description) {
      return sendBadReaquest(res, "All fields required");
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return sendBadReaquest(res, "Invalid categoryId");
    }
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return sendBadReaquest(res, "Invalid brandId");
    }

    const product = await ProductModel.findOne({ slug });
    if (!product) {
      return sendNotFound(res, "Product not found");
    }

    if (newSlug) {
      const existproduct = await ProductModel.findOne({ slug: newSlug });
      if (existproduct && existproduct.slug !== slug) {
        return sendConflict(res, "Slug already exists");
      }
    }

    let colorId = [];
    if (req.body.colorId) {
      try {
        colorId =
          typeof req.body.colorId === "string"
            ? JSON.parse(req.body.colorId)
            : req.body.colorId;
        if (!Array.isArray(colorId)) colorId = [colorId];
      } catch (err) {
        return sendBadReaquest(res, "Invalid colorId format");
      }
    }

    // 7. Process multiple images
    let imageNames = product.images;

    if (images) {
      const files = Array.isArray(images) ? images : [images];
      imageNames = [];

      for (const file of files) {
        const imagename = imageName(file.name);
        await file.mv(`./public/product/${imagename}`);
        imageNames.push(imagename);
      }
    }

    // 8. Process thumbnail
    let thumbName = product.thumbnail;

    if (thumbnailFile) {
      thumbName = imageName(thumbnailFile.name);
      await thumbnailFile.mv(`./public/product/${thumbName}`);
    }

    // 9. Create product in database
    const updateObject = {
      name,
      slug: newSlug || slug,
      categoryId,
      brandId,
      colorId,
      long_description,
      short_description,
      final_price,
      discount_percentage,
      original_price,
    };

    if (imageNames.length) {
      updateObject.images = imageNames;
    }

    if (thumbName) {
      updateObject.thumbnail = thumbName;
    }
    // 10. Update product
    const updated = await ProductModel.findOneAndUpdate(
      { slug },
      updateObject,
      { new: true }
    );

    return sendSuccess(res, "Data updated successfully", updated);
  } catch (error) {
    console.error("Product creation error:", error);
    // Always send an error response to the client
    return sendServerError(res, error.message || "Internal Server Error", 500);
  }
};


module.exports = { create, read, deleteById, updateById, readById,updateDataBySlug,readBySlug,deleteImage  };
