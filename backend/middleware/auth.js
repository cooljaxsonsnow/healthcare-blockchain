const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.isAuthenticatedUser = async function (req, res, next) {
  try {
    const token = req.header("token");
    console.log(token);
    console.log(process.env.JWT_SECRET);
    console.log(req.session.uid);

    if (!token) {
      req.session.destroy();
      return res.status(401).json({
        message: "Please Login To Access",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedData);
    req.user = await prisma.user.findUnique({
      where: {
        id: decodedData.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        walletHash: true,
        orgName: true
      }
    });
    console.log(req.user);
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: "Please Login To Access",
    });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.orgName)) {
      res.status(400).json({
        mesage: `${req.user.orgName} role not allowed`,
      });
    }
    next();
  };
};
