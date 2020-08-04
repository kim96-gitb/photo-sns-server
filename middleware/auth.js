const connection = require("../my_connection");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  let token;
  try {
    token = req.header("Authorization").replace("Bearer ", ""); // 베어러 제거
  } catch (e) {
    res.status(411).json({ error: "Please authenticate!" });
    return;
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  let user_id = decoded.user_id;
  let query = `select * from sns_token where user_id = ${user_id} and token = "${token}"`;
  try {
    [rows] = await connection.query(query);
    if (rows.length == 0) {
      res.status(401).json({ error: "Please authenticate!" });
    } else {
      let user = rows[0];
      //패스워드 정보는 필요없으니 삭제하고 담아줄것
      delete user.passwd;
      req.user = user;
      req.user.token = token;
      next();
    }
  } catch (e) {
    res.status(400).json({ success: false, msg: e });
    return;
  }
};

module.exports = auth;
