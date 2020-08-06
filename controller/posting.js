const connection = require("../my_connection");
const path = require("path");

// @desc        사진1장과 내용을 업로드 하는 API
// @route       POST /api/v1/posts
// @request     photo, content, user_id(auth)
// @response    success
exports.uploadPhoto = async (req, res, next) => {
  let user_id = req.user.id;
  let photo = req.files.photo;
  let posting = req.body.posting;

  if (photo.mimetype.startsWith("image") == false) {
    res.stats(400).json({ message: "사진 파일 아닙니다." });
    return;
  }

  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.stats(400).json({ message: "파일 크기가 너무 큽니다." });
    return;
  }

  photo.name = `photo_${user_id}_${Date.now()}${path.parse(photo.name).ext}`;

  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  let query =
    "insert into photo_post (user_id, photo_url, content) \
                values (?,?,?)";
  let data = [user_id, photo.name, posting];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
    return;
  } catch (e) {
    res.status(500).json({ error: e });
    return;
  }
};

// @desc   내가 쓴 포스팅 보기
// @route  GET /api/v1/posting/me
// @request     token
// @response    posting
exports.myposting = async (req, res, next) => {
  let user_id = req.user.id;
  let token = req.user.token;
  let query = `select s.photo_url as photo , s.posting = posting from sns as s join sns_token as t on s.user_id = t.user_id  where user_id = ${user_id} and token = ${token} `;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ succecss: true, msg: rows });
  } catch (e) {
    res.status(400).json({ message: "e" });
  }
};
// @desc   사진수정하는 API
// @route  PUT /api/v1/posting/update
// @request file
// @response  success
exports.update_photo = async (req, res, next) => {
  let user_id = req.user.id;
  let posting = req.body.posting;
  if (!user_id || !req.files) {
    res.status(400).json({ message: "에러" });
    return;
  }

  const photo = req.files.photo;
  if (photo.mimetype.startsWith("image") == false) {
    res.status(400).json({ message: "이미지 파일이 아닙니다" });
    return;
  }

  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.status(400).json({ message: "파일이 너무 큽니다" });
    return;
  }

  photo.name = `photo_${user_id}${path.parse(photo.name).ext}`;

  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;
  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  let query = `update sns set photo_url = "${photo.name}",posting = "${posting}" where user_id = ${user_id}`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ message: "사진이 수정 되었습니다." });
  } catch (e) {
    res.status(500).json({ message: e });
  }
};
// @desc   사진 삭제하는 API
// @route  DELETE/api/v1/posting/delete
// @request token , sns_id
// @response success
exports.delete_photo = async (req, res, next) => {
  let user_id = req.user.id;
  let sns_id = req.body.sns_id;
  let query = `delete from sns where user_id = ${user_id} and id =${sns_id} `;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ message: "사진이 삭제 되었습니다." });
  } catch (e) {
    res.status(500).json({ message: "에러" });
  }
};
// @desc  팔로우한 친구 게시물 확인하기
// @route  GET /api/v1/posting/followposting
// @request token , sns_id
// @response success
exports.followPosting = async (req, res, next) => {
  let user_id = req.user.id;
  let query = `select * from sns as s join sns_follow as sf\ 
      on s.user_id = sf.user_id \
      where sf.following_id =${user_id} `;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ succecss: true, msg: rows });
  } catch (e) {
    res.status(500).json({ message: "에러" });
  }
};
