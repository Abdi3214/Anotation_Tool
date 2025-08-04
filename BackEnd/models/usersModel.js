const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema(
  {
    Annotator_ID: { type: Number, unique: true },
    name: { type: String, required: true, unique: true }, // 👈 Add unique: true here
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, default: "annotator" },
  },
  { versionKey: false, timestamps: true }
);

// Generate random number and ensure it's unique
usersSchema.pre("save", async function (next) {
  if (!this.Annotator_ID) {
    let isUnique = false;
    while (!isUnique) {
      const randomId = Math.floor(100 + Math.random() * 300); // 4-digit random number
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
