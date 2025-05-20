// In your Login component or Auth context
const login = async (email, password) => {
  try {
    // Replace with your actual authentication API call
    const response = await authenticateUser(email, password);

    if (response.success) {
      // Store user data and token
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userData", JSON.stringify(response.user));

      // Redirect based on user type
      if (response.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user/dashboard"); // Your user page route
      }
    }
  } catch (error) {
    console.error("Login failed:", error);
  }
};
