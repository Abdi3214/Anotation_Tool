const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema(
  {
    Annotator_ID: { type: Number, unique: true },
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, default: "annotator" },
    isActive: { type: Boolean, default: true }
  },
  { versionKey: false, timestamps: true }
);



usersSchema.pre("save", async function (next) {
  if (!this.Annotator_ID) {
    let isUnique = false;
    while (!isUnique) {
      const randomId = Math.floor(100 + Math.random() * 300); 
      const existingUser = await mongoose.models.User.findOne({
        Annotator_ID: randomId,
      });
      if (!existingUser) {
        this.Annotator_ID = randomId;
        isUnique = true;
      }
    }
  }
  next();
});

const User = mongoose.model("User", usersSchema);
module.exports = User;
