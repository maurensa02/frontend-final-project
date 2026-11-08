// Sumber data resmi kurikulum Informatika 2024 dari db.json
// Fakultas Ilmu Komputer - Universitas Klabat
// Disinkronkan langsung dari db.json tanpa rekaan atau modifikasi data

export const METADATA = {
  "systemName": "AI-Based Academic Planning System",
  "institution": "Universitas Klabat",
  "faculty": "Fakultas Ilmu Komputer",
  "studyProgram": "Informatika",
  "curriculum": "2024",
  "dataSource": "Dokumen kurikulum yang diberikan pengguna",
  "gradesIncluded": false,
  "note": "Data ini merupakan transkripsi dari dokumen pengguna dan perlu diverifikasi terhadap dokumen resmi program studi sebelum digunakan untuk keputusan akademik."
};

export const ACADEMIC_RULES = {
  "graduationCredits": 151,
  "semesterCreditLimits": [
    {
      "minimumGpa": 3.35,
      "maximumCredits": 23
    },
    {
      "minimumGpa": 0,
      "maximumGpaExclusive": 3.35,
      "maximumCredits": 20
    }
  ],
  "electiveCourses": {
    "selectionPolicy": "student_choice",
    "description": "Mahasiswa dapat memilih mata kuliah pilihan."
  },
  "crossSemesterEnrollment": {
    "allowed": true,
    "condition": "Seluruh prasyarat mata kuliah telah terpenuhi."
  },
  "courseRetake": {
    "status": "needs_clarification",
    "userProvidedPartialRule": "Pengulangan mata kuliah jika nilai C- ...",
    "description": null
  }
};

export const TOTAL_GRADUATION_CREDITS = 151;

// Seluruh 90 mata kuliah resmi dari db.json
export const COURSES = [
  {
    "code": "UNKL041",
    "name": "Pendidikan Keterampilan / Work Education",
    "credits": 1,
    "recommendedSemester": 0,
    "type": "Prerequisite",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL151",
    "name": "Pendidikan Fisik dan Kesehatan / Physical and Health Education",
    "credits": 1,
    "recommendedSemester": 0,
    "type": "Prerequisite",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFPT180",
    "name": "Matematika / Mathematics",
    "credits": 2,
    "recommendedSemester": 0,
    "type": "Prerequisite",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFUK191",
    "name": "Keterampilan Komputer Dasar / Basic Computer Skill",
    "credits": 3,
    "recommendedSemester": 0,
    "type": "Prerequisite",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL020",
    "name": "Bahasa Inggris Pemula / Basic English",
    "credits": 3,
    "recommendedSemester": 0,
    "type": "Prerequisite",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFAP171",
    "name": "Pemrograman Komputer / Computer Programming",
    "credits": 6,
    "recommendedSemester": 1,
    "type": "Basic",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL111",
    "name": "Teladan Kehidupan I / The Exemplary Living I",
    "credits": 2,
    "recommendedSemester": 1,
    "type": "General",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL121",
    "name": "Bahasa Inggris Pra Dasar / Pre-Elementary English",
    "credits": 3,
    "recommendedSemester": 1,
    "type": "General",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKV131",
    "name": "Pengantar Pemikiran Komputasional / Introduction to Computational Thinking",
    "credits": 3,
    "recommendedSemester": 1,
    "type": "General",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFPT181",
    "name": "Dasar Aljabar Linear / Fundamental Linear Algebra",
    "credits": 3,
    "recommendedSemester": 1,
    "type": "Basic",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UKWN102",
    "name": "Pendidikan Pancasila / Indonesian Ideology",
    "credits": 2,
    "recommendedSemester": 1,
    "type": "General",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL113",
    "name": "Filosofi Pendidikan Kristen / Philosophy of Christian Education",
    "credits": 2,
    "recommendedSemester": 2,
    "type": "General",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFPT182",
    "name": "Matematika Diskrit / Discrete Mathematics",
    "credits": 3,
    "recommendedSemester": 2,
    "type": "General",
    "prerequisites": [
      "IFPT180"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFPT186",
    "name": "Logika Informatika / Informatics Logic",
    "credits": 3,
    "recommendedSemester": 2,
    "type": "Basic",
    "prerequisites": [
      "IFKV131"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UKWN103",
    "name": "Pendidikan Kewarganegaraan / Indonesian Civics",
    "credits": 2,
    "recommendedSemester": 2,
    "type": "General",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFAP172",
    "name": "Struktur Data dan Algoritma / Data Structure and Algorithms",
    "credits": 3,
    "recommendedSemester": 2,
    "type": "Major",
    "prerequisites": [
      "IFKV131"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UKWN101",
    "name": "Bahasa Indonesia / Indonesian Language",
    "credits": 2,
    "recommendedSemester": 2,
    "type": "General",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL112",
    "name": "Teladan Kehidupan II / The Exemplary Living II",
    "credits": 2,
    "recommendedSemester": 2,
    "type": "General",
    "prerequisites": [
      "UNKL111"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL122",
    "name": "Bahasa Inggris Dasar / Elementary English",
    "credits": 3,
    "recommendedSemester": 2,
    "type": "General",
    "prerequisites": [
      "UNKL121"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFPT281",
    "name": "Statistik dan Probabilitas / Statistics and Probability",
    "credits": 3,
    "recommendedSemester": 3,
    "type": "Major",
    "prerequisites": [
      "IFPT180"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL211",
    "name": "Prinsip-Prinsip Nilai Kristiani / The Principles of Christian Values",
    "credits": 2,
    "recommendedSemester": 3,
    "type": "General",
    "prerequisites": [
      "UNKL112"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFGI241",
    "name": "Perancangan Web / Web Design",
    "credits": 3,
    "recommendedSemester": 3,
    "type": "Major",
    "prerequisites": [
      "IFAP172"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFAK261",
    "name": "Organisasi dan Arsitektur Komputer / Computer Organization and Architecture",
    "credits": 3,
    "recommendedSemester": 3,
    "type": "General",
    "prerequisites": [
      "IFPT186"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL221",
    "name": "Bahasa Inggris Pra Menengah I / Pre-Intermediate English I",
    "credits": 3,
    "recommendedSemester": 3,
    "type": "General",
    "prerequisites": [
      "UNKL122"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFMI251",
    "name": "Pengantar Basisdata / Introduction to Database",
    "credits": 3,
    "recommendedSemester": 3,
    "type": "Major",
    "prerequisites": [
      "IFKV131"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFPT283",
    "name": "Kalkulus / Calculus",
    "credits": 3,
    "recommendedSemester": 3,
    "type": "Basic",
    "prerequisites": [
      "IFPT180"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL212",
    "name": "Orang Muda dan Dunia / Youth and the World",
    "credits": 2,
    "recommendedSemester": 4,
    "type": "General",
    "prerequisites": [
      "UNKL211"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFAP272",
    "name": "Teknik Automata dan Kompilasi / Automata and Compilation Techniques",
    "credits": 3,
    "recommendedSemester": 4,
    "type": "Major",
    "prerequisites": [
      "IFPT182"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFAK262",
    "name": "Jaringan Komputer I / Computer Network I",
    "credits": 3,
    "recommendedSemester": 4,
    "type": "Major",
    "prerequisites": [
      "IFAK261"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFMI252",
    "name": "Sistem Manajemen Basisdata / Database Management System",
    "credits": 3,
    "recommendedSemester": 4,
    "type": "Major",
    "prerequisites": [
      "IFMI251"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKV232",
    "name": "Sistem Cerdas / Expert System",
    "credits": 3,
    "recommendedSemester": 4,
    "type": "Major",
    "prerequisites": [
      "IFPT180"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFAP274",
    "name": "Pemrograman Berorientasi Objek / Object Oriented Programming",
    "credits": 3,
    "recommendedSemester": 4,
    "type": "Major",
    "prerequisites": [
      "IFAP171"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL222",
    "name": "Bahasa Inggris Pra Menengah II / Pre-Intermediate English II",
    "credits": 3,
    "recommendedSemester": 4,
    "type": "General",
    "prerequisites": [
      "UNKL221"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL311",
    "name": "Kehidupan Keluarga / Family Living",
    "credits": 2,
    "recommendedSemester": 5,
    "type": "General",
    "prerequisites": [
      "UNKL212"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFMI351",
    "name": "Pengembangan Web Front-End / Front-End Web Development",
    "credits": 3,
    "recommendedSemester": 5,
    "type": "Major",
    "prerequisites": [
      "IFAP274"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFAK361",
    "name": "Jaringan Komputer II / Computer Network II",
    "credits": 3,
    "recommendedSemester": 5,
    "type": "Major",
    "prerequisites": [
      "IFAK262"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFRL311",
    "name": "Analisis dan Perancangan Sistem / System Analysis and Design",
    "credits": 3,
    "recommendedSemester": 5,
    "type": "Major",
    "prerequisites": [
      "IFAP171"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFRL313",
    "name": "Metodologi Penelitian / Research Method",
    "credits": 3,
    "recommendedSemester": 5,
    "type": "Major",
    "prerequisites": [
      "IFPT281"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKJ321",
    "name": "Konsep Sistem Operasi / Operating System Concept",
    "credits": 3,
    "recommendedSemester": 5,
    "type": "Major",
    "prerequisites": [
      "IFAK261"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFGI341",
    "name": "Interaksi Manusia dan Komputer / Human and Computer Interaction",
    "credits": 3,
    "recommendedSemester": 5,
    "type": "Major",
    "prerequisites": [
      "IFAP274"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL312",
    "name": "Kehidupan di Akhir Zaman / End Time Living",
    "credits": 2,
    "recommendedSemester": 6,
    "type": "General",
    "prerequisites": [
      "UNKL212"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFAP372",
    "name": "Pemrograman Visual / Visual Programming",
    "credits": 3,
    "recommendedSemester": 6,
    "type": "Major",
    "prerequisites": [
      "IFMI251"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFGI342",
    "name": "Grafika Komputer / Computer Graphics",
    "credits": 3,
    "recommendedSemester": 6,
    "type": "Major",
    "prerequisites": [
      "IFAP274"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFRL312",
    "name": "Rekayasa Perangkat Lunak / Software Engineering",
    "credits": 3,
    "recommendedSemester": 6,
    "type": "Major",
    "prerequisites": [
      "IFGI341"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFMI352",
    "name": "Pengembangan Web Back-End / Back-End Web Development",
    "credits": 3,
    "recommendedSemester": 6,
    "type": "Major",
    "prerequisites": [
      "IFMI351"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKV332",
    "name": "Kecerdasan Buatan / Artificial Intelligence",
    "credits": 3,
    "recommendedSemester": 6,
    "type": "Major",
    "prerequisites": [
      "IFKV232"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFRL314",
    "name": "Pengembangan Perangkat Bergerak / Mobile Application Development",
    "credits": 3,
    "recommendedSemester": 6,
    "type": "Major",
    "prerequisites": [
      "IFGI341"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFGI441",
    "name": "Pengantar Pengembangan Game / Introduction to Game Development",
    "credits": 3,
    "recommendedSemester": 7,
    "type": "Major",
    "prerequisites": [
      "IFAP372"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFRL411",
    "name": "Skripsi I / Research Project I",
    "credits": 3,
    "recommendedSemester": 7,
    "type": "Major",
    "prerequisites": [
      "IFRL313"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFAP471",
    "name": "Pemrograman Sistem / System Programming",
    "credits": 3,
    "recommendedSemester": 7,
    "type": "Major",
    "prerequisites": [
      "IFKJ321"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKV531",
    "name": "Penambangan dan Pergudangan Data / Data Mining and Warehousing",
    "credits": 3,
    "recommendedSemester": 7,
    "type": "Major",
    "prerequisites": [
      "IFMI252"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFMI451",
    "name": "Etika Komputer / Computer Ethics",
    "credits": 2,
    "recommendedSemester": 7,
    "type": "Major",
    "prerequisites": [
      "IFRL313"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKV432",
    "name": "Robotika / Robotics",
    "credits": 3,
    "recommendedSemester": 8,
    "type": "Major",
    "prerequisites": [
      "IFKJ321"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFMI452",
    "name": "Proyek-Capstone Kewirausahaan / Entrepreneur-Project Capstone",
    "credits": 3,
    "recommendedSemester": 8,
    "type": "Major",
    "prerequisites": [
      "IFMI252"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFRL412",
    "name": "Skripsi II / Research Project II",
    "credits": 3,
    "recommendedSemester": 8,
    "type": "Major",
    "prerequisites": [
      "IFRL411"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL423",
    "name": "Komunikasi Bisnis Bahasa Inggris / Business English Communication",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "General",
    "prerequisites": [
      "UNKL321"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM477",
    "name": "Mata Kuliah Pilihan untuk Studi Independen 10 / Elective Course for Specific Independent Study 10",
    "credits": 1,
    "recommendedSemester": 9,
    "type": "Minor",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM423",
    "name": "Pengembangan Profesional di Industri Teknologi Informasi / Professional Development in Information Technology Industry II",
    "credits": 4,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM321",
    "name": "Pengalaman Kerja di Industri Teknologi Informasi / Industrial Experience in Information Technology",
    "credits": 8,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKV535",
    "name": "Komputer Visi / Computer Vision",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Elective",
    "prerequisites": [
      "IFKV332"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM372",
    "name": "Mata Kuliah Pilihan untuk Studi Independen 2 / Elective Course for Specific Independent Study 2",
    "credits": 8,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM473",
    "name": "Mata Kuliah Pilihan untuk Studi Independen 6 / Elective Course for Specific Independent Study 6",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFGI542",
    "name": "Prinsip-Prinsip Desain Kreatif / Principles of Creative Design",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Elective",
    "prerequisites": [
      "IFGI342"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFRL511",
    "name": "Rekayasa DevOps / DevOps Engineering",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Elective",
    "prerequisites": [
      "IFMI352"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "BIES352",
    "name": "Menulis Kajian Literatur / Literature Review Writing",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "General",
    "prerequisites": [
      "UNKL321"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM478",
    "name": "Mata Kuliah Pilihan untuk Studi Independen 11 / Elective Course for Specific Independent Study 11",
    "credits": 1,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM322",
    "name": "Pengalaman Praktek di Bidang Teknologi Informasi / Information Technology Practice in Industrial Experience",
    "credits": 8,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFAK561",
    "name": "Keamanan Komputer / Computer Security",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Elective",
    "prerequisites": [
      "IFAK361"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM373",
    "name": "Mata Kuliah Pilihan untuk Studi Independen 3 / Elective Course for Specific Independent Study 3",
    "credits": 4,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL322",
    "name": "Bahasa Inggris Menengah II / Intermediate English II",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "General",
    "prerequisites": [
      "UNKL321"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM474",
    "name": "Mata Kuliah Pilihan untuk Studi Independen 7 / Elective Course for Specific Independent Study 7",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKV532",
    "name": "Pemrosesan Bahasa Alami / Natural Language Processing",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Elective",
    "prerequisites": [
      "IFKV332"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM421",
    "name": "Pengalaman Kerja di Industri Teknologi Informasi / Industrial Experience in Information Technology II",
    "credits": 8,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFRL512",
    "name": "Manajemen Proyek / Project Management",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Elective",
    "prerequisites": [
      "IFMI352"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM323",
    "name": "Pengembangan Profesional di Industri Teknologi Informasi / Professional Development in Information Technology Industry",
    "credits": 4,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKJ521",
    "name": "Internet untuk Segala / Internet of Things",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Elective",
    "prerequisites": [
      "IFKJ321"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM471",
    "name": "Mata Kuliah Pilihan untuk Studi Independen 4 / Elective Course for Specific Independent Study 4",
    "credits": 4,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL421",
    "name": "Bahasa Inggris Bisnis Membaca dan Kosakata / Business English Reading and Vocabulary",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "General",
    "prerequisites": [
      "UNKL321"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM475",
    "name": "Mata Kuliah Pilihan untuk Studi Independen 8 / Elective Course for Specific Independent Study 8",
    "credits": 2,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFGI541",
    "name": "Desain untuk Visualisasi dan Komunikasi / Design for Visualization and Communication",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Elective",
    "prerequisites": [
      "IFGI441"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKV533",
    "name": "Pembelajaran Mesin / Machine Learning",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Elective",
    "prerequisites": [
      "IFKV332"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL422",
    "name": "Korespondensi Bisnis Bahasa Inggris / Business English Correspondence",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "General",
    "prerequisites": [
      "UNKL321"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM476",
    "name": "Mata Kuliah Pilihan untuk Studi Independen 9 / Elective Course for Specific Independent Study 9",
    "credits": 2,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM422",
    "name": "Pengalaman Praktek di Bidang Teknologi Informasi / Information Technology Practice in Industrial Experience II",
    "credits": 8,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFRL513",
    "name": "Verifikasi dan Validasi Perangkat Lunak / Software Verification and Validation",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Elective",
    "prerequisites": [
      "IFRL312"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM371",
    "name": "Mata Kuliah Pilihan untuk Studi Independen 1 / Elective Course for Specific Independent Study 1",
    "credits": 8,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "UNKL321",
    "name": "Bahasa Inggris Menengah I / Intermediate English I",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "General",
    "prerequisites": [
      "UNKL222"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKM472",
    "name": "Mata Kuliah Pilihan untuk Studi Independen 5 / Elective Course for Specific Independent Study 5",
    "credits": 4,
    "recommendedSemester": 9,
    "type": "Major",
    "prerequisites": [],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFGI543",
    "name": "Pengantar Animasi / Introduction to Animation",
    "credits": 3,
    "recommendedSemester": 9,
    "type": "Elective",
    "prerequisites": [
      "IFGI342"
    ],
    "verificationStatus": "from_provided_curriculum"
  },
  {
    "code": "IFKV534",
    "name": "Pencarian Informasi / Information Retrieval",
    "credits": 3,
    "recommendedSemester": 9,
    "type": null,
    "prerequisites": [],
    "verificationStatus": "needs_verification"
  }
];

// Alias CURRICULUM_COURSES untuk kompatibilitas
export const CURRICULUM_COURSES = COURSES;

// Subset mata kuliah matrikulasi / dasar (Semester 0)
export const PREREQUISITE_COURSES = COURSES.filter((c) => c.recommendedSemester === 0);

// Subset mata kuliah paket reguler (Semester 1 - 8: 142 SKS)
export const REGULAR_COURSES = COURSES.filter(
  (c) => c.recommendedSemester >= 1 && c.recommendedSemester <= 8
);

// Subset mata kuliah pilihan peminatan (Semester 9, type 'Elective')
export const ELECTIVE_COURSES = COURSES.filter((c) => c.type === 'Elective');

// Subset mata kuliah Studi Independen / MBKM (Semester 9, kode IFKM...)
export const INDEPENDENT_STUDY_COURSES = COURSES.filter(
  (c) => typeof c.code === 'string' && c.code.startsWith('IFKM')
);

// Subset mata kuliah Bahasa Inggris Lanjutan & Komunikasi (Semester 9)
export const ADVANCED_ENGLISH_COURSES = COURSES.filter(
  (c) => c.recommendedSemester === 9 && c.type === 'General'
);

// Mata kuliah yang masih memerlukan verifikasi dari pihak fakultas
export const UNVERIFIED_COURSES = COURSES.filter(
  (c) => c.verificationStatus === 'needs_verification' || c.type === null
);
