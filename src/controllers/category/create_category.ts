import { Request, Response } from "express";
import Category, { ICategory } from "models/category";
import User from "models/user";
import { getNow, validateFields } from "utils/common";
import { getIdFromReq } from "utils/token";

const createCategory = async (req: Request, res: Response) => {
  try {
    const user_id = getIdFromReq(req);
    const user = await User.findById(user_id);
    const { name, description }: ICategory = req.body;
    const validateFieldsResult = validateFields({ name, description }, [
      { name: "name", type: "string", required: true },
      { name: "description", type: "string", required: true },
    ]);
    if (validateFieldsResult) {
      return res.status(400).json({ message: validateFieldsResult });
    }
    if (!user) return res.sendStatus(403);
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res
        .status(409)
        .json({ message: `Category name '${name}' already exists` });
    }
    const category = new Category({
      name,
      description,
      created_at: getNow(),
      created_by: user.email,
      modify: [{ action: `Create by ${user.email}`, date: getNow() }],
    });
    await category.save();
    return res.status(201).json({ id: category._id });
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default createCategory;
