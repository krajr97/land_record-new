const express = require("express");
const router = express.Router();
const Lohan = require("../models/lohans");
const Bhalua = require("../models/bhaluas");
const Lutaut = require("../models/lutauts");
const Nath_nagar = require("../models/nath_nagars");
const User = require("../models/users");
var multer      = require('multer'); 
var path        = require('path');
const { check, validationResult } = require('express-validator');
const Json2csvParser = require("json2csv").Parser;
const fs = require('fs');
var csv         = require('csvtojson');
const { resourceLimits } = require("worker_threads");
const nath_nagars = require("../models/nath_nagars");

var storage = multer.diskStorage({  
  destination:(req,file,cb)=>{  
      cb(null,'./static/uploads');  
  },  
  filename:(req,file,cb)=>{  
      cb(null,file.originalname);  
  }  
});  
 
var uploads = multer({storage:storage});

// this is for check user login or not..
router.get("/", (req, res) => {
   // check whether we have a session
   if(req.session.user){
    // Redirect to log out.
    res.redirect("/dashboard");

}else{
    // Render the login page.
    res.render("login",{
        "errors":"",
        title: "Login Page",
        "isLoggedIn": false
    });
}
});

//Handling user login
router.post("/login",[
  check('email').notEmpty().withMessage('Email is required'),
  check('email').isEmail().withMessage('Invalid Email address'),
  check('password').notEmpty().withMessage('Password is required')
], async function (req, res) {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.render("login",{
      title: "Login Page",
      errors : errors.mapped(),
      isLoggedIn:false
  });
  }else{
  try {
    // check if the user exists
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      //check if password matches
      const result = req.body.password === user.password;
      if (result) {
         // set the session.
         req.session.user = user._id;
         res.redirect("/dashboard");
      } else {
        res.render("login",{
            title: "Login Page",
            "errors":"password doesn't match.",
            isLoggedIn:false
        });
      }
    } else {
      res.status(400);
        res.render("login",{
             title: "Login Page",
            "errors":"User doesn't exist",
            isLoggedIn:false
        });
    }
  } catch (error) {
    res.render("login",{
      title: "Login Page",
      "errors":error,
      isLoggedIn:false
    });
  }
}
});

// LOGOUT USER LOGIN
router.get('/logout',(req,res)=>{
   // clear the session.
   req.session.destroy();
   // Redirect to the login page.
   res.redirect("/");
  
})

router.get("/dashboard", async(req, res) => {
 if (req.session.user) {
    // Get the user.
   
    let user = await User.findById(req.session.user);
    let lohan_list = await Lohan.find().limit('10');
    let bhalua_list = await Bhalua.find().limit('10');
    var lohan_count = await Lohan.count();
    var bhalua_count = await Bhalua.count();
    var lutaut_count = await Lutaut.count();
    var nathNagar_count = await Nath_nagar.count();
       
      res.render("dashboard", {
        user        : user,
        title       : "Dashboad Page",
        lohan_list  : lohan_list,
        bhalua_list : bhalua_list,
        lohan_count : lohan_count,
        bhalua_count: bhalua_count,
        lutaut_count: lutaut_count,
        nathNagar_count: nathNagar_count,
        isLoggedIn: true
      });
    }else {
      // Redirect to the login page
      res.redirect("/");
     }
});

router.get("/lohan_list", async(req, res) => {
  if (req.session.user) {
  //   // Get the user.
  //   let user = await User.findById(req.session.user);
  
    Lohan.find().exec((err, lohan_list) => {
      if (err) {
        res.render("lohan_list",{
          title: "Lohan List",
          "error":err.message,
          isLoggedIn:false
      });
      } else {
        res.render("lohan_list", {
          title: "Lohan List",
          // name: user.first_name + ' ' + user.last_name,
          lohan_list: lohan_list,
          k_value :'',
          keshVal :'',
          isLoggedIn: true
        });
      }
    });
    }else{
      // Redirect to the login page
      res.redirect("/");
    }
});


router.get('/search_lohan', async (req,res)=>{  
  k_value = req.query.khata;
  keshVal = req.query.keshera;
  try {  
    Lohan.find({$and:[{khata:{'$regex':req.query.khata}},{keshera:{'$regex':req.query.keshera}}]},(err,lohan_list)=>{  
  if(err){  
    res.render("lohan_list",{
      title: "Lohan List",
      "error":err.message,
      isLoggedIn:false
  });
  }else{  
  res.render("lohan_list", {
    title      : "Lohan List",
    lohan_list : lohan_list,
    k_value    : k_value,
    keshVal    : keshVal,
    isLoggedIn : true
  }); 
  }  
  })  
  } catch (error) {  
    res.render("lohan_list",{
      title: "Lohan List",
      "error":error.message,
      isLoggedIn:false
  });
  }  
}); 


router.get("/bhalua_list", async(req, res) => {
   if (req.session.user) {
  //   // Get the user.
  //   let user = await User.findById(req.session.user);
    Bhalua.find().exec((err, bhalua_list) => {
      if (err) {
        res.render("bhalua_list",{
          title      : "Bhalua List",
          khata      : '',
          keshera    : '',
          "error"    : err.message,
          isLoggedIn : false
      });
      } else {
        res.render("bhalua_list", {
          title      : "Bhalua List",
          isLoggedIn : true,
          bhalua_list: bhalua_list,
          khata      : '',
          keshera    : '',
        });
      }
    });
  }else{
    // Redirect to the login page
    res.redirect("/");
  }
});

router.get('/search_bhalua', async (req,res)=>{  
  khata = req.query.khata;
  keshera = req.query.keshera;
  try {  
    Bhalua.find({$and:[{khata:{'$regex':req.query.khata}},{keshera:{'$regex':req.query.keshera}}]},(err,bhalua_list)=>{  
  if(err){  
    res.render("bhalua_list",{
      title: "Bhalua List",
      "error":err.message,
      isLoggedIn:false
  });
  }else{  
  res.render("bhalua_list", {
    title      : "Bhalua List",
    bhalua_list : bhalua_list,
    khata      : khata,
    keshera    : keshera,
    isLoggedIn : true
  }); 
  }  
  })  
  } catch (error) {  
    res.render("bhalua_list",{
      title: "Bhalua List",
      "error":error.message,
      isLoggedIn:false
  });
  }  
}); 
router.get("/lutaut_list", async(req, res) => {
  if (req.session.user) {
  //   // Get the user.
  //   let user = await User.findById(req.session.user);
    Lutaut.find().exec((err, lutaut_list) => {
      if (err) {
        res.render("lutaut_list",{
          title      : "Lutaut List",
          "error"    : err.message,
          isLoggedIn : false
      });
      } else {
        res.render("lutaut_list", {
          title      : "Lutaut List",
          khata      : '',
          keshera    : '',
          isLoggedIn : true,
          lutaut_list: lutaut_list,
        });
      }
    });
  }else{
    // Redirect to the login page
    res.redirect("/");
  }
});

router.get('/search_lutaut', async (req,res)=>{  
  khata   = req.query.khata;
  keshera = req.query.keshera;
  try {  
    Lutaut.find({$and:[{khata:{'$regex':req.query.khata}},{keshera:{'$regex':req.query.keshera}}]},(err,lutaut_list)=>{  
  if(err){  
    res.render("lutaut_list",{
      title      : "Lutaut List",
      "error"    : err.message,
      isLoggedIn : false
  });
  }else{  
  res.render("lutaut_list", {
    title       : "Lutaut List",
    lutaut_list : lutaut_list,
    khata       : khata,
    keshera     : keshera,
    isLoggedIn  : true
  }); 
  }  
  })  
  } catch (error) {  
    res.render("lutaut_list",{
      title      : "Lutaut List",
      "error"    : error.message,
      isLoggedIn : false
  });
  }  
}); 

router.get("/nathNagar_list", async(req, res) => {
  if (req.session.user) {
  //   // Get the user.
  //   let user = await User.findById(req.session.user);
    Nath_nagar.find().exec((err, nath_nagarList) => {
      if (err) {
        res.render("nathNagar_list",{
          title      : "Nath Nagar List",
          "error"    : err.message,
          isLoggedIn : false
      });
      } else {
        res.render("nathNagar_list", {
          title          : "Nath Nagar",
          khata          :'',
          keshera        : '',
          isLoggedIn     : true,
          nath_nagarList : nath_nagarList,
        });
      }
    });
  }else{
    // Redirect to the login page
    res.redirect("/");
  }
});

router.get('/search_nathNagar',async(req,res)=>{
  khata   = req.query.khata;
  keshera = req.query.keshera;
  try {  
    Lutaut.find({$and:[{khata:{'$regex':req.query.khata}},{keshera:{'$regex':req.query.keshera}}]},(err,nathNagar_list)=>{  
  if(err){  
    res.render("nathNagar_list",{
      title      : "Nath Nagar List",
      "error"    : err.message,
      isLoggedIn : false
    });
  }else{  
    res.render("nathNagar_list", {
      title          : "Lutaut List",
      nathNagar_list : nathNagar_list,
      khata          : khata,
      keshera        : keshera,
      isLoggedIn     : true
    }); 
  }  
  }) 
  }catch(error){
    res.render("nathNagar_list",{
      title      : "Nath Nagar List",
      "error"    : err.message,
      isLoggedIn : false
    });
  }

})

router.get("/add_village", (req, res) => {
 if(req.session.user){
    // Redirect to log out.    
    res.render("add_village",{
      "errors":"",
      title: "Add village",
      "isLoggedIn": false
  });
}else{
    // Render the login page.
    res.redirect("/");
}
});

//Insert an user into database route
router.post("/add",[
  check('village_name').notEmpty().withMessage('Village Name is required'),
  check('khata').notEmpty().withMessage('Khata is required'),
  check('keshera').notEmpty().withMessage('Keshera is required'),
  check('acre').notEmpty().withMessage('Acre is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.render("add_village",{
      title: "Add Village Page",
      errors : errors.mapped(),
      isLoggedIn:false
  });
}else{
  var village_name = req.body.village_name;
  if (village_name == 1) {
    let data = new Lohan({
      village_name: req.body.village_name,
      khata: req.body.khata,
      keshera: req.body.keshera,
      acre: req.body.acre,
      dismil: req.body.dismil,
      old_property_holder: req.body.old_property_holder,
      north: req.body.north,
      south: req.body.south,
      east: req.body.east,
      west: req.body.west,
      jamabandi: req.body.jamabandi,
      new_property_holder: req.body.new_property_holder,
      remarks: req.body.remarks,
    });   
    data.save((err) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
      } else {
        req.session.message = {
          type: "success",
          message: "Village added successfully !",
        };
        res.redirect("/add_village");
      }
    });
  } else if (village_name == 2) {
    let data = new Bhalua({
      village_name: req.body.village_name,
      khata: req.body.khata,
      keshera: req.body.keshera,
      acre: req.body.acre,
      dismil: req.body.dismil,
      old_property_holder: req.body.old_property_holder,
      north: req.body.north,
      south: req.body.south,
      east: req.body.east,
      west: req.body.west,
      jamabandi: req.body.jamabandi,
      new_property_holder: req.body.new_property_holder,
      remarks: req.body.remarks,
    });
    data.save((err) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
      } else {
        req.session.message = {
          type: "success",
          message: "Village added successfully !",
        };
        res.redirect("/add_village");
      }
    });
  
  } else if (village_name == 3) {
    let data = new Lutaut({
      village_name: req.body.village_name,
      khata: req.body.khata,
      keshera: req.body.keshera,
      acre: req.body.acre,
      dismil: req.body.dismil,
      old_property_holder: req.body.old_property_holder,
      north: req.body.north,
      south: req.body.south,
      east: req.body.east,
      west: req.body.west,
      jamabandi: req.body.jamabandi,
      new_property_holder: req.body.new_property_holder,
      remarks: req.body.remarks,
    });
    data.save((err) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
      } else {
        req.session.message = {
          type: "success",
          message: "Village added successfully !",
        };
        res.redirect("/add_village");
      }
    });
  } else if (village_name == 4) {
    let data = new Nath_nagar({
      village_name: req.body.village_name,
      khata: req.body.khata,
      keshera: req.body.keshera,
      acre: req.body.acre,
      dismil: req.body.dismil,
      old_property_holder: req.body.old_property_holder,
      north: req.body.north,
      south: req.body.south,
      east: req.body.east,
      west: req.body.west,
      jamabandi: req.body.jamabandi,
      new_property_holder: req.body.new_property_holder,
      remarks: req.body.remarks,
    });
    data.save((err) => {
      if (err) {
        // res.json({ message: err.message, type: "danger" });
        req.session.message = {
          type: "danger",
          message: err.message,
        };
      } else {
        req.session.message = {
          type: "success",
          message: "Village added successfully !",
        };
        res.redirect("/add_village");
      }
    });
  }
}
});

// EDIT LOHAN PAGE ACCESS BY ID 
router.get("/edit_lohan/:id", (req, res) => {
  let id = req.params.id;
  Lohan.findById(id, (err, lohan) => {
    if (err) {
      res.redirect("/lohan_list");
    } else {
      if (lohan == null) {
        res.redirect("/lohan_list");
      } else {
        res.render("edit_lohan", {
          title: "Edit Lohan",
          errors :'',
          lohan: lohan,
        });
      }
    }
  });
});

// UPDATE LOHAN DATA BY ID
router.post("/update_lohan/:id",(req, res) => {
  let id = req.params.id;
  Lohan.findByIdAndUpdate(
    id,
    {
      village_name: req.body.village_name,
      khata: req.body.khata,
      keshera: req.body.keshera,
      acre: req.body.acre,
      dismil: req.body.dismil,
      old_property_holder: req.body.old_property_holder,
      north: req.body.north,
      south: req.body.south,
      east: req.body.east,
      west: req.body.west,
      jamabandi: req.body.jamabandi,
      new_property_holder: req.body.new_property_holder,
      remarks: req.body.remarks,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "Lohan update successfully !",
        };
        res.redirect("/lohan_list");
      }
    }
  );
});

// DELETE THE LOHAN LIST
router.get("/delete_lohan/:id", async (req, res) => {
  let id = req.params.id;
  Lohan.findByIdAndRemove(id, (err, result) => {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      req.session.message = {
        type: "info",
        message: "Lohan delete successfully !",
      };
      res.redirect("/lohan_list");
    }
  });
});

// EDIT BHALUA PAGE ACCESS BY ID 
router.get("/edit_bhalua/:id", (req, res) => {
  let id = req.params.id;
  Bhalua.findById(id, (err, bhalua) => {
    if (err) {
      res.redirect("/bhalua_list");
    } else {
      if (bhalua == null) {
        res.redirect("/bhalua_list");
      } else {
        res.render("edit_bhalua", {
          title: "Edit Bhalua",
          bhalua: bhalua,
        });
      }
    }
  });
});

// UPDATE BHALUA DATA BY ID
router.post("/update_bhalua/:id", (req, res) => {
  let id = req.params.id;
  Bhalua.findByIdAndUpdate(
    id,
    {
      village_name: req.body.village_name,
      khata: req.body.khata,
      keshera: req.body.keshera,
      acre: req.body.acre,
      dismil: req.body.dismil,
      old_property_holder: req.body.old_property_holder,
      north: req.body.north,
      south: req.body.south,
      east: req.body.east,
      west: req.body.west,
      jamabandi: req.body.jamabandi,
      new_property_holder: req.body.new_property_holder,
      remarks: req.body.remarks,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "Bhalua update successfully !",
        };
        res.redirect("/bhalua_list");
      }
    }
  );
});

// DELETE THE BHALUA LIST
router.get("/delete_bhalua/:id", async (req, res) => {
  let id = req.params.id;
  Bhalua.findByIdAndRemove(id, (err, result) => {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      req.session.message = {
        type: "info",
        message: "Bhalua delete successfully !",
      };
      res.redirect("/bhalua_list");
    }
  });
});

// EDIT LUTAUT PAGE ACCESS BY ID  
router.get("/edit_lutaut/:id", (req, res) => {
  let id = req.params.id;
  Lutaut.findById(id, (err, lutaut) => {
    if (err) {
      res.redirect("/lutaut_list");
    } else {
      if (lutaut == null) {
        res.redirect("/lutaut_list");
      } else {
        res.render("edit_lutaut", {
          title: "Edit Lutaut",
          lutaut: lutaut,
        });
      }
    }
  });
});

// UPDATE LUTAUT DATA BY ID
router.post("/update_lutaut/:id", (req, res) => {
  let id = req.params.id;
  Lutaut.findByIdAndUpdate(
    id,
    {
      village_name: req.body.village_name,
      khata: req.body.khata,
      keshera: req.body.keshera,
      acre: req.body.acre,
      dismil: req.body.dismil,
      old_property_holder: req.body.old_property_holder,
      north: req.body.north,
      south: req.body.south,
      east: req.body.east,
      west: req.body.west,
      jamabandi: req.body.jamabandi,
      new_property_holder: req.body.new_property_holder,
      remarks: req.body.remarks,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "Lutaut update successfully !",
        };
        res.redirect("/lutaut_list");
      }
    }
  );
});

// DELETE THE LUTAUT LIST
router.get("/delete_lutaut/:id", async (req, res) => {
  let id = req.params.id;
  Lutaut.findByIdAndRemove(id, (err, result) => {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      req.session.message = {
        type: "info",
        message: "Lutaut delete successfully !",
      };
      res.redirect("/lutaut_list");
    }
  });
});

// EDIT PAGE NATH NAGAR BY ID
router.get("/edit_nath_nagar/:id", (req, res) => {
  let id = req.params.id;
  Nath_nagar.findById(id, (err, nath_nagar) => {
    if (err) {
      res.redirect("/nathNagar_list");
    } else {
      if (nath_nagar == null) {
        res.redirect("/nathNagar_list");
      } else {
        res.render("edit_nath_nagar", {
          title: "Edit Nath Nagar",
          nath_nagar: nath_nagar,
        });
      }
    }
  });
});

// UPDATE NATH NAGAR DATA BY ID
router.post("/update_nathNagar/:id", (req, res) => {
  let id = req.params.id;
  Nath_nagar.findByIdAndUpdate(
    id,
    {
      village_name: req.body.village_name,
      khata: req.body.khata,
      keshera: req.body.keshera,
      acre: req.body.acre,
      dismil: req.body.dismil,
      old_property_holder: req.body.old_property_holder,
      north: req.body.north,
      south: req.body.south,
      east: req.body.east,
      west: req.body.west,
      jamabandi: req.body.jamabandi,
      new_property_holder: req.body.new_property_holder,
      remarks: req.body.remarks,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "Nath nagar update successfully !",
        };
        res.redirect("/nathNagar_list");
      }
    }
  );
});

// DELETE THE NATH NAGAR LIST
router.get("/delete_nathNagar/:id", async (req, res) => {
  let id = req.params.id;
  Nath_nagar.findByIdAndRemove(id, (err, result) => {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      req.session.message = {
        type: "info",
        message: "Nath nagar delete successfully !",
      };
      res.redirect("/nathNagar_list");
    }
  });
});

// This route for access the import view list page.
router.get("/import_village", (req, res) => {
  if(req.session.user){
    res.render("import_village",{
        "errors":"",
        title: "Import village",
        "isLoggedIn": false
    });
  }else{
    // Render the login page.
    res.redirect("/");
  }
  });

//THIS ROUTE FOR IMPORT THE DATA INTO THE DATABASE..
router.post('/import_village',uploads.single('csv'),(req,res)=>{  
  //convert csvfile to jsonArray     
 csv()  
 .fromFile(req.file.path)  
 .then((jsonObj)=>{  
  var vn = '';
    // console.log(jsonObj); 
    jsonObj.forEach((row,index)=>{
       vn = row.village_name
    });
    
    if (vn == 1) {
      Lohan.insertMany(jsonObj,(err,data)=>{  
             if(err){  
                req.session.message = {
                  type: "danger",
                  message: "Village not added",
                };  
             }else{  
                req.session.message = {
                  type: "success",
                  message: "Village added successfully !",
                };
                res.redirect('/lohan_list');  
             }  
      });
    } else if (vn == 2) {
      Bhalua.insertMany(jsonObj,(err,data)=>{  
        console.log(data);
             if(err){  
                req.session.message = {
                  type: "danger",
                  message: "Village not added",
                };  
             }else{ 
                req.session.message = {
                  type: "success",
                  message: "Village added successfully !",
                }; 
                res.redirect('/bhalua_list');  
             }  
      });
    
    } else if (vn == 3) {
      Lutaut.insertMany(jsonObj,(err,data)=>{  
        console.log(data);
             if(err){  
                req.session.message = {
                  type: "danger",
                  message: "Village not added",
                };
             }else{ 
                req.session.message = {
                  type: "success",
                  message: "Village added successfully !",
                }; 
                res.redirect('/Lutaut_list');  
             }  
      });
    } else if (vn == 4) {
      nathNagar.insertMany(jsonObj,(err,data)=>{  
        console.log(data);
             if(err){  
                req.session.message = {
                  type: "danger",
                  message: "Village not added",
                };  
             }else{ 
                req.session.message = {
                  type: "success",
                  message: "Village added successfully !",
                }; 
                res.redirect('/nathNagar_list');  
             }  
      });
    } 
    });  
 });  

router.get('/export_lohans', async (req, res) => {
  try{

    let lohans =[];
    let vs = '';
    let cdate = '';
    var lohanData = await Lohan.find({});
    
    lohanData.forEach((lohan) =>{
       const {village_name,khata,keshera,acre,dismil,old_property_holder,north,south,east,west,jamabandi,new_property_holder,remarks,created} = lohan;
       if(lohan.village_name  == "1"){
         vs = 'Lohan';
       }else if(lohan.village_name  == "2"){
        vs = 'Bhalua';
       }else if(lohan.village_name  == "3"){
        vs = 'Lutaut';
       }else{
        vs = 'Nath Nagar';
       }

       cdate = created.toLocaleDateString();
       lohans.push({ vs,khata,keshera,acre,dismil,old_property_holder,north,south,east,west,jamabandi,new_property_holder,remarks,cdate })
    });
   // console.log(lohanData);
    const csvFields = ['Village Name','Khata','Keshera','Acre','Dismil','Old Property Holder','North','South','East','West','Jamabandi','New Property Holder','Remarks','Created']
    var json_data = new Json2csvParser({csvFields});
    var csv_data = json_data.parse(lohans);
    
    res.setHeader("Content-Type", "text/csv");

    res.setHeader("Content-Disposition", "attachment; filename = lohan_list.csv");

    res.status(200).end(csv_data);
    
  }catch(error){
    res.send({ status:400,success:false,msg:error.message});
  }
});
 router.get('/export_bhalua', async (req, res) => {
  try{

    let bhaluas =[];
    let villageName = '';
    let cdate = '';
    var bhaluaData = await Bhalua.find({});
    
    bhaluaData.forEach((bhalua) =>{
       const {village_name,khata,keshera,acre,dismil,old_property_holder,north,south,east,west,jamabandi,new_property_holder,remarks,created} = bhalua;
       if(bhalua.village_name  == "1"){
        villageName = 'Lohan';
       }else if(bhalua.village_name  == "2"){
        villageName = 'Bhalua';
       }else if(bhalua.village_name  == "3"){
        villageName = 'Lutaut';
       }else{
        villageName = 'Nath Nagar';
       }

       cdate = created.toLocaleDateString();
       bhaluas.push({ villageName,khata,keshera,acre,dismil,old_property_holder,north,south,east,west,jamabandi,new_property_holder,remarks,cdate })
    });
   // console.log(lohanData);
    const csvFields = ['Village Name','Khata','Keshera','Acre','Dismil','Old Property Holder','North','South','East','West','Jamabandi','New Property Holder','Remarks','Created']
    var json_data   = new Json2csvParser({csvFields});
    var csv_data    = json_data.parse(bhaluas);

    res.setHeader("Content-Type", "text/csv");

    res.setHeader("Content-Disposition", "attachment; filename = bhalua_list.csv");

    res.status(200).end(csv_data);
    
  }catch(error){
    res.send({ status:400,success:false,msg:error.message});
  }
});
 router.get('/export_lutaut', async (req, res) => {
  try{

    let lutauts =[];
    let villageName = '';
    let cdate = '';
    var lutautData = await Lutaut.find({});
    
    lutautData.forEach((lutaut) =>{
       const {village_name,khata,keshera,acre,dismil,old_property_holder,north,south,east,west,jamabandi,new_property_holder,remarks,created} = lutaut;
       if(lutaut.village_name  == "1"){
        villageName = 'Lohan';
       }else if(lutaut.village_name  == "2"){
        villageName = 'Bhalua';
       }else if(lutaut.village_name  == "3"){
        villageName = 'Lutaut';
       }else{
        villageName = 'Nath Nagar';
       }

       cdate = created.toLocaleDateString();
       lutauts.push({ villageName,khata,keshera,acre,dismil,old_property_holder,north,south,east,west,jamabandi,new_property_holder,remarks,cdate })
    });
   // console.log(lohanData);
    const csvFields = ['Village Name','Khata','Keshera','Acre','Dismil','Old Property Holder','North','South','East','West','Jamabandi','New Property Holder','Remarks','Created']
    var json_data   = new Json2csvParser({csvFields});
    var csv_data    = json_data.parse(lutauts);

    res.setHeader("Content-Type", "text/csv");

    res.setHeader("Content-Disposition", "attachment; filename = lutaut_list.csv");

    res.status(200).end(csv_data);
    
  }catch(error){
    res.send({ status:400,success:false,msg:error.message});
  }
});
router.get('/export_nathNagar', async (req, res) => {
  try{

    let nathNagars =[];
    let villageName = '';
    let cdate = '';
    var NathNagarData = await Nath_nagar.find({});
    
    NathNagarData.forEach((nathNagar) =>{
       const {village_name,khata,keshera,acre,dismil,old_property_holder,north,south,east,west,jamabandi,new_property_holder,remarks,created} = nathNagar;
       if(nathNagar.village_name  == "1"){
        villageName = 'Lohan';
       }else if(nathNagar.village_name  == "2"){
        villageName = 'Bhalua';
       }else if(nathNagar.village_name  == "3"){
        villageName = 'Lutaut';
       }else{
        villageName = 'Nath Nagar';
       }

       cdate = created.toLocaleDateString();
       nathNagars.push({ villageName,khata,keshera,acre,dismil,old_property_holder,north,south,east,west,jamabandi,new_property_holder,remarks,cdate })
    });
   // console.log(lohanData);
    const csvFields = ['Village Name','Khata','Keshera','Acre','Dismil','Old Property Holder','North','South','East','West','Jamabandi','New Property Holder','Remarks','Created']
    var json_data   = new Json2csvParser({csvFields});
    var csv_data    = json_data.parse(nathNagars);

    res.setHeader("Content-Type", "text/csv");

    res.setHeader("Content-Disposition", "attachment; filename = NathNagar_list.csv");

    res.status(200).end(csv_data);
    
  }catch(error){
    res.send({ status:400,success:false,msg:error.message});
  }
});


// router.get('/export_lohan', async (req, res) => {
//   await Lohan.find({}).lean().exec((err, data) => {
//       if (err) throw err;
//       const csvFields = ['Village Name','Khata','Keshera','Acre','Dismil','Old Property Holder','North','South','East','West','Jamabandi','New Property Holder','Remarks','Created']
     
//       var json_data = new Json2csvParser({csvFields});

//       var csv_data = json_data.parse(data);

//       res.setHeader("Content-Type", "text/csv");

//       res.setHeader("Content-Disposition", "attachment; filename = lohan_list.csv");

//       res.status(200).end(csv_data);
      
//   });
// });

module.exports = router;
