export interface DoaItem {
  id: string;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  count: number;
  fadhilah?: string;
  source?: string;
}

export interface DoaCategory {
  id: string;
  title: string;
  icon: string;
  items: DoaItem[];
}

export const DOA_CATEGORIES: DoaCategory[] = [
  {
    id: "zikir-pagi",
    title: "Zikir Pagi",
    icon: "cloud-outline",
    items: [
      {
        id: "pagi-ayat-kursi",
        title: "Ayat Kursi",
        arabic: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
        latin: "Alloohu laa ilaaha illaa Huwal Hayyul Qoyyuum, laa ta'khudhuhu sinatuw walaa nawm, lahu maa fis-samaawaati wa maa fil-ardh, man dhalladhii yashfa'u 'indahuu illaa bi-idhnih, ya'lamu maa bayna aydiihim wa maa kholfahum, walaa yuhiithuuna bishay-im min 'ilmihii illaa bimaa shaaa', wasi'a kursiyyuhus-samaawaati wal-ardh, walaa ya-uuduhu hifdhuhumaa, wa Huwal 'Aliyyul 'Adhiim.",
        translation: "Allah, tidak ada tuhan selain Dia. Yang Maha Hidup, yang terus-menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dan Dia tidak merasa berat memelihara keduanya, dan Dia Maha Tinggi, Maha Agung.",
        count: 1,
        fadhilah: "Siapa yang membacanya di pagi hari maka ia akan dilindungi dari gangguan jin hingga sore hari.",
        source: "HR. Al-Hakim (1/562)"
      },
      {
        id: "pagi-sayyidul-istighfar",
        title: "Sayyidul Istighfar",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        latin: "Allaahumma anta Rabbii laa ilaaha illaa anta, khalaqtanii wa ana 'abduka wa ana 'alaa 'ahdika wa wa'dika mas-tatha'tu. A'uudzu bika min syarri maa shana'tu, abuu-u laka bini'matika 'alayya, wa abuu-u bi dzanbii faghfir lii fa innahu laa yaghfirudh-dzunuuba illaa anta.",
        translation: "Ya Allah, Engkau adalah Rabbku, tidak ada tuhan selain Engkau. Engkau yang menciptakan aku dan aku adalah hamba-Mu. Aku menetapi perjanjian-Mu dan janji-Mu sesuai dengan kemampuanku. Aku berlindung kepada-Mu dari keburukan apa yang kuperbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku kepada-Mu, maka ampunilah aku. Sebab tidak ada yang mengampuni dosa-dosa selain Engkau.",
        count: 1,
        fadhilah: "Barangsiapa membacanya di siang hari dengan keyakinan lalu meninggal pada hari itu sebelum sore, maka ia termasuk penduduk surga.",
        source: "HR. Bukhari no. 6306"
      },
      {
        id: "pagi-perlindungan",
        title: "Doa Perlindungan Pagi",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        latin: "Bismillaahilladzii laa yadhurru ma'asmihi syai-un fil-ardhi wa laa fis-samaa-i wa Huwas-Samii'ul-'Aliim.",
        translation: "Dengan nama Allah yang bila disebut, segala sesuatu di bumi dan langit tidak akan berbahaya, dan Dia-lah Yang Maha Mendengar lagi Maha Mengetahui.",
        count: 3,
        fadhilah: "Membacanya 3 kali di pagi hari akan menghindarkan dari bahaya atau musibah mendadak hingga sore hari.",
        source: "HR. Abu Dawud dan Tirmidzi"
      },
      {
        id: "pagi-ridho",
        title: "Keridaan Kepada Allah",
        arabic: "رَضِيتُ بِاللَّهِ رَبَّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        latin: "Radhiitu billaahi Rabba, wa bil-Islaami diina, wa bi Muhammadin shallallaahu 'alayhi wa sallama nabiyya.",
        translation: "Aku rida Allah sebagai Rabbku, Islam sebagai agamaku, dan Muhammad shallallahu 'alayhi wa sallam sebagai Nabiku.",
        count: 3,
        fadhilah: "Barangsiapa membacanya 3 kali di pagi hari, Allah berhak untuk meridainya pada hari Kiamat.",
        source: "HR. Abu Dawud & Tirmidzi"
      },
      {
        id: "pagi-ilmu",
        title: "Mohon Ilmu dan Rezeki",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا",
        latin: "Allaahumma inni as-aluka 'ilman naafi'an, wa rizqan thayyiban, wa 'amalan mutaqabbalan.",
        translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik (halal), dan amal yang diterima.",
        count: 1,
        source: "HR. Ibnu Majah"
      }
    ]
  },
  {
    id: "zikir-petang",
    title: "Zikir Petang",
    icon: "partly-sunny-outline",
    items: [
      {
        id: "petang-ayat-kursi",
        title: "Ayat Kursi",
        arabic: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
        latin: "Alloohu laa ilaaha illaa Huwal Hayyul Qoyyuum, laa ta'khudhuhu sinatuw walaa nawm, lahu maa fis-samaawaati wa maa fil-ardh...",
        translation: "Allah, tidak ada tuhan selain Dia. Yang Maha Hidup, yang terus-menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur...",
        count: 1,
        fadhilah: "Siapa yang membacanya di sore hari maka ia akan dilindungi dari gangguan jin hingga pagi hari.",
        source: "HR. Al-Hakim"
      },
      {
        id: "petang-sayyidul-istighfar",
        title: "Sayyidul Istighfar",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        latin: "Allaahumma anta Rabbii laa ilaaha illaa anta, khalaqtanii wa ana 'abduka wa ana 'alaa 'ahdika wa wa'dika mas-tatha'tu. A'uudzu bika min syarri maa shana'tu...",
        translation: "Ya Allah, Engkau adalah Rabbku, tidak ada tuhan selain Engkau. Engkau yang menciptakan aku dan aku adalah hamba-Mu...",
        count: 1,
        fadhilah: "Barangsiapa membacanya di sore hari dengan keyakinan lalu meninggal pada malam itu sebelum pagi, maka ia termasuk penduduk surga.",
        source: "HR. Bukhari"
      },
      {
        id: "petang-perlindungan",
        title: "Doa Perlindungan Sore",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        latin: "Bismillaahilladzii laa yadhurru ma'asmihi syai-un fil-ardhi wa laa fis-samaa-i wa Huwas-Samii'ul-'Aliim.",
        translation: "Dengan nama Allah yang bila disebut, segala sesuatu di bumi dan langit tidak akan berbahaya, dan Dia-lah Yang Maha Mendengar lagi Maha Mengetahui.",
        count: 3,
        fadhilah: "Membacanya 3 kali di sore hari menghindari bahaya dadakan hingga pagi hari.",
        source: "HR. Abu Dawud dan Tirmidzi"
      },
      {
        id: "petang-perlindungan-kalimat-allah",
        title: "Mohon Perlindungan dengan Kalimat Allah",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        latin: "A'uudzu bikalimaatillaahit-taammaati min syarri maa khalaq.",
        translation: "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk yang diciptakan-Nya.",
        count: 3,
        fadhilah: "Membacanya 3 kali di sore hari akan melindunginya dari sengatan serangga/binatang berbisa pada malam itu.",
        source: "HR. Muslim"
      },
      {
        id: "petang-ridho",
        title: "Keridaan Kepada Allah",
        arabic: "رَضِيتُ بِاللَّهِ رَبَّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        latin: "Radhiitu billaahi Rabba, wa bil-Islaami diina, wa bi Muhammadin shallallaahu 'alayhi wa sallama nabiyya.",
        translation: "Aku rida Allah sebagai Rabbku, Islam sebagai agamaku, dan Muhammad shallallahu 'alayhi wa sallam sebagai Nabiku.",
        count: 3,
        fadhilah: "Barangsiapa membacanya 3 kali di sore hari, Allah berhak untuk meridainya pada hari Kiamat.",
        source: "HR. Abu Dawud & Tirmidzi"
      }
    ]
  },
  {
    id: "zikir-setelah-salat",
    title: "Zikir Setelah Salat",
    icon: "checkmark-circle-outline",
    items: [
      {
        id: "shalat-istighfar",
        title: "Istighfar",
        arabic: "أَسْتَغْفِرُ اللَّهَ",
        latin: "Astaghfirullaah.",
        translation: "Aku memohon ampun kepada Allah.",
        count: 3,
        source: "HR. Muslim"
      },
      {
        id: "shalat-salam",
        title: "Doa Keselamatan",
        arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        latin: "Allaahumma antas-salaamu wa minkas-salaam, tabaarakta yaa dzal-jalaali wal-ikraam.",
        translation: "Ya Allah, Engkau-lah keselamatan dan dari-Mu keselamatan, Maha Suci Engkau, wahai Rabb Yang Memiliki Keagungan dan Kemuliaan.",
        count: 1,
        source: "HR. Muslim"
      },
      {
        id: "shalat-tasbih",
        title: "Tasbih",
        arabic: "سُبْحَانَ اللَّهِ",
        latin: "Subhaanallaah.",
        translation: "Maha Suci Allah.",
        count: 33,
        source: "HR. Muslim"
      },
      {
        id: "shalat-tahmid",
        title: "Tahmid",
        arabic: "الْحَمْدُ لِلَّهِ",
        latin: "Alhamdulillaah.",
        translation: "Segala puji bagi Allah.",
        count: 33,
        source: "HR. Muslim"
      },
      {
        id: "shalat-takbir",
        title: "Takbir",
        arabic: "اللَّهُ أَكْبَرُ",
        latin: "Allaahu Akbar.",
        translation: "Allah Maha Besar.",
        count: 33,
        source: "HR. Muslim"
      },
      {
        id: "shalat-tahlil",
        title: "Tahlil Penutup",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        latin: "Laa ilaaha illallaahu wahdahu laa syariika lahu, lahul-mulku wa lahul-hamdu wa huwa 'alaa kulli syai-in qadiir.",
        translation: "Tidak ada tuhan selain Allah Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala puji. Dan Dia Maha Kuasa atas segala sesuatu.",
        count: 1,
        fadhilah: "Membaca Tasbih, Tahmid, Takbir masing-masing 33 kali dan digenapkan ke-100 dengan Tahlil ini akan mengampuni dosa walau sebanyak buih di lautan.",
        source: "HR. Muslim"
      }
    ]
  },
  {
    id: "doa-harian",
    title: "Doa Harian",
    icon: "calendar-outline",
    items: [
      {
        id: "harian-sebelum-makan",
        title: "Doa Sebelum Makan",
        arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
        latin: "Allaahumma baarik lanaa fiimaa razaqtanaa wa qinaa 'adzaaban-naar.",
        translation: "Ya Allah, berkahilah rezeki yang telah Engkau berikan kepada kami, dan peliharalah kami dari siksa api neraka.",
        count: 1,
        source: "HR. Ibnu Sunni"
      },
      {
        id: "harian-setelah-makan",
        title: "Doa Setelah Makan",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
        latin: "Alhamdulillaahilladzii ath'amanaa wa saqaanaa wa ja'alanaa muslimiin.",
        translation: "Segala puji bagi Allah yang telah memberi kami makan dan minum, serta menjadikan kami termasuk golongan orang-orang muslim.",
        count: 1,
        source: "HR. Abu Dawud & Tirmidzi"
      },
      {
        id: "harian-sebelum-tidur",
        title: "Doa Sebelum Tidur",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُOTُ وَأَحْيَا",
        latin: "Bismika allaahumma amuutu wa ahyaa.",
        translation: "Dengan nama-Mu ya Allah, aku mati dan aku hidup.",
        count: 1,
        source: "HR. Bukhari & Muslim"
      },
      {
        id: "harian-bangun-tidur",
        title: "Doa Bangun Tidur",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        latin: "Alhamdulillaahilladzii ahyaanaa ba'da maa amaatanaa wa ilaihin-nusyuur.",
        translation: "Segala puji bagi Allah yang menghidupkan kami kembali setelah mematikan kami (tidur) dan kepada-Nya kami dibangkitkan.",
        count: 1,
        source: "HR. Bukhari"
      },
      {
        id: "harian-masuk-masjid",
        title: "Doa Masuk Masjid",
        arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        latin: "Allaahummaftah lii abwaaba rahmatik.",
        translation: "Ya Allah, bukakanlah bagiku pintu-pintu rahmat-Mu.",
        count: 1,
        source: "HR. Muslim"
      },
      {
        id: "harian-keluar-masjid",
        title: "Doa Keluar Masjid",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
        latin: "Allaahumma inni as-aluka min fadhlik.",
        translation: "Ya Allah, sesungguhnya aku memohon keutamaan dari-Mu.",
        count: 1,
        source: "HR. Muslim"
      }
    ]
  },
  {
    id: "doa-pilihan",
    title: "Doa Pilihan",
    icon: "heart-outline",
    items: [
      {
        id: "pilihan-dunia-akhirat",
        title: "Doa Kebaikan Dunia & Akhirat (Sapu Jagat)",
        arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        latin: "Rabbanaa aatinaa fid-dunyaa hasanataw wa fil-aakhirati hasanataw wa qinaa 'adzaaban-naar.",
        translation: "Ya Rabb kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.",
        count: 1,
        source: "QS. Al-Baqarah: 201"
      },
      {
        id: "pilihan-orang-tua",
        title: "Doa untuk Kedua Orang Tua",
        arabic: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
        latin: "Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.",
        translation: "Ya Rabbku, ampunilah aku dan kedua orang tuaku, dan sayangilah keduanya sebagaimana mereka berdua telah mendidik aku sewaktu kecil.",
        count: 1,
        source: "QS. Al-Isra: 24"
      },
      {
        id: "pilihan-keteguhan-hati",
        title: "Doa Keteguhan Hati",
        arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
        latin: "Yaa Muqallibal quluubi tsabbit qalbii 'alaa diinik.",
        translation: "Wahai Dzat yang membolak-balikkan hati, teguhkanlah hatiku di atas agama-Mu.",
        count: 1,
        source: "HR. Tirmidzi"
      },
      {
        id: "pilihan-kemudahan",
        title: "Doa Memohon Kemudahan",
        arabic: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
        latin: "Allaahumma laa sahla illaa maa ja'altahu sahlan, wa anta taj'alul-hazna idzaa syi'ta sahla.",
        translation: "Ya Allah, tidak ada kemudahan kecuali apa yang Engkau jadikan mudah, dan Engkau dapat menjadikan kesedihan/kesulitan itu mudah jika Engkau menghendaki.",
        count: 1,
        source: "HR. Ibnu Hibban"
      }
    ]
  },
  {
    id: "doa-sakit",
    title: "Doa Ketika Sakit",
    icon: "grid-outline",
    items: [
      {
        id: "sakit-menjenguk",
        title: "Doa Menjenguk Orang Sakit",
        arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِهِ وَأَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا",
        latin: "Allaahumma Rabban-naasi adzhibil-ba'sa, isyfihi wa antasy-syaafii, laa syifaa-a illaa syifaa-uka, syifaa-an laa yughaadiru saqamaa.",
        translation: "Ya Allah, Rabb manusia, hilangkanlah penyakit ini dan sembuhkanlah dia. Engkau adalah Yang Maha Menyembuhkan, tidak ada kesembuhan kecuali kesembuhan-Mu, kesembuhan yang tidak menyisakan penyakit sedikit pun.",
        count: 1,
        source: "HR. Bukhari & Muslim"
      },
      {
        id: "sakit-diri-sendiri",
        title: "Doa Saat Tubuh Terasa Sakit",
        arabic: "أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ",
        latin: "Bismillaah (3x). A'uudzu billaahi wa qudratihii min syarri maa ajidu wa uhaadzir (7x).",
        translation: "Dengan nama Allah (3x). Aku berlindung kepada Allah dan kekuasaan-Nya dari keburukan apa yang kurasakan dan kukhawatirkan (7x).",
        count: 1,
        fadhilah: "Letakkan tanganmu pada tempat yang sakit di tubuhmu, lalu bacalah basmalah 3x dan doa di atas 7x.",
        source: "HR. Muslim"
      },
      {
        id: "sakit-perlindungan-buruk",
        title: "Perlindungan dari Penyakit Buruk",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْبَرَصِ وَالْجُنُونِ وَالْجُذَامِ وَمِنْ سَيِّئِ الْأَسْقَامِ",
        latin: "Allaahumma inni a'uudzu bika minal-barashi wal-junuuni wal-judzaami wa min sayyi-il asqaam.",
        translation: "Ya Allah, sesungguhnya aku berlindung kepada-Mu dari penyakit belang (kusta), gila, lepra, dan dari keburukan segala penyakit (menular/berbahaya).",
        count: 1,
        source: "HR. Abu Dawud"
      }
    ]
  }
];
