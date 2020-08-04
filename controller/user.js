const connectoin = require("../my_connection");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// @desc 회원가입
// @routes POST api/v1/user
// @request email , passwd
// @response success
exports.signupUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  const hashedPasswd = await bcrypt.hash(passwd, 4);
  let query = `insert into sns_user(email , passwd) values("${email}","${hashedPasswd}")`;

  //   if (!email || !passwd) {
  //     res.status(500).json({ success: false, msg: "이메일 비밀번호 입력하세요" });
  //     return;
  //   }

  //   if (!validator.isEmail(email)) {
  //     res.status(500).json({ success: false, msg: "이메일 형식이 이상해요" });
  //     return;
  //   }
  let user_id;
  try {
    [reslut] = await connectoin.query(query);
    user_id = reslut.insertId;
  } catch (e) {
    if (e.errno == 1062) {
      res.status(500).json({ success: true, msg: "이메일 중복" });
      return;
    } else {
      res.status(400).json({ success: true, msg: e });
      return;
    }
  }
  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = `insert into sns_token(token , user_id) values ("${token}",${user_id})`;
  try {
    [reslut] = await connectoin.query(query);
    res.status(200).json({ success: true, msg: reslut });
  } catch (e) {
    res.status(400).json({ success: true, msg: e });
    return;
  }
};
