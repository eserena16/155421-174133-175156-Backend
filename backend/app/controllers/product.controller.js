const db = require("../models");
const Sequelize = require('sequelize');
const { company: Company, product: Product } = db;
const cloudinary = require("../config/cloudinary.config");
const { product } = require("../models");

const Op = db.Sequelize.Op;
var { catchErrorAuth } = require("../utils/loggerFunctions");
var { logger } = require("../utils/logger");

exports.add = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    if (!result) {
      return res.status(500).send({
        message: "Error uploading image",
      });
    }
    Product.create({
      name: req.body.name,
      description: req.body.description,
      price: parseInt(req.body.price, 10),
      count: parseInt(req.body.count, 10),
      companyId: req.companyId,
      image: result.secure_url,
      cloudinary_id: result.public_id,
    });
    logger.info({
      action: "addProduct",
      message: `Product was created successfully.`,
      productId: product.id,
      userId: req.userId,
      companyId: req.companyId,
    });
    return res.send({
      message: "Product was created successfully!",
    });
  } catch (error) {
    console.error(error);
    return catchErrorAuth(
      "addProduct",
      "An error occurred during creating product.",
      error,
      req,
      res
    );
  }
};
exports.update = async (req, res) => {
  try {
    const product = await Product.scope({
      method: ["byCompany", req.companyId],
    }).findByPk(req.params.id);

    if (!product) {
      logger.error({
        action: "updateProduct",
        message: `Product does not exist.`,
        productId: product.id,
        userId: req.userId,
        companyId: req.companyId,
      });
      return res.status(404).send({
        message: `Failed! Product ${req.params.id} does not exist!`,
      });
    }
    await cloudinary.uploader.destroy(product.cloudinary_id);

    const result = await cloudinary.uploader.upload(req.file.path);
    if (!result) {
      return res.status(500).send({
        message: "Error uploading image",
      });
    }
    await product.update({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      count: req.body.count,
      image: result.secure_url,
      cloudinary_id: result.public_id,
    });
    logger.info({
      action: "updateProduct",
      message: `Product was modified successfully.`,
      productId: product.id,
      userId: req.userId,
      companyId: req.companyId,
    });
    return res.send({
      message: "Product was modified successfully!",
    });
  } catch (error) {
    console.error(error);
    return catchErrorAuth(
      "updateProduct",
      "An error occurred during creating product.",
      error,
      req,
      res
    );
  }
};

exports.updateStock = async (id, additionalCount) => {  
  try {
    const product = await Product.findByPk(id);
    if (!product) {      
      logger.error({
        action: "updateProductStock",
        message: `Product does not exist.`,
        productId: id
      });      
    } else {      
      product.update({
        count: Sequelize.literal(`count + ${additionalCount}`),
      });
      logger.info({
        action: "updateProductStock",        
        productId: id,
        additionalCount: additionalCount,
      }); 
    }
  } catch (error) {
    return catchErrorAuth(
      "updateProductStock",
      "An error occurred during updating product stock.",
      error,
      req,
      res
    );
  }
};

exports.delete = async (req, res) => {
  try {
    const product = await Product.scope({
      method: ["byCompany", req.companyId],
    }).findByPk(req.params.id);

    if (!product) {
      logger.error({
        action: "deleteProduct",
        message: `Product does not exist.`,
        productId: product.id,
        userId: req.userId,
        companyId: req.companyId,
      });
      return res.status(404).send({
        message: `Failed! Product Id ${req.params.id} does not exist!`,
      });
    }
    await product.update({
      deleted: true,
    });

    return res.send({
      message: "Product was deleted successfully!",
    });
  } catch (error) {
    return catchErrorAuth(
      "deleteProduct",
      "An error occurred during deletion product.",
      error,
      req,
      res
    );
  }
};

exports.get = async (req, res) => {
  try {
    const product = await Product.scope({
      method: ["byCompany", req.companyId],
    }).findByPk(req.params.id);

    if (!product) {
      logger.error({
        action: "getProduct",
        message: `Product does not exist.`,
        productId: product.id,
        userId: req.userId,
        companyId: req.companyId,
      });

      return res.status(404).send({
        message: `Failed! Product Id ${req.params.id} does not exist!`,
      });
    }
    if (product.deleted) {
      logger.warn({
        action: "getProduct",
        message: `Product Id invalid status.`,
        productId: product.id,
        userId: req.userId,
        companyId: req.companyId,
      });
      return res.status(403).send({ message: "Invalid Product status!" });
    }
    return res.send({ product });
  } catch (error) {
    return catchErrorAuth(
      "getProduct",
      "An error occurred during deletion product.",
      error,
      req,
      res
    );
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.scope({
      method: ["byCompany", req.companyId],
    }).findAll({
      where: {
        deleted: false,
      },
    });
    if (products && products.length > 0) {
      return res.send({ products });
    } else {
      logger.warn({
        action: "getProducts",
        message: `No products were found.`,
        userId: req.userId,
        companyId: req.companyId,
      });
      return res.status(204).send({
        message: `No products were found.`,
      });
    }
  } catch (error) {
    return catchErrorAuth(
      "getProducts",
      "An error occurred during getProducts.",
      error,
      req,
      res
    );
  }
};
