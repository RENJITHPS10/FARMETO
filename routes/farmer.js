require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cookieAuth = require("../utils/auth");
const bcrypt = require("bcrypt");
const cloudinaryConfig = require("../config/cloudinary.config");

const multer = require("multer");

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


//models
const farmerlogin = require("../models/farmer/farmerlogin");
const productModel = require("../models/farmer/product");
const verification = require("../models/admin/verification");
router.get("/login", async (req, res) => {
    if (req.cookies.farmer) {
      const id = jwt.verify(req.cookies.farmer,process.env.JWT_SECRET_TOKEN);
      const findId = await farmerlogin.findByPk(id);
      if (findId) {
        res.redirect(`/farmer/${id}/dashboard`);
      } else {
        res.clearCookie("farmer");
        res.render("farmer/login", { wrongPassword: "", emailExist: false });
      }
    } else {
      res.render("farmer/login", { wrongPassword: "", emailExist: true });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const hashPassword = await farmerlogin.findOne({
        where: {
          email: email,
        },
      });
  
      if (!hashPassword) {
        res.render("../views/farmer/login", {
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
              res.cookie("farmer", jwtToken, {
                expires: new Date(Date.now() + 172800 * 1000),
                secure: true,
                httpOnly: true,
              });
              res.redirect(`/farmer/${hashPassword?.dataValues?.id}/dashboard`);
            } else {
              res.render("../views/farmer/login", {
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
    if (req.cookies.farmer) {
      const id = jwt.verify(req.cookies.farmer,process.env.JWT_SECRET_TOKEN );
      const findId = await farmerlogin.findByPk(id);
      if (findId) {
        res.redirect(`/farmer/${id}/dashboard`);
      } else {
        res.clearCookie("farmer");
        res.render("farmer/signup", { emailExist: false, wrongPassword: false });
      }
    } else {
      res.render("farmer/signup", { emailExist: false, wrongPassword: false });
    }
  });

  router.post("/signup", upload.single("file"), async (req, res) => {
    try {
        const {
            name, email, password, confirm, pincode, contactNumber, district, village, street, houseNo, location
        } = req.body;

        // Check if passwords match
        if (password !== confirm) {
            // If passwords don't match, render register view with passwordError flag
            return res.render("../views/farmer/signup", {
              wrongPassword: true,
              emailExist: false,
              email:email,
                name: name,
                pincode: pincode,
                contactNumber: contactNumber,
                district: district,
                village: village,
                street: street,
                houseNo: houseNo,
                location: location,
            });
        }

        // Check if email already exists in the database
        const result = await farmerlogin.findOne({
            where: {
                email: email,
            },
        });

        if (result) {
            // If email exists, render register view with emailExist flag
            return res.render("../views/farmer/signup", {
                emailExist: true,
                wrongPassword : false,
                email: email,
                name: name,
                pincode: pincode,
                contactNumber: contactNumber,
                district: district,
                village: village,
                street: street,
                houseNo: houseNo,
                location: location,
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.json({ err: 'No file uploaded' });
        }

        // Hash the password
        bcrypt.hash(password, 12, async (err, hashedPassword) => {
            if (err) {
                return res.json({ err: err.message });
            }
            try {
                // Convert file buffer to base64 and upload the file
                const fileBuffer = req.file.buffer.toString("base64");
                const fileUpload = await cloudinaryConfig.uploader.upload(
                    `data:image/png;base64,${fileBuffer}`, {
                        folder: "/upload",
                        public_id: Date.now() + "-" + req.file.originalname,
                        encoding: "base64",
                    }
                );

                // Create new user record with hashed password and uploaded file details
                const data = await verification.create({
                    email: email,
                    password: hashedPassword, // Store hashed password
                    name: name,
                    pincode: pincode,
                    contactNumber: contactNumber,
                    district: district,
                    village: village,
                    street: street,
                    houseNo: houseNo,
                    location: location,
                    proof: fileUpload.secure_url,
                });

                // Render success message view
                res.render("../views/farmer/message");
            } catch (error) {
                res.json({ err: error.message });
            }
        });
    } catch (error) {
        // Handle errors
        res.json({ err: error.message });
    }
});

//dashboard
router.get("/:id/dashboard", async (req, res) => {
  const { id } = req.params;

  if (req.cookies.farmer) {
    const verify = jwt.verify(
      req.cookies.farmer,
      process.env.JWT_SECRET_TOKEN
    );
    const checkId = await farmerlogin.findByPk(verify);

    if (!checkId) {
      res.clearCookie("farmer");
      return res.redirect("/farmer/login");
    } else {
      const dashboard = await farmerlogin.findByPk(id);
      const products = await productModel.findAll({
        where: {
          farmerId: id,
        },
        order: [["createdAt", "DESC"]],
      });

      if (!dashboard) {
        res.clearCookie("farmer");
        return res.redirect("/farmer/login");
      } else {
        res.render("../views/farmer/dashboard", { dashboard, products });
      }
    }
  } else {
    res.redirect("/farmer/login");
  }
});




router.get("/:id/dashboard/profile", async (req, res) => {
  const { id } = req.params;

  if (req.cookies.farmer) {
    const verify = jwt.verify(
      req.cookies.farmer,
      process.env.JWT_SECRET_TOKEN
    );
    const checkId = await farmerlogin.findByPk(verify);

    if (!checkId) {
      res.clearCookie("farmer");
      res.redirect("/farmer/login");
    } else {
      const profile = await farmerlogin.findByPk(id);

      if (!profile) {
        res.clearCookie("farmer");
        res.redirect("/farmer/login");
      } else {
        res.render("../views/farmer/profile", {
          profile: profile.dataValues,
        });
      }
    }
  } else {
    res.redirect("/farmer/login");
  }
});

//update profile




// add product

router.get("/:id/dashboard/add", async (req, res) => {
  const { id } = req.params;
  if (req.cookies.farmer) {
    const verify = jwt.verify(
      req.cookies.farmer,
      process.env.JWT_SECRET_TOKEN
    );
    const checkId = await farmerlogin.findByPk(verify);

    if (!checkId) {
      res.clearCookie("farmer");
      res.redirect("/farmer/login");
    } else {
      const profile = await farmerlogin.findByPk(id); 
      if (!profile) {
        res.clearCookie("farmer");
        res.redirect("/farmer/login");
      } else {
        res.render("../views/farmer/add", {   profile: profile.dataValues,});
      }
    }
  } else {
    res.redirect("/farmer/login");
  }
});

router.post("/:id/dashboard/add", upload.single("image"), async (req, res) => {
  const { id } = req.params;

  const {
    name,
    description,
    price,
    quantity,
    category
  } = req.body;

  if (req.cookies.farmer) {
    try {
      const verify = jwt.verify(req.cookies.farmer, process.env.JWT_SECRET_TOKEN);
      const checkId = await farmerlogin.findByPk(verify);

      if (!checkId) {
        res.clearCookie("farmer");
        return res.redirect("/farmer/login");
      }

      const findFarmer = await farmerlogin.findByPk(id);

      if (!findFarmer) {
        res.clearCookie("farmer");
        return res.redirect("/farmer/login");
      }

      const fileBuffer = req.file.buffer.toString("base64");
      const fileUpload = await cloudinaryConfig.uploader.upload(`data:image/png;base64,${fileBuffer}`, {
        folder: "/products",
        public_id: Date.now() + "-" + req.file.originalname,
        encoding: "base64",
      });

      // Create the product with details fetched from farmerlogin
      const product = await productModel.create({
        name: name,
        description: description,
        price: price,
        quantity: quantity,
        image: fileUpload.secure_url,
        farmerId: id,
        category: category,
        // Automatically fill other details from farmerlogin
        contactNumber: findFarmer.contactNumber,
        pincode: findFarmer.pincode,
        district: findFarmer.district,
        village: findFarmer.village,
        street: findFarmer.street,
        location: findFarmer.location,
        houseNo: findFarmer.houseNo,
      });

      res.redirect(`/farmer/${id}/dashboard`);
    } catch (error) {
      console.error("Error:", error);
      res.redirect("/farmer/login");
    }
  } else {
    res.redirect("/farmer/login");
  }
});


//view product

router.get("/:id1/dashboard/add/:id2", async (req, res) => {
  const { id1, id2 } = req.params;
  if (req.cookies.farmer) {
    const verify = jwt.verify(
      req.cookies.farmer,
      process.env.JWT_SECRET_TOKEN
    );
    const checkId = await farmerlogin.findByPk(verify);

    if (!checkId) {
      res.clearCookie("farmer");
      res.redirect("/farmer/login");
    } else {
      const profile = await farmerlogin.findByPk(id1);

      if (!profile) {
        res.clearCookie("farmer");
        res.redirect("/farmer/login");
      } else {
        const viewproduct = await productModel.findByPk(id2);

        if (!viewproduct ) {
          res.redirect(`/farmer/${id1}/dashboard`);
        } else {
          res.render("../views/farmer/viewProduct", {
            id1: id1,
            profile:viewproduct.dataValues,
          });
        }
      }
    }
  } else {
    res.redirect("/publisher/login");
  }
});

//update product

router.get("/:id1/dashboard/add/:id2/update", async (req, res) => {
  const { id1, id2 } = req.params;
  if (req.cookies.farmer) {
    const verify = jwt.verify(
      req.cookies.farmer,
      process.env.JWT_SECRET_TOKEN
    );
    const checkId = await farmerlogin.findByPk(verify);

    if (!checkId) {
      res.clearCookie("farmer");
      res.redirect("/farmer/login");
    } else {
      const validfarmer = await farmerlogin.findByPk(id1);
      if (!validfarmer) {
        res.redirect(`/farmer/${id1}/dashboard`);
      } else {
        const findproduct = await productModel.findByPk(id2);
  
        if (!findproduct) {
          res.redirect(`/farmer/${id1}/dashboard`);
        } else {
          res.render("../views/farmer/updateproduct", {
            product: findproduct.dataValues,
            id1: id1,
          });
        }
      }
    }
  } else {
    res.redirect("/farmer/login");
  }
});


router.post(
  "/:id1/dashboard/add/:id2/update",
  upload.single("image"),
  async (req, res) => {
    const { id1, id2 } = req.params;
    const {
      name,
      description,
      price,
      quantity,
      category,
    } = req.body;
    if (req.cookies.farmer) {
      const verify = jwt.verify(
        req.cookies.farmer,
        process.env.JWT_SECRET_TOKEN
      );
      const checkId = await farmerlogin.findByPk(verify);

      if (!checkId) {
        res.clearCookie("farmer");
        res.redirect("/farmer/login");
      } else {
        const findfarmer = await farmerlogin.findByPk(id1);
        if (!findfarmer) {
          res.redirect(`/farmer/${id1}/dashboard`);
        } else {
          const findproduct = await productModel.findByPk(id2);
          if (!findproduct) {
            res.redirect(`/farmer/${id1}/dashboard`);
          } else {
            
            if (!req.file) {
              findproduct
                .update({
                  name: name,
                  description: description,
                  quantity:quantity,
                  price:price,
                  category:category,
                })
                .then(() => {
                  res.redirect(`/farmer/${id1}/dashboard`);
                })
                .catch((err) => {
                  res.json({ err: err });
                });
            } else {
              const fileBuffer = req.file.buffer.toString("base64");
              const fileUpload = await cloudinaryConfig.uploader.upload(
                `data:image/png;base64,${fileBuffer}`,
                {
                  folder: "/products",
                  public_id: Date.now() + "-" + req.file.originalname,
                  encoding: "base64",
                }
              );

              findproduct
                .update({
                  name: name,
                  description: description,
                  quantity:quantity,
                  price:price,
                  category:category,
                  image: fileUpload.secure_url,
                  
                  
                })
                .then(() => {
                  res.redirect(`/farmer/${id1}/dashboard`);
                })
                .catch((err) => {
                  res.json({ err: err });
                });
            }
          }
        }
      }
    } else {
      res.redirect("/farmer/login");
    }
  }
);

//delete a product

router.get("/:id1/dashboard/add/:id2/delete", async (req, res) => {
  const { id1, id2 } = req.params;
  if (req.cookies.farmer) {
    const verify = jwt.verify(
      req.cookies.farmer,
      process.env.JWT_SECRET_TOKEN
    );
    const checkId = await farmerlogin.findByPk(verify);

    if (!checkId) {
      res.clearCookie("farmer");
      res.redirect("/farmer/login");
    } else {
      const farmer = await farmerlogin.findByPk(id1);

      if (!farmer) {
        res.redirect(`/farmer/${id1}/dashboard`);
      } else {
        const deleteproduct = await productModel.findByPk(id2);
        if (!deleteproduct) {
          res.redirect(`/farmer/${id1}/dashboard`);
        } else {
          deleteproduct.destroy();
          res.redirect(`/farmer/${id1}/dashboard`);
        }
      }
    }
  } else {
    res.redirect("/farmer/login");
  }
});


router.get("/:id/dashboard/logout", (req, res) => {
  const { id } = req.params;

  if (!req.cookies.farmer) {
    res.redirect("/farmer/login");
  } else {
    res.clearCookie("farmer");
    res.redirect("/farmer/login");
  }
});









module.exports=  router;