const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");


//REGISTER
    router.post("/register", async (req, res) => {


    const newUser = new User({
    name: req.body.name,
    lastname: req.body.lastname,
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(req.body.password,process.env.PASS_SEC).toString(),
    confirmPassword: CryptoJS.AES.encrypt(req.body.confirmPassword,process.env.PASS_SEC).toString(),
    
  });

  try {

    const inputPassword = req.body.password;
    const inputConfirmPassword = req.body.confirmPassword;
        
    inputPassword != inputConfirmPassword && 
            res.status(401).json("Passwords must be same");
    
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);


  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post('/login', async (req, res) => {
    try{
        const user = await User.findOne(
            {
                username: req.body.username
            }
        );

        !user && res.status(401).json("Wrong User Name"); 

        const hashedPassword = CryptoJS.AES.decrypt(
            user.password,
            process.env.PASS_SEC
        );

        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        const inputPassword = req.body.password;
        
        originalPassword != inputPassword && 
            res.status(401).json("Wrong Password");

        const accessToken = jwt.sign(
        {
            id: user.id,
            isAdmin: user.isAdmin,
        },
        process.env.JWT_SEC,
            {expiresIn:"3d"}
        );
  
        const { password, ...others } = user._doc;  
        res.status(200).json({...others, accessToken})
        // .redirect('/'); 
        // // res.redirect('/')
        // // console.log(open)
        // // location.assign('/');
        
        // res.redirect('/')
        // }
    } catch (err){res.status(500).json(err);
        
    }

});

module.exports = router;
