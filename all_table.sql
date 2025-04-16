-- --------------------------------------------------------
-- 호스트:                          172.18.0.2
-- 서버 버전:                        8.0.41 - MySQL Community Server - GPL
-- 서버 OS:                        Linux
-- HeidiSQL 버전:                  12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- kids 데이터베이스 구조 내보내기
DROP DATABASE IF EXISTS `kids`;
CREATE DATABASE IF NOT EXISTS `kids` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `kids`;

CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    exam_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 테이블 kids.albums 구조 내보내기
DROP TABLE IF EXISTS `albums`;
CREATE TABLE IF NOT EXISTS `albums` (
  `album_id` int NOT NULL AUTO_INCREMENT COMMENT '앨범 ID',
  `album_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '앨범 이름',
  `album_type` enum('student','class') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '앨범 종류 (학생 앨범, 학급 앨범)',
  `user_id` int DEFAULT NULL COMMENT '업로드한 사용자 (학생 또는 선생님)',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '사진 URL (파일 경로)',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '사진 설명',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  PRIMARY KEY (`album_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `albums_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 kids.albums:~0 rows (대략적) 내보내기

-- 테이블 kids.allergyHistory 구조 내보내기
DROP TABLE IF EXISTS `allergyHistory`;
CREATE TABLE IF NOT EXISTS `allergyHistory` (
  `history_id` int NOT NULL AUTO_INCREMENT COMMENT '이력 ID',
  `student_id` int NOT NULL COMMENT '학생 ID',
  `allergy_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '알레르기 이름',
  `reaction_details` text COLLATE utf8mb4_unicode_ci COMMENT '알레르기 반응 상세',
  `diagnosis_date` date DEFAULT NULL COMMENT '진단일',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '기록일',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  PRIMARY KEY (`history_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `allergyHistory_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 kids.allergyHistory:~0 rows (대략적) 내보내기

-- 테이블 kids.classes 구조 내보내기
DROP TABLE IF EXISTS `classes`;
CREATE TABLE IF NOT EXISTS `classes` (
  `class_id` int NOT NULL AUTO_INCREMENT COMMENT '학급 ID',
  `class_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '학급 이름',
  `teacher_id` int NOT NULL COMMENT '선생님 ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  PRIMARY KEY (`class_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 kids.classes:~0 rows (대략적) 내보내기

-- 테이블 kids.in_out_log 구조 내보내기
DROP TABLE IF EXISTS `in_out_log`;
CREATE TABLE IF NOT EXISTS `in_out_log` (
  `attendance_id` int NOT NULL AUTO_INCREMENT COMMENT '출석 ID',
  `student_id` int NOT NULL COMMENT '학생 ID',
  `check_in_time` datetime DEFAULT NULL COMMENT '등원 시간',
  `check_out_time` datetime DEFAULT NULL COMMENT '하원 시간',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '기록일',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  PRIMARY KEY (`attendance_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `in_out_log_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 kids.in_out_log:~0 rows (대략적) 내보내기

-- 테이블 kids.learningProgress 구조 내보내기
DROP TABLE IF EXISTS `learningProgress`;
CREATE TABLE IF NOT EXISTS `learningProgress` (
  `progress_id` int NOT NULL AUTO_INCREMENT COMMENT '진도 ID',
  `student_id` int NOT NULL COMMENT '학생 ID',
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '과목',
  `progress_percentage` decimal(5,2) NOT NULL COMMENT '학습 진도 (%) (0~100)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '기록일',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  PRIMARY KEY (`progress_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `learningProgress_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 kids.learningProgress:~0 rows (대략적) 내보내기

-- 테이블 kids.medicationHistory 구조 내보내기
DROP TABLE IF EXISTS `medicationHistory`;
CREATE TABLE IF NOT EXISTS `medicationHistory` (
  `history_id` int NOT NULL AUTO_INCREMENT COMMENT '이력 ID',
  `student_id` int NOT NULL COMMENT '학생 ID',
  `medication_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '약 이름',
  `dosage` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '복용량',
  `start_date` date DEFAULT NULL COMMENT '시작일',
  `end_date` date DEFAULT NULL COMMENT '종료일',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT '추가 정보',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '기록일',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  PRIMARY KEY (`history_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `medicationHistory_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 kids.medicationHistory:~0 rows (대략적) 내보내기

-- 테이블 kids.pushNotifications 구조 내보내기
DROP TABLE IF EXISTS `pushNotifications`;
CREATE TABLE IF NOT EXISTS `pushNotifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT COMMENT '알림 ID',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '알림 제목',
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '알림 내용',
  `recipient_id` int DEFAULT NULL COMMENT '수신자 ID (학생, 선생님, 관리자)',
  `recipient_role` enum('student','teacher','admin') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '수신자 역할',
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '발송 시간',
  `status` enum('sent','failed','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT '발송 상태',
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 kids.pushNotifications:~0 rows (대략적) 내보내기

-- 테이블 kids.students 구조 내보내기
DROP TABLE IF EXISTS `students`;
CREATE TABLE IF NOT EXISTS `students` (
  `student_id` int NOT NULL AUTO_INCREMENT COMMENT '학생 ID',
  `user_id` int NOT NULL COMMENT 'users 테이블의 외래 키',
  `class_id` int NOT NULL COMMENT '학급 ID',
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '학생 이름',
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '성',
  `birth_date` date DEFAULT NULL COMMENT '생년월일',
  `allergy_info` text COLLATE utf8mb4_unicode_ci COMMENT '알레르기 정보',
  `medication` text COLLATE utf8mb4_unicode_ci COMMENT '약 복용 정보',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  PRIMARY KEY (`student_id`),
  KEY `user_id` (`user_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `students_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 kids.students:~0 rows (대략적) 내보내기

-- 테이블 kids.users 구조 내보내기
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT COMMENT '사용자 ID',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '사용자명',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '비밀번호 (암호화 저장)',
  `role` enum('student','parent','teacher','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '역할 (학생, 선생님, 관리자)',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '이메일 (로그인용)',
  `googleId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '구글 로그인 ID',
  `kakaoId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '카카오 로그인 ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성일',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '계정 수정일',
  `organization` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 kids.users:~0 rows (대략적) 내보내기
INSERT INTO `users` (`user_id`, `username`, `password`, `role`, `email`, `googleId`, `kakaoId`, `created_at`, `updated_at`, `organization`) VALUES
	(1, 'test', '$2b$10$XuAwdAKMowmyqB8a/zLmr.2QHhMSWaOZpFoZgTsONwIRP12RjUejC', 'teacher', 'c4ex.net@gmail.com', NULL, NULL, '2025-04-16 07:29:41', '2025-04-16 07:29:41', 'A');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
