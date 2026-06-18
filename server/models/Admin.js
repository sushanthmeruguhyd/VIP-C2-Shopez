import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    bannerImage: {
      type: String,
      required: true,
      default: '',
    },
    categories: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    collection: 'admin', // Force collection name to be 'admin'
  }
);

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
