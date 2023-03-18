import { Request, Response } from "express";
import { IProductCart } from "interfaces/cart";
import Cart from "models/cart";
import User from "models/user";
import { getIdFromReq } from "utils/token";

const changeQuantity = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const user = await User.findById(id_user);
    // find cart of user
    const cart = await Cart.findOne({ user_id: id_user });
    if (!user) {
      return res.sendStatus(403);
    }
    const { product_id, quantity, size_id, color_id }: IProductCart = req.body;

    if (!cart) {
      return res.sendStatus(404);
    }
    const productIndex = cart.products.findIndex(
      (product) =>
        product.product_id === product_id &&
        product.size_id === size_id &&
        product.color_id === color_id
    );
    if (productIndex !== -1) {
      cart.products[productIndex].quantity = quantity;
    }
    await cart.updateOne(cart);
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default changeQuantity;
