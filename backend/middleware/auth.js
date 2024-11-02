import jwt from "jsonwebtoken";


const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;
    console.log("token", token);
    if (!token) {
        return res.json({ success: false, message: "Not authorized. Login again." });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        req.body.userId = token_decode.id;
        req.userId = token_decode.id;
        console.log("req.body.userId:", req.body.userId);
        console.log(req.userId)
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export default authMiddleware;