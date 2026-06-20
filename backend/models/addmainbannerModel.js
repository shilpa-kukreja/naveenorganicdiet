import mongoose from 'mongoose';

const addmainbannerSchema = new mongoose.Schema({
    image: { 
        type: String, 
        required: true 
    },
    status: { 
        type: Boolean, 
        default: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
});

// Update the updatedAt field on save
addmainbannerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const AddMainBanner = mongoose.models.AddMainBanner || mongoose.model('AddMainBanner', addmainbannerSchema);

export default AddMainBanner;