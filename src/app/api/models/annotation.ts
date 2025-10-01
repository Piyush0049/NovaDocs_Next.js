import mongoose from 'mongoose';

export interface IAnnotation extends mongoose.Document {
  fileId: mongoose.Types.ObjectId;
  type: 'highlight' | 'comment' | 'drawing' | 'text' | 'shape' | 'image';
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  opacity?: number;
  strokeWidth?: number;
  points?: Array<{ x: number; y: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const annotationSchema = new mongoose.Schema<IAnnotation>(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
    },
    type: {
      type: String,
      enum: ['highlight', 'comment', 'drawing', 'text', 'shape', 'image'],
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    width: Number,
    height: Number,
    color: {
      type: String,
      required: true,
    },
    content: String,
    fontSize: Number,
    fontFamily: String,
    opacity: Number,
    strokeWidth: Number,
    points: [
      {
        x: Number,
        y: Number,
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Annotation = mongoose.models.Annotation || mongoose.model<IAnnotation>('Annotation', annotationSchema);

export default Annotation;
