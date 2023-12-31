import { getNow, validateFields } from "utils/common";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import User from "models/user";
import { getIdFromReq, tokenGen } from "utils/token";

const changePassword = async (req: Request, res: Response) => {
  const _id = getIdFromReq(req);
  const { password, new_password } = req.body;
  const user = await User.findById({ _id });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  //validate password, new_password
  const validateFieldsResult = validateFields({ password, new_password }, [
    { name: "password", type: "string", required: true },
    { name: "new_password", type: "string", required: true },
  ]);
  if (validateFieldsResult)
    return res.status(400).json({ message: validateFieldsResult });

  //validate not null, not empty, not undefined
  if (!password || !new_password)
    return res.status(400).json({ message: "Password must not be empty" });

  if (password === new_password)
    return res
      .status(400)
      .json({ message: "New password must be different from old password" });

  const compare = await bcrypt.compare(password, user.password);
  if (compare) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(new_password, salt);
    const contentToken = { _id: _id, role: user.role };
    const accessToken = tokenGen(
      contentToken,
      parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
    );
    const refreshToken = tokenGen(
      contentToken,
      parseInt(<string>process.env.EXPIRED_REFRESH_TOKEN)
    );
    user.password = hashPassword;
    user.access_token = accessToken;
    user.refresh_token = refreshToken;
    user.modify.push({ action: "Change password", date: getNow() });
    await user.save();
    return res.status(200).json({
      message: "Change password successfully",
      accessToken,
      refreshToken,
    });
  } else {
    return res.status(500).json({ message: "Password incorrect" });
  }
};

export default changePassword;
