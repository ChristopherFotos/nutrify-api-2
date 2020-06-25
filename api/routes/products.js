const express = require("express");
const router = express.Router();
const checkAuth = require('../middlewear/check-auth.js');
const mongoose = require('mongoose')
const Product = require('../models/product');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filname: function (req, file, cb) {
    cb(null, Date.now() + file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(null, false)
  };
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
    fileFilter: fileFilter
  }
});

// Handles general get requests
router.get("/", (req, res, next) => {
  Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: 'GET',
              url: `http://localhost:3000/products/${doc._id}`
            }
          }
        })
      }
      res.status(200).json(response)
    })
    .catch(err => {
      console.log(err)
    });
});

//Handles posts requests. Creates a new product and saves it to the database. Sends the created product object in the response

router.post("/", checkAuth, upload.single('productImage'), (req, res, next) => {
  console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId,
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });

  product
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Handling POST request to /products",
        createdProduct: {
          name: result.name,
          _id: result._id,
          request: {
            method: 'GET',
            url: 'http://localhost:3000/products/'
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err })
    })

});

// Handles get requests for a specific ID

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
      console.log(doc);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ message: "We couldn't find a product with that ID" })
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err })
    });

});

// Handles patch requests

router.patch("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {}
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  Product.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: 'Product updated',
        type: 'GET',
        url: 'http://localhost:3000/products/' + id
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// Handles delete requests

router.delete("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Product deleted',
        type: 'POST',
        url: 'http://localhost:3000/products/',
        data: { name: 'String', price: 'Number' }
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      })
    })
});

// Export

module.exports = router;
