const connection = require("../my_connection");
const path = require("path");
var AWS = require("aws-sdk");

// @desc   사진포스팅 하는 API
// @route  POST /api/v1/posting
// @request file
// @response  success

// 클라이언트가 사진을 보낸다. => 서버가 이 사진을 받는다. =>
// 서버가 이 사진을 S3에 저장한다. => 이 사진의 파일명을 DB에 저장한다.

exports.photoPosting = async (req, res, next) => {
  let user_id = req.user.id;
  let posting = req.body.posting;
  if (!user_id || !req.files) {
    res.status(400).json({ message: "사진을 넣으세요" });
    return;
  }
  console.log(req.files);

  const photo = req.files.photo;
  // 지금 받은 파일이. 이미지 파일인지 체크
  if (photo.mimetype.startsWith("image") == false) {
    res.status(400).json({ message: "이미지 파일이 아닙니다" });
    return;
  }
  // 파일크기가 정해진 크기보다 큰지 체크 정해진 크기는 process.env.MAX_FILE_SIZE에 넣어놨다.
  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.status(400).json({ message: "파일이 너무 큽니다" });
    return;
  }
  // fall.jpg =>photo_3.jpg  ext==확장자명을 뜻한다
  // abc.png =>photo_#.png
  // path 의 parse는 이름과 확장자명을 파싱하는데 우리는 이름은 버리고 확장자명만 가져옴.
  photo.name = `photo_${user_id}_${Date.now()}${path.parse(photo.name).ext}`;

  // aws s3에 억세스 할 권한 설정
  let file = photo.data;
  const S3_BUCKET = "kim96test";
  const AWS_ACCESS_KEY = "AKIAYY3C5CQ27GFMEIXQ";
  const AWS_SECRET_ACCESS_KEY = "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";
  AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });

  //s3에 파일 업로드

  const s3 = new AWS.S3();

  let param = {
    Bucket: S3_BUCKET,
    Key: photo.name,
    Body: file,
    ContentType: path.parse(photo.name).ext.split(".")[1],
    ACL: "public-read",
  };

  s3.upload(param, async function (err, s3_data) {
    console.log("err: ", err, "data : ", s3_data);

    let query = `insert into sns(user_id,photo_url,posting)values(${user_id},"${photo.name}","${posting}")`;
    try {
      [result] = await connection.query(query);
      res
        .status(200)
        .json({ succecss: true, message: "사진이 업로드 됐습니다.", user_id });
    } catch (e) {
      res.status(500).json({ message: e });
    }
  });
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
    res
      .status(200)
      .json({ succecss: true, message: "사진이 수정 되었습니다." });
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
    res
      .status(200)
      .json({ succecss: true, message: "사진이 삭제 되었습니다." });
  } catch (e) {
    res.status(500).json({ message: "에러" });
  }
};
// @desc  팔로우한 친구 게시물 확인하기
// @route  GET /api/v1/posting/followposting
// @request token  , offset , limit
// @response success
exports.followPosting = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query = `select s.*\ 
  from sns_follow as sf\
  join sns as s\
  on sf.following_id = s.user_id\ 
  where sf.user_id =${user_id} \
  order by created_at desc limit ${offset},${limit} `;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ succecss: true, msg: rows });
  } catch (e) {
    res.status(500).json({ message: e });
  }
};
