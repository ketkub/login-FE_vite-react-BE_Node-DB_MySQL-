import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, "Test_Key");
        req.userId = decoded.userId;
        req.role = decoded.role;
        
        if (req.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }
        
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
};
