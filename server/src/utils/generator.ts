import jwt from "jsonwebtoken";

export const generateTokens = (user: { id: string; email: { address: string } }) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email.address },
        process.env.ACCESS_TOKEN_SECRET || "access_secret",
        { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
        { expiresIn: "7d" }
    );
    return { accessToken, refreshToken };
};