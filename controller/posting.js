const connection = require("../my_connection");
const path = require("path");

// @desc   사진포스팅 하는 API
// @route  POST /api/v1/sns_users/posting
// @request file
// @response  success

// 클라이언트가 사진을 보낸다. => 서버가 이 사진을 받는다. =>
// 서버가 이 사진을 디렉토리에 저장한다. => 이 사진의 파일명을 DB에 저장한다.

exports.photoPosting = async (req, res, next) => {
  let user_id = req.user.id;
  let photo = req.files.photo;
  let posting = req.body.posting;
  if (!user_id || !req.files) {
    res.status(400).json({ message: "정보가 이상함" });
    return;
  }
  console.log(req.files);

  // 지금 받은 파일이. 이미지 파일인지 체크
  if (photo.mimetype.startsWith("image") == false) {
    res.status(400).json({ message: "이미지파일이 아닙니다" });
    return;
  }

  // 파일크기가 정해진 크기보다 큰지 체크 정해진 크기는 process.env.MAX_FILE_SIZE에 넣어놨다.
  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.status(400).json({ message: "파일 용량이 너무 큽니다" });
    return;
  }
  // fall.jpg =>photo_3.jpg  ext==확장자명을 뜻한다
  // abc.png =>photo_#.png
  // path 의 parse는 이름과 확장자명을 파싱하는데 우리는 이름은 버리고 확장자명만 가져옴.
  photo.name = `photo_${user_id}_${Date.now()}${path.parse(photo.name).ext}`;

  // ./public/upload/photo_3.jpg 로 저장하겠다는 것
  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;
  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  let query = `insert into sns(user_id,photo_url,posting)values(${user_id},"${photo.name}","${posting}")`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ message: "사진이 업로드 됐습니다." });
  } catch (e) {
    res.status(500).json({ message: "e" });
  }
};
