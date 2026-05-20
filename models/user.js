const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        sparse: true
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    phoneNumber: {
        type: String,
        sparse: true
    },
    addresses: [
        {
            houseNo: String,
            street: String,
            city: String,
            state: String,
            country: { type: String, default: "India" },
            pincode: String,
            isDefault: { type: Boolean, default: false }
        }
    ],
    profileCompletion: {
        type: Number,
        default: 0
    },
    savedPaymentMethods: [
        {
            provider: String, // e.g., 'stripe', 'razorpay'
            last4: String,
            expMonth: Number,
            expYear: Number,
            isDefault: Boolean
        }
    ],
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    facebookId: {
        type: String,
        sparse: true,
        unique: true
    },
    githubId: {
        type: String,
        sparse: true,
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profilePhoto: {
        url: String,
        filename: String
    },
    cart: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            }
        }
    ],
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    isBlocked: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    }
}, { timestamps: true });

// Pre-save hook to calculate profile completion
userSchema.pre('save', function(next) {
    let completion = 0;
    if (this.email) completion += 25;
    if (this.username) completion += 25;
    if (this.phoneNumber) completion += 25;
    if (this.addresses && this.addresses.length > 0) completion += 25;
    this.profileCompletion = completion;
    next();
});

// Generate default avatar if none exists
userSchema.methods.getAvatarUrl = function() {
    if (this.profilePhoto && this.profilePhoto.url) {
        return this.profilePhoto.url;
    }
    // WhatsApp style avatar using initials
    const name = this.username || this.email.split('@')[0];
    const initial = name.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initial}&background=473129&color=fff&size=150`;
};


userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });


module.exports = mongoose.model('User', userSchema);