const connection = require("../my_connection");

// @desc 팔로우 기능
// @routes POST api/v1/follow
// @request token , following_id
// @response success
exports.follow = async function (req, res, next) {
  let user_id = req.user.id;
  let following_id = req.body.following_id;

  if (!following_id) {
    res.status(500).json({ success: false, msg: "팔로우할 사람을 입력하세요" });
    return;
  }

  let query = `select * from sns_user where id = ${following_id}`;
  try {
    [rows] = await connection.query(query);
    if (rows.length == 0) {
      res.status(500).json({ message: "찾을 수 없는 아이디입니다" });
      return;
    }
  } catch (e) {
    res.status(400).json({ success: false, msg: e });
    return;
  }
  query = `insert into sns_follow (user_id,following_id) values (${user_id},${following_id})`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, msg: rows[0].email });
  } catch (e) {
    if (e.errno == 1062) {
      res.status(500).json({ success: false, msg: "이미 팔로우를 하셨습니다" });
      return;
    } else {
      res.status(400).json({ success: false, msg: e });
    }
  }
};
// @desc 언팔
// @routes DELETE api/v1/follow/un
// @request token , following_id
// @response success
exports.unfollow = async (req, res, next) => {
  let user_id = req.user.id;
  let following_id = req.body.following_id;

  query = `delete from sns_follow where user_id = ${user_id} and following_id = ${following_id}`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, msg: result });
  } catch (e) {
    res.status(400).json({ success: false, error: e });
  }
};
