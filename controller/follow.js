const connection = require("../my_connection");
const { json } = require("express");

// @desc 팔로우 기능
// @routes POST api/v1/follow
// @request token , following_id
// @response success
exports.follow = async function (req, res, next) {
  let user_id = req.user.id;
  let follow_id = req.body.follow_id;
  let query = `select * from  sns_user where id = ${follow_id}`;

  if (!follow_id) {
    res.status(500).json({ success: false, msg: "정보가없음" });
    return;
  }

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(400).json({ message: "없는 아이디 입니다." });
      return;
    } else {
      query = `insert into sns_follow(user_id,following_id)values(${user_id},${follow_id})`;
      try {
        [result] = await connection.query(query);

        res.status(200).json({
          success: true,
          message: "친구요청이 전송되었습니다.",
        });
      } catch (e) {
        if (e.errno == 1062) {
          res.status(500).json({ message: "이미 친구요청을 보냈습니다" });
        }
      }
    }
  } catch (e) {
    res.status(500).json({ error: e, message: "에러" });
  }
};
// @desc 언팔
// @routes DELETE api/v1/follow/un
// @request token , following_id
// @response success
exports.unfollow = async (req, res, next) => {
  let user_id = req.user.user_id;
  let following_id = req.body.following_id;

  query = `delete from sns_follow where user_id = ${user_id} and following_id = ${following_id}`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, msg: result });
  } catch (e) {
    res.status(400).json({ success: false, error: e });
  }
};
