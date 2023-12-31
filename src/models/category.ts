import { IModify, Modify } from "interfaces/basic";
import { Document, model, Schema } from "mongoose";

/*********************TYPE & INTERFACE*****************************/

export type ICategory = {
  name: string;
  description: string;
  created_at: string;
  created_by: string;
  modify: IModify[];
};

export type CategoryTypeModel = ICategory & Document;

/*******************************SCHEMA*****************************/

const categorySchema: Schema = new Schema({
  name: { type: String, require: true },
  description: { type: String, require: true },
  created_at: { type: String, require: true },
  created_by: { type: String, require: true },
  modify: { type: [Modify], require: true },
});

const Category = model<CategoryTypeModel>("Category", categorySchema);

export default Category;
