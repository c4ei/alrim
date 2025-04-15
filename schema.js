-- 1. users 테이블 (가장 먼저)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '사용자 ID',
    username VARCHAR(50) NOT NULL COMMENT '사용자명',
    password VARCHAR(255) COMMENT '비밀번호 (암호화 저장)',
    role ENUM('student', 'teacher', 'admin') NOT NULL COMMENT '역할 (학생, 선생님, 관리자)',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT '이메일 (로그인용)',
    googleId VARCHAR(255) COMMENT '구글 로그인 ID',
    kakaoId VARCHAR(255) COMMENT '카카오 로그인 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '계정 수정일'
);

-- 2. classes 테이블 (students에서 참조하기 때문에 먼저)
CREATE TABLE classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '학급 ID',
    class_name VARCHAR(100) NOT NULL COMMENT '학급 이름',
    teacher_id INT NOT NULL COMMENT '선생님 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. students 테이블 (users, classes 참조)
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '학생 ID',
    user_id INT NOT NULL COMMENT 'users 테이블의 외래 키',
    class_id INT NOT NULL COMMENT '학급 ID',
    first_name VARCHAR(50) NOT NULL COMMENT '학생 이름',
    last_name VARCHAR(50) COMMENT '성',
    birth_date DATE COMMENT '생년월일',
    allergy_info TEXT COMMENT '알레르기 정보',
    medication TEXT COMMENT '약 복용 정보',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE
);

-- 4. albums 테이블 (users 참조)
CREATE TABLE albums (
    album_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '앨범 ID',
    album_name VARCHAR(100) NOT NULL COMMENT '앨범 이름',
    album_type ENUM('student', 'class') NOT NULL COMMENT '앨범 종류 (학생 앨범, 학급 앨범)',
    user_id INT COMMENT '업로드한 사용자 (학생 또는 선생님)',
    image_url VARCHAR(255) COMMENT '사진 URL (파일 경로)',
    description TEXT COMMENT '사진 설명',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. in_out_log 테이블 (students 참조)
CREATE TABLE in_out_log (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '출석 ID',
    student_id INT NOT NULL COMMENT '학생 ID',
    check_in_time DATETIME COMMENT '등원 시간',
    check_out_time DATETIME COMMENT '하원 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '기록일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 6. pushNotifications 테이블 (외래키 없음)
CREATE TABLE pushNotifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '알림 ID',
    title VARCHAR(255) NOT NULL COMMENT '알림 제목',
    message TEXT NOT NULL COMMENT '알림 내용',
    recipient_id INT COMMENT '수신자 ID (학생, 선생님, 관리자)',
    recipient_role ENUM('student', 'teacher', 'admin') COMMENT '수신자 역할',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '발송 시간',
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending' COMMENT '발송 상태'
);

-- 7. medicationHistory 테이블 (students 참조)
CREATE TABLE medicationHistory (
    history_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '이력 ID',
    student_id INT NOT NULL COMMENT '학생 ID',
    medication_name VARCHAR(255) NOT NULL COMMENT '약 이름',
    dosage VARCHAR(100) COMMENT '복용량',
    start_date DATE COMMENT '시작일',
    end_date DATE COMMENT '종료일',
    notes TEXT COMMENT '추가 정보',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '기록일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 8. allergyHistory 테이블 (students 참조)
CREATE TABLE allergyHistory (
    history_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '이력 ID',
    student_id INT NOT NULL COMMENT '학생 ID',
    allergy_name VARCHAR(255) NOT NULL COMMENT '알레르기 이름',
    reaction_details TEXT COMMENT '알레르기 반응 상세',
    diagnosis_date DATE COMMENT '진단일',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '기록일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 9. learningProgress 테이블 (students 참조)
CREATE TABLE learningProgress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '진도 ID',
    student_id INT NOT NULL COMMENT '학생 ID',
    subject VARCHAR(100) NOT NULL COMMENT '과목',
    progress_percentage DECIMAL(5,2) NOT NULL COMMENT '학습 진도 (%) (0~100)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '기록일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);
