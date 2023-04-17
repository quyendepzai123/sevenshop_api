import { PAYMENT_TYPE, STATUS_ORDER } from "constants/order";
import { Request, Response } from "express";
import { IInvoice } from "interfaces/invoice";
import Cart from "models/cart";
import Color from "models/color";
import Order from "models/order";
import Product from "models/product";
import Size from "models/size";
import User from "models/user";
import mongoose from "mongoose";
import { getNow } from "utils/common";
import { getIdFromReq } from "utils/token";
const stripe = require("stripe")(process.env.SECRET_KEY);

const checkout = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const user = await User.findById(id_user);
    if (!user) {
      return res.sendStatus(403);
    }
    const {
      products,
      total_invoice,
      total_invoice_before_discount,
      total_invoice_discount,
      payment_type,
      address,
      note,
      voucher_id,
    }: IInvoice = req.body;

    //check address exists in user
    if (user.addresses) {
    }
    const addressExists = user.addresses.filter(
      (addressItem) => addressItem._id?.toString() == address?._id?.toString()
    );
    if (addressExists.length == 0) {
      return res.status(400).json({ message: "Address is not exists" });
    }

    if (payment_type === PAYMENT_TYPE.cod) {
      const newOrder = new Order({
        _id: new mongoose.Types.ObjectId(),
        user_id: id_user,
        products,
        total_price: total_invoice,
        total_discount: total_invoice_discount,
        total_before_discount: total_invoice_before_discount,
        payment_type,
        address,
        note,
        voucher_id,
        status: STATUS_ORDER.pending,
        created_at: getNow(),
        created_by: user.email,
        modify: [
          {
            status: STATUS_ORDER.pending,
            modify_at: getNow(),
            modify_by: `${user.email} send order`,
          },
        ],
      });

      await newOrder.save();

      //remove product in cart
      const cart = await Cart.findOne({ user_id: id_user });
      if (cart) {
        const newProducts = cart.products.filter((product) => {
          return !products.find(
            (productItem) =>
              productItem.product_id.toString() == product.product_id &&
              productItem.color_id == product.color_id.toString() &&
              productItem.size_id == product.size_id.toString()
          );
        });
        cart.products = newProducts;
        await cart.save();
      }

      //remove quantity in product.stock
      try {
        const productsInStock = products.map(async (product) => {
          const { product_id, quantity, size_id, color_id } = product;

          const productInStock = await Product.findById(product_id);
          if (!productInStock) return res.sendStatus(404);
          const { stock } = productInStock;
          const newStock = stock.map((stockItem) => {
            if (stockItem.size_id == null || stockItem.color_id == null)
              return stockItem;

            if (
              stockItem.size_id.toString() == size_id.toString() &&
              stockItem.color_id.toString() == color_id.toString()
            ) {
              //check stock.quantity > quantity
              if (stockItem.quantity < quantity) {
                throw new Error(
                  `Product ${product_id} size: ${size_id} color: ${color_id} is out of stock`
                );
              }

              return {
                ...stockItem,
                quantity: stockItem.quantity - quantity,
              };
            }

            return stockItem;
          });

          productInStock.stock = newStock;
          await productInStock.save();
        });
        await Promise.all(productsInStock);
      } catch (err: any) {
        return res.status(400).json({ message: err.message });
      }

      //check voucher exists and update user voucher status to used
      if (voucher_id) {
        user.vouchers.map((voucher) => {
          if (voucher._id != null) {
            if (voucher._id.toString() == voucher_id) {
              return {
                ...voucher,
                status: "used",
              };
            }
            return voucher;
          }
        });

        await user.save();
      }

      //send email to user

      //send email to admin

      const results = {
        _id: newOrder._id,
        created_at: newOrder.created_at,
        payment_type: newOrder.payment_type,
      };

      return res.status(201).json({ results });
    } else if (payment_type === PAYMENT_TYPE.bank) {
      const newOrder = new Order({
        _id: new mongoose.Types.ObjectId(),
        user_id: id_user,
        products,
        total_price: total_invoice,
        total_discount: total_invoice_discount,
        total_before_discount: total_invoice_before_discount,
        payment_type,
        address,
        note,
        voucher_id,
        status: STATUS_ORDER.pending,
        created_at: getNow(),
        created_by: user.email,
        modify: [
          {
            status: STATUS_ORDER.pending,
            modify_at: getNow(),
            modify_by: `${user.email} send order`,
          },
        ],
      });

      await newOrder.save();

      //remove product in cart
      const cart = await Cart.findOne({ user_id: id_user });
      if (cart) {
        const newProducts = cart.products.filter((product) => {
          return !products.find(
            (productItem) =>
              productItem.product_id.toString() == product.product_id &&
              productItem.color_id == product.color_id.toString() &&
              productItem.size_id == product.size_id.toString()
          );
        });
        cart.products = newProducts;
        await cart.save();
      }

      //remove quantity in product.stock
      try {
        const productsInStock = products.map(async (product) => {
          const { product_id, quantity, size_id, color_id } = product;

          const productInStock = await Product.findById(product_id);
          if (!productInStock) return res.sendStatus(404);
          const { stock } = productInStock;
          const newStock = stock.map((stockItem) => {
            if (stockItem.size_id == null || stockItem.color_id == null)
              return stockItem;

            if (
              stockItem.size_id.toString() == size_id.toString() &&
              stockItem.color_id.toString() == color_id.toString()
            ) {
              //check stock.quantity > quantity
              if (stockItem.quantity < quantity) {
                throw new Error(
                  `Product ${product_id} size: ${size_id} color: ${color_id} is out of stock`
                );
              }

              return {
                ...stockItem,
                quantity: stockItem.quantity - quantity,
              };
            }

            return stockItem;
          });

          productInStock.stock = newStock;
          await productInStock.save();
        });
        await Promise.all(productsInStock);
      } catch (err: any) {
        return res.status(400).json({ message: err.message });
      }

      //check voucher exists and update user voucher status to used
      if (voucher_id) {
        user.vouchers.map((voucher) => {
          if (voucher._id != null) {
            if (voucher._id.toString() == voucher_id) {
              return {
                ...voucher,
                status: "used",
              };
            }
          }
          return voucher;
        });
        await user.save();
      }

      const lineItems = await Promise.all(
        products.map(async (product) => {
          // Lấy thông tin sản phẩm từ database
          const item = await Product.findById(product.product_id);
          const color = await Color.findById(product.color_id);
          const size = await Size.findById(product.size_id);
          if (!item || !color || !size) return res.sendStatus(404);
          // Tạo đối tượng line item cho sản phẩm
          const lineItem = {
            price_data: {
              currency: "vnd",
              product_data: {
                name: item.name + " - " + color.name + " - " + size.size,
                images: item.images,
              },
              //check item.price_sale not null and not empty and > 0
              unit_amount: item.price_sale > 0 ? item.price_sale : item.price,
            },
            quantity: product.quantity,
          };

          return lineItem;
        })
      );

      //create a session checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
      });

      //send email to user

      //send email to admin

      const results = {
        _id: newOrder._id,
        created_at: newOrder.created_at,
        payment_type: newOrder.payment_type,
        session_id: session.id,
        session_url: session.url,
      };

      return res.status(201).json({ results });
    } else if (payment_type === PAYMENT_TYPE.momo) {
      return res.status(501).json("Update later");
    }
    return res.sendStatus(501);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default checkout;
