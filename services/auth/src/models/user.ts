import { Password } from "./../services/password";
import { Schema, model, Model, Document } from "mongoose";
interface IUser {
  email: string;
  password: string;
}
interface IUserDoc extends Document {
  email: string;
  password: string;
}
interface IUserModel extends Model<IUserDoc> {
  build(user: IUser): IUserDoc;
}
const schema = new Schema<IUser>(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        delete ret._id;
      },
    },
  }
);

schema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const passHashed = await Password.toHash(this.get("password"));
    this.set("password", passHashed);
  }
  done();
});

schema.statics.build = (user: IUser) => {
  return new User(user);
};
const User = model<IUserDoc, IUserModel>("User", schema);
export { User };
