// 📁 models/annotation.js
const mongoose = require('mongoose');
delete mongoose.connection.models['Annotation'];

const annotationSchema = new mongoose.Schema(
  {
    Annotator_ID: { type: Number, required: true },
    Annotator_Email: { type: String, required: false },
    Annotation_ID: { type: String, unique: true },
    Comment: { type: String },
    Src_Text: { type: String, required: true },
    Src_lang: { type: String, default: 'English' },
    Target_lang: { type: String, default: 'Somali' },
    Score: { type: Number, default: 0 },
    Omission: { type: Number, default: 0 },
    Addition: { type: Number, default: 0 },
    Mistranslation: { type: Number, default: 0 },
    Untranslation: { type: Number, default: 0 },
    Src_Issue: { type: String, default: '' },
    Target_Issue: { type: String, default: '' },
    reviewed: { type: Boolean, default: false },
    Skipped: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

annotationSchema.pre('save', async function (next) {
  if (!this.Annotation_ID) {
    let isUnique = false;
    while (!isUnique) {
      const randomId = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await mongoose.models.Annotation.findOne({ Annotation_ID: randomId });
      if (!existing) {
        this.Annotation_ID = randomId;
        isUnique = true;
      }
    }
  }
  next();
});

module.exports = mongoose.model('Annotation', annotationSchema);
