const User = require("../models/user.js");


module.exports.renderSignupForm = (req,res) => {
    res.render("users/signup.ejs");
}


module.exports.signup =  async  (req,res) => {
    try{
        let {username, email,password} = req.body;
    const newUser = new User({email,username});
    const registedUser = await User.register(newUser,password);
    console.log(registedUser);
    req.login(registedUser, (err) => {
        if(err) {
            return next(err);
        }
        req.flash("success","Welcome to  Wanderlust");
        res.redirect("/listings");
    });
    }catch(e) {
        req.flash("error",e.message);
        res.redirect("/signup");
    }

}

module.exports.renderLoginForm =  (req,res) => {
    res.render("users/login.ejs");
}

module.exports.login = async (req,res) => {
    req.flash("success","Welcome back to Wanderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout =  (req,res,next) => {
    req.logout((err) => {
        if(err) {
           return next(err);
        }
        req.flash("success","You are logged Out!");
        res.redirect("/listings");
        

    })
}

module.exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }
        res.json({ success: true, message: 'Added to wishlist', wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
    }
};

module.exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user._id);
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();
        res.json({ success: true, message: 'Removed from wishlist', wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
    }
};

const { cloudinary } = require('../cloudConfig');

module.exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user._id.toString() !== id) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this profile" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { username, email, phoneNumber, oldPassword, newPassword, addresses } = req.body;

        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (addresses !== undefined) user.addresses = addresses;

        if (req.file) {
            if (user.profilePhoto && user.profilePhoto.filename) {
                await cloudinary.uploader.destroy(user.profilePhoto.filename);
            }
            user.profilePhoto = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        if (oldPassword && newPassword) {
            try {
                await user.changePassword(oldPassword, newPassword);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Old password is incorrect" });
            }
        }

        await user.save();
        
        // Remove salt and hash from response
        const userObj = user.toObject();
        delete userObj.salt;
        delete userObj.hash;

        res.json({ success: true, message: "Profile updated successfully", user: userObj });
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ success: false, message: err.message || "Failed to update profile" });
    }
};