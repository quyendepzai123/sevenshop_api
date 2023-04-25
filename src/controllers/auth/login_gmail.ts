import { ROLE } from "constants/user";
import { Request, Response } from "express";
import User, { IUser } from "models/user";
import { getNow } from "utils/common";
import { tokenGen } from "utils/token";

const loginGmail = async (req: Request, res: Response) => {
  try {
    const { email, avatar, full_name, device_id }: IUser = req.body;

    if (!email && !avatar && !full_name) {
      return res
        .status(500)
        .json({ message: "Missing email or avatar or full_name" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      const newUser = new User({
        email,
        avatar,
        full_name,
        role: ROLE.user,
      });

      newUser.created_at = getNow();
      newUser.created_by = email + " register gmail";
      await newUser.save();
    } else {
      const contentToken = { _id: user.id, role: user.role };
      const access_token = tokenGen(
        contentToken,
        parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
      );
      const refresh_token = tokenGen(
        contentToken,
        parseInt(<string>process.env.EXPIRED_REFRESH_TOKEN)
      );
      user.access_token = access_token;
      user.refresh_token = refresh_token;
      if (device_id != "") user.device_id = device_id;
      await user.save();
      return res.status(200).json({
        message: "Login success",
        access_token,
        refresh_token,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export default loginGmail;
