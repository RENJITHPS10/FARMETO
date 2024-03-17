// Import necessary modules
const express = require("express");
const router = express.Router();
const buyerlogin = require("../models/buyer/buyerlogin");
const cookieAuth = require("../utils/auth");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

const productModel = require("../models/farmer/product");

router.get("/login", async (req, res) => {
    if (req.cookies.buyer) {
      const id = jwt.verify(req.cookies.buyer,process.env.JWT_SECRET_TOKEN);
      const findId = await buyerlogin.findByPk(id);
      if (findId) {
        res.redirect(`/buyer/${id}/dashboard`);
      } else {
        res.clearCookie("buyer");
        res.render("buyer/login", { wrongPassword: "", emailExist: false });
      }
    } else {
      res.render("buyer/login", { wrongPassword: "", emailExist: true });
    }
  });



  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const hashPassword = await buyerlogin.findOne({
        where: {
          email: email,
        },
      });
  
      if (!hashPassword) {
        res.render("../views/buyer/login", {
          emailExist: false,
          wrongPassword: false,
          email: email,
          password: password,
        });
      } else {
        bcrypt.compare(
          password,
          hashPassword?.dataValues?.password,
          (err, data) => {
            if (err) {
              res.json({ err: err });
            }
            if (data) {
              const jwtToken = cookieAuth(hashPassword?.dataValues?.id);
              res.cookie("buyer", jwtToken, {
                expires: new Date(Date.now() + 172800 * 1000),
                secure: true,
                httpOnly: true,
              });
              res.redirect(`/buyer/${hashPassword?.dataValues?.id}/dashboard`);
            } else {
              res.render("../views/buyer/login", {
                emailExist: true,
                wrongPassword: true,
                email: email,
                password: password,
              });
            }
          }
        );
      }
    } catch (err) {
      res.json({ err: err.message });
    }
  });
  

  router.get("/signup", async (req, res) => {
    if (req.cookies.buyer) {
      const id = jwt.verify(req.cookies.buyer,process.env.JWT_SECRET_TOKEN );
      const findId = await buyerlogin.findByPk(id);
      if (findId) {
        res.redirect(`/buyer/${id}/dashboard`);
      } else {
        res.clearCookie("buyer");
        res.render("buyer/signup", { emailExist: false, wrongPassword: false });
      }
    } else {
      res.render("buyer/signup", { emailExist: false, wrongPassword: false });
    }
  });

  router.post("/signup", async (req, res) => {
    const { name, email, password, confirm, district } = req.body;
  
  
    if (password !== confirm) {
      res.render("../views/buyer/signup", {
        emailExist: false,
        wrongPassword: true,
        email: email,
        district:district,
        password: password,
        confirm: confirm,
        name: name,
        
      });
    } else {
      const result = await buyerlogin.findOne({
        where: {
          email: email,
        },
      });
  
      if (result) {
        res.render("../views/buyer/signup", {
          emailExist: true,
          wrongPassword: false,
          email: email,
          district:district,
          password: password,
          confirm: confirm,
          name: name,
          
        });
      } else {
        bcrypt.hash(password, 12, async (err, hashedPassword) => {
          if (err) {
            res.json({ err: err.message });
          } else {
            const data = await buyerlogin
              .create({
                email: email,
                password: hashedPassword,
                name: name,
                district:district
            
              })
              .then((data) => {
                const jwtToken = cookieAuth(data.dataValues.id);
                res.cookie("buyer", jwtToken, {
                  expires: new Date(Date.now() + 172800 * 1000),
                  secure: true,
                  httpOnly: true,
                });
  
                res.redirect(`/buyer/${data.dataValues.id}/dashboard`);
              });
          }
        });
      }
    }
  });

  router.get("/:id/dashboard", async (req, res) => {
    const { id } = req.params;
    if (req.cookies.buyer) {
      const findprofile = await buyerlogin.findByPk(id);
  
      if (findprofile) {
          const products = await productModel.findAll({
            where: {
              district: findprofile.dataValues.district,
            },
            order: [["createdAt", "DESC"]],
          });
          res.render("buyer/dashboard", {
            profile: findprofile.dataValues, 
            products: products,
           });
      } else {
        res.clearCookie("buyer");
        res.redirect("/buyer/login");
      }
    } else {
      res.redirect("/buyer/login");
    }
  });

  router.get("/:id/dashboard/product/:product", async (req, res) => {
    const { id, product } = req.params;
    if (req.cookies.buyer) {
      console.log("correct");
      const token = jwt.verify(req.cookies.buyer, process.env.JWT_SECRET_TOKEN);
      const findId = await buyerlogin.findByPk(token);
  
      if (!findId) {
        res.clearCookie("buyer");
        res.redirect(`/buyer/login`);
      } else {
        const findproduct = await productModel.findByPk(product);
        
        if (!findproduct) {
          res.redirect(`/user/${id}/dashboard`);
        } else {
          res.render("../views/buyer/productdetails", {
            profile:findId.dataValues,
            product: findproduct.dataValues,
            id: id,
            
          });
        }
      }
    } else {
      res.redirect("/buyer/login");
    }
  });


  router.get("/:id/dashboard/profile", async (req, res) => {
    const { id } = req.params;
    if (req.cookies.buyer) {
      const findId = await buyerlogin.findByPk(id);
      if (findId) {
        res.render("buyer/profile", { profile: findId.dataValues });
      } else {
        res.redirect("/buyer/login");
      }
    } else {
      res.clearCookie("buyer");
      res.redirect("/buyer/login");
    }
  });

  router.post("/:id/dashboard/profile", async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const { email, name, district } = req.body;
    const profile = await buyerlogin.findByPk(id);
    const findEmail = await buyerlogin.findAll({
      where: {
        email: email,
      },
    });
  
    if (findEmail.length > 1) {
      res.render("../views/buyer/profile", {
        profile: profile.dataValues,
       
      });
    } else {
      const updateProfile = await buyerlogin
        .update(req.body, {
          where: {
            id: id,
          },
        })
        .then(() => {
          res.redirect(`/buyer/${id}/dashboard/profile`);
        })
        .catch((err) => {
          res.json({ err: err.message });
        });
    }
  });


  //cart 

  router.get("/:id/dashboard/cart", async (req, res) => {
    const { id } = req.params;
    if (req.cookies.buyer) {
      const token = jwt.verify(req.cookies.buyer, process.env.JWT_SECRET_TOKEN);
      const findId = await buyerlogin.findByPk(token);
  
      if (!findId) {
        res.clearCookie("buyer");
        res.redirect(`/buyer/login`);
      } else {
        const buyerProfile = await buyerlogin.findByPk(id);
  
        if (!buyerProfile) {
          res.clearCookie("buyer");
          res.redirect("/buyer/login");
        } else {
          const savedProductIds = buyerProfile.dataValues.saved;
          const savedProducts = await productModel.findAll({
            where: {
              id: savedProductIds,
            },
          });
          res.render("../views/buyer/cart", {
            savedProducts: savedProducts,
            profile:buyerProfile
          });
        }
      }
    } else {
      res.redirect("/buyer/login");
    }
  });


  router.get("/:id/dashboard/save/:products", async (req, res) => {
    const { id, products } = req.params;
    if (req.cookies.buyer) {
      const token = jwt.verify(req.cookies.buyer, process.env.JWT_SECRET_TOKEN);
      const findId = await buyerlogin.findByPk(token);
  
      if (!findId) {
        res.clearCookie("buyer");
        res.redirect(`/buyer/login`);
      } else {
        const findBuyer = await buyerlogin.findByPk(id);
  
        if (!findBuyer) {
          res.clearCookie("buyer");
          res.redirect("/buyer/login");
        } else {
          let savedProductIds = findBuyer.dataValues.saved || [];
  
          if (!savedProductIds.includes(products)) {
            savedProductIds.push(products);
            const updatedBuyer = await buyerlogin.update(
              { saved: savedProductIds },
              { where: { id: id } }
            );
          }
          res.redirect(`/buyer/${id}/dashboard/cart`);
        }
      }
    } else {
      res.redirect("/buyer/login");
    }
  });

 
  // Route for removing a product from the cart page
router.get("/:id/dashboard/remove/:product", async (req, res) => {
  const { id, product } = req.params;
  if (req.cookies.buyer) {
    const token = jwt.verify(req.cookies.buyer, process.env.JWT_SECRET_TOKEN);
    const findId = await buyerlogin.findByPk(token);

    if (!findId) {
      res.clearCookie("buyer");
      res.redirect(`/buyer/login`);
    } else {
      const findBuyer = await buyerlogin.findByPk(id);

      if (!findBuyer) {
        res.clearCookie("buyer");
        res.redirect("/buyer/login");
      } else {
        let savedProductIds = findBuyer.dataValues.saved || [];

        // Check if the product exists in the saved products array
        if (savedProductIds.includes(product)) {
          // Remove the product from the saved products array
          savedProductIds = savedProductIds.filter((savedProduct) => savedProduct !== product);

          // Update the buyer's saved products list
          const updatedBuyer = await buyerlogin.update(
            { saved: savedProductIds },
            { where: { id: id } }
          );
        }
        res.redirect(`/buyer/${id}/dashboard/cart`);
      }
    }
  } else {
    res.redirect("/buyer/login");
  }
});
router.get("/:id/dashboard/filter", async (req, res) => {
  try {
    console.log("Working");
    const { id } = req.params;

    if (req.cookies.buyer) {
      console.log("correct");
      const token = jwt.verify(req.cookies.buyer, process.env.JWT_SECRET_TOKEN);
      const findId = await buyerlogin.findByPk(token);

      if (!findId) {
        res.clearCookie("buyer");
        res.redirect(`/buyer/login`);
      } else {
        const findId = await buyerlogin.findByPk(id);
        if (!findId) {
          res.clearCookie("buyer");
          res.redirect("/buyer/login");
        } else {
          let filterOptions = {};

          if (req.query.name) {
            filterOptions.name = {
              [Op.iLike]: `%${req.query.name}%`
            };
          }
          if (req.query.district) {
            filterOptions.district = {
              [Op.iLike]: `%${req.query.district}%`
            };
          }
          if (req.query.category) {
            filterOptions.category = {
              [Op.iLike]: `%${req.query.category}%`
            };
          }

          const filterProducts = await productModel.findAll({
            where: filterOptions,
            order: [["createdAt", "DESC"]],
          });

          res.render("../views/buyer/filter", {
            profile: findId.dataValues,
            products: filterProducts,
            id: id,
            name: req.query.name || "",
            district: req.query.district || "",
            category: req.query.category || "",
          });
        }
      }
    } else {
      res.redirect("/buyer/login");
    }
  } catch (err) {
    res.json({ err: err.message });
  }
});




  router.get("/:id/dashboard/logout", (req, res) => {
    const { id } = req.params;
  
    if (!req.cookies.buyer) {
      res.redirect("/buyer/login");
    } else {
      res.clearCookie("buyer");
      res.redirect("/buyer/login");
    }
  });


  module.exports = router;
