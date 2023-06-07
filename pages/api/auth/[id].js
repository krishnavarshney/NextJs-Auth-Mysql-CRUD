import User from "../../../lib/models/user";


export default async function handler(req, res) {
  const userId = req.query.id;
  const {
    query: { id },
    method,
  } = req;

  if (req.method === "DELETE") {
    try {
      // Delete the user with the provided ID
      await User.deleteUser(userId);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("An error occurred:", error);
      res.status(500).json({ error: "Unable to delete user" });
    }
  } else if (req.method === "GET") {
    try {
      // Retrieve the user by ID
      const user = await User.findById(id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error("An error occurred:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (method === "PUT") {
    const { name, password, confirmPassword } = req.body;
    console.log("---Printing Passwords::----",password,"\n",confirmPassword);
    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match" });
      return;
    }

    try {
      // Update the user with the provided ID
      const updatedUser = await User.updateUser(id, { name, password });

      res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error("An error occurred:", error);
      res.status(500).json({ error: "Unable to update user" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
