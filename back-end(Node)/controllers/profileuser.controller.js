import { User } from "../models/user.model.js";
import { UserDetails } from "../models/user-details.model.js";

export const setupProfileUser = async (req, res) => {
  const { userid, firstname, lastname, gender, address, phone, birthDate } = req.body;
    try {
      const user = await User.findByPk(userid);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const avatarUrl = req.file ? req.file.filename : null;

        const userDetails = await UserDetails.create({
          userid,
          firstname,
          lastname,
          gender,
          avatar: avatarUrl,
          address,
          phone,
          birthDate,
        });
        user.detailsId = userDetails.id;
        await user.save();  
        res.status(200).json({ message: "Profile set successfully", userDetails });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error setting profile", error: error.message });
    }
};

export const showProfileUser = async (req, res) => {
  const { userid } = req.params;
    try {
      const user = await User.findByPk(userid, {
        include: [{ model: UserDetails, as: "details" }],
      });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ userDetails: user.details });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving profile", error: error.message });
    }
};  

export const updateProfileUser = async (req, res) => {
  const { userid } = req.params;
  const { firstname, lastname, gender, address, phone, birthDate } = req.body;  
    try {
      const user = await User.findByPk(userid);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userDetails = await UserDetails.findOne({ where: { userid } });
        if (!userDetails) {
            return res.status(404).json({ message: "User details not found" });
        }

        const avatarUrl = req.file ? `/uploads/${req.file.filename}` : userDetails.avatar;

        userDetails.firstname = firstname || userDetails.firstname;
        userDetails.lastname = lastname || userDetails.lastname;
        userDetails.gender = gender || userDetails.gender;
        userDetails.avatar = avatarUrl;
        userDetails.address = address || userDetails.address;
        userDetails.phone = phone || userDetails.phone;
        userDetails.birthDate = birthDate || userDetails.birthDate;
        await userDetails.save();
        res.status(200).json({ message: "Profile updated successfully", userDetails });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating profile", error: error.message });
    }
};