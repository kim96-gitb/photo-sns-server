const connection = require("../my_connection");

// @desc 팔로우 기능
// @routes POST api/v1/follow
// @request token , following_id
// @response success
exports.follow = async function (req, res, next) {
  let user_id = req.user.user_id;
  let following_id = req.body.following_id;

  if (!following_id) {
    res.status(500).json({ success: false, msg: "팔로우할 사람을 입력하세요" });
    return;
  }

  let query = `insert into sns_follow (user_id,following_id) valuse (${user_id},${following_id})`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, msg: result });
  } catch (e) {
    if (e.errno == 1062) {
      res.status(500).json({ success: false, msg: "이미 팔로우를 하셨습니다" });
    } else {
      res.status(400).json({ success: false, msg: e });
    }
  }
};
