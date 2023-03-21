import { CartTypeModel } from "models/cart";
import { Request, Response } from "express";
import Product from "models/product";
import createCart from "./create_cart";

const get_cart = async (req: Request, res: Response) => {
  try {
    const cart = (await createCart(req, res)) as CartTypeModel;
    const { products } = cart;
    const cart_products = products.map(async (product) => {
      const { product_id, quantity, size_id, color_id } = product;
      const itemProduct = await Product.findById(product_id);
      if (!itemProduct) return res.sendStatus(404);
      const { name, price, price_sale, images } = itemProduct;
      return {
        product_id,
        quantity,
        size_id,
        color_id,
        name,
        price,
        price_sale,
        images,
      };
    });
    return res.status(200).json(await Promise.all(cart_products));
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default get_cart;