import bcrypt from "bcryptjs";

const hashPassword = async () => {
  try {
    const password = "admin123"; // Replace with your new desired password
    if (!password) {
      console.error("Error: No password provided.");
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);
  } catch (error) {
    console.error("Error hashing password:", error);
  }
};

hashPassword();
