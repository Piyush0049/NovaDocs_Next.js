import mongoose from 'mongoose';

export interface IFile extends mongoose.Document {
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  userId: mongoose.Types.ObjectId; // Owner of the file
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new mongoose.Schema<IFile>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a file name'],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, 'Please provide the original file name'],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, 'Please provide the file size'],
    },
    type: {
      type: String,
      required: [true, 'Please provide the file type'],
    },
    url: {
      type: String,
      required: [true, 'Please provide the file URL'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the user ID'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from creating the model multiple times during hot reloads
const File = mongoose.models.File || mongoose.model<IFile>('File', fileSchema);

export default File;
