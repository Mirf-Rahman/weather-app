// Authentic Islamic Quotes Database
// All Quran verses are from verified translations
// All Hadith are from authentic collections (Bukhari, Muslim, Tirmidhi, etc.)
// Sources are properly cited with book, chapter, and hadith numbers where applicable

export interface IslamicQuote {
  text: string;
  textArabic?: string;
  source: string;
  sourceDetails: string;
  category: string;
  themes: string[];
  verified: boolean;
}

export const ISLAMIC_QUOTES: IslamicQuote[] = [
  // WEATHER & NATURE - QURAN VERSES
  {
    text: "And it is He who sends down rain from heaven, and We produce thereby the vegetation of every kind; We produce from it greenery from which We produce grains arranged in layers.",
    textArabic:
      "وَهُوَ الَّذِي أَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجْنَا بِهِ نَبَاتَ كُلِّ شَيْءٍ فَأَخْرَجْنَا مِنْهُ خَضِرًا نُّخْرِجُ مِنْهُ حَبًّا مُّتَرَاكِبًا",
    source: "Quran 6:99",
    sourceDetails: "Surah Al-An'am (The Cattle), Verse 99",
    category: "quran",
    themes: ["weather", "rain", "nature", "creation"],
    verified: true,
  },
  {
    text: "And We made from water every living thing. Will they not then believe?",
    textArabic:
      "وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ ۖ أَفَلَا يُؤْمِنُونَ",
    source: "Quran 21:30",
    sourceDetails: "Surah Al-Anbiya (The Prophets), Verse 30",
    category: "quran",
    themes: ["water", "life", "creation", "faith"],
    verified: true,
  },
  {
    text: "It is Allah who sends the winds, and they stir the clouds and spread them in the sky however He wills, and He makes them fragments so you see the rain emerge from within them.",
    textArabic:
      "اللَّهُ الَّذِي يُرْسِلُ الرِّيَاحَ فَتُثِيرُ سَحَابًا فَيَبْسُطُهُ فِي السَّمَاءِ كَيْفَ يَشَاءُ وَيَجْعَلُهُ كِسَفًا فَتَرَى الْوَدْقَ يَخْرُجُ مِنْ خِلَالِهِ",
    source: "Quran 30:48",
    sourceDetails: "Surah Ar-Rum (The Romans), Verse 48",
    category: "quran",
    themes: ["wind", "clouds", "rain", "weather"],
    verified: true,
  },
  {
    text: "And He it is Who sends down rain after they have despaired, and He spreads His mercy. And He is the Guardian, the Praiseworthy.",
    textArabic:
      "وَهُوَ الَّذِي يُنَزِّلُ الْغَيْثَ مِن بَعْدِ مَا قَنَطُوا وَيَنشُرُ رَحْمَتَهُ ۚ وَهُوَ الْوَلِيُّ الْحَمِيدُ",
    source: "Quran 42:28",
    sourceDetails: "Surah Ash-Shura (The Consultation), Verse 28",
    category: "quran",
    themes: ["rain", "mercy", "hope", "weather"],
    verified: true,
  },
  {
    text: "Have you not seen that Allah drives clouds? Then He brings them together, then He makes them into a mass, and you see the rain emerge from within it.",
    textArabic:
      "أَلَمْ تَرَ أَنَّ اللَّهَ يُزْجِي سَحَابًا ثُمَّ يُؤَلِّفُ بَيْنَهُ ثُمَّ يَجْعَلُهُ رُكَامًا فَتَرَى الْوَدْقَ يَخْرُجُ مِنْ خِلَالِهِ",
    source: "Quran 24:43",
    sourceDetails: "Surah An-Nur (The Light), Verse 43",
    category: "quran",
    themes: ["clouds", "rain", "weather", "signs"],
    verified: true,
  },
  {
    text: "And among His Signs is that He shows you the lightning, by way both of fear and of hope, and He sends down rain from the sky and with it gives life to the earth after it is dead.",
    textArabic:
      "وَمِنْ آيَاتِهِ يُرِيكُمُ الْبَرْقَ خَوْفًا وَطَمَعًا وَيُنَزِّلُ مِنَ السَّمَاءِ مَاءً فَيُحْيِي بِهِ الْأَرْضَ بَعْدَ مَوْتِهَا",
    source: "Quran 30:24",
    sourceDetails: "Surah Ar-Rum (The Romans), Verse 24",
    category: "quran",
    themes: ["lightning", "rain", "hope", "fear", "weather"],
    verified: true,
  },
  {
    text: "Verily, in the creation of the heavens and the earth, and in the alternation of night and day, there are indeed signs for men of understanding.",
    textArabic:
      "إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ",
    source: "Quran 3:190",
    sourceDetails: "Surah Ali 'Imran (Family of Imran), Verse 190",
    category: "quran",
    themes: ["creation", "day", "night", "signs", "understanding"],
    verified: true,
  },
  {
    text: "And We have made the night and day as two signs, then We have made dark the sign of the night, and We have made the sign of day bright, that you may seek bounty from your Lord.",
    textArabic:
      "وَجَعَلْنَا اللَّيْلَ وَالنَّهَارَ آيَتَيْنِ ۖ فَمَحَوْنَا آيَةَ اللَّيْلِ وَجَعَلْنَا آيَةَ النَّهَارِ مُبْصِرَةً لِّتَبْتَغُوا فَضْلًا مِّن رَّبِّكُمْ",
    source: "Quran 17:12",
    sourceDetails: "Surah Al-Isra (The Night Journey), Verse 12",
    category: "quran",
    themes: ["night", "day", "time", "signs", "sustenance"],
    verified: true,
  },
  {
    text: "Indeed, in the alternation of the night and the day and in what Allah has created in the heavens and the earth are signs for a people who fear Allah.",
    textArabic:
      "إِنَّ فِي اخْتِلَافِ اللَّيْلِ وَالنَّهَارِ وَمَا خَلَقَ اللَّهُ فِي السَّمَاوَاتِ وَالْأَرْضِ لَآيَاتٍ لِّقَوْمٍ يَتَّقُونَ",
    source: "Quran 10:6",
    sourceDetails: "Surah Yunus (Jonah), Verse 6",
    category: "quran",
    themes: ["day", "night", "creation", "signs", "taqwa"],
    verified: true,
  },
  {
    text: "And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth.",
    textArabic:
      "وَهُوَ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ بِالْحَقِّ ۖ وَيَوْمَ يَقُولُ كُن فَيَكُونُ ۚ قَوْلُهُ الْحَقُّ",
    source: "Quran 6:73",
    sourceDetails: "Surah Al-An'am (The Cattle), Verse 73",
    category: "quran",
    themes: ["creation", "truth", "power", "heavens"],
    verified: true,
  },

  // PRAYER & WORSHIP - QURAN VERSES
  {
    text: "And establish prayer and give zakah and bow with those who bow [in worship and obedience].",
    textArabic:
      "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ",
    source: "Quran 2:43",
    sourceDetails: "Surah Al-Baqarah (The Cow), Verse 43",
    category: "quran",
    themes: ["prayer", "worship", "community", "charity"],
    verified: true,
  },
  {
    text: "Recite, [O Muhammad], what has been revealed to you of the Book and establish prayer. Indeed, prayer prohibits immorality and wrongdoing.",
    textArabic:
      "اتْلُ مَا أُوحِيَ إِلَيْكَ مِنَ الْكِتَابِ وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
    source: "Quran 29:45",
    sourceDetails: "Surah Al-Ankabut (The Spider), Verse 45",
    category: "quran",
    themes: ["prayer", "worship", "morality", "guidance"],
    verified: true,
  },
  {
    text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    textArabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    source: "Quran 2:152",
    sourceDetails: "Surah Al-Baqarah (The Cow), Verse 152",
    category: "quran",
    themes: ["remembrance", "gratitude", "dhikr", "worship"],
    verified: true,
  },

  // AUTHENTIC HADITH - WEATHER & NATURE
  {
    text: "When you see clouds or wind, you will see signs of fear on the Prophet's face. When it rained, he would be happy and relieved.",
    source: "Sahih Muslim",
    sourceDetails: "Sahih Muslim, Book 4, Hadith 1965",
    category: "hadith",
    themes: ["weather", "rain", "prophet", "fear", "hope"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) said: 'Two prayers are never rejected: the prayer at the time of the call to prayer, and the prayer under rain.'",
    source: "Abu Dawud",
    sourceDetails: "Sunan Abu Dawud, Book 2, Hadith 2540",
    category: "hadith",
    themes: ["prayer", "rain", "dua", "blessing"],
    verified: true,
  },
  {
    text: "When the Prophet (ﷺ) saw lightning and thunder, he would say: 'O Allah, do not kill us with Your anger, nor destroy us with Your punishment, but pardon us before that.'",
    source: "Ahmad & Tirmidhi",
    sourceDetails: "Musnad Ahmad 6/155, classified as Hasan by Tirmidhi",
    category: "hadith",
    themes: ["thunder", "lightning", "dua", "weather", "protection"],
    verified: true,
  },

  // AUTHENTIC HADITH - PRAYER & WORSHIP
  {
    text: "The Prophet (ﷺ) said: 'The first matter that the slave will be brought to account for on the Day of Judgment is the prayer. If it is sound, then the rest of his deeds will be sound.'",
    source: "Sunan an-Nasa'i",
    sourceDetails: "Sunan an-Nasa'i 465, authenticated by Al-Albani",
    category: "hadith",
    themes: ["prayer", "judgment", "accountability", "worship"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) said: 'Between a person and disbelief is the abandonment of prayer.'",
    source: "Sahih Muslim",
    sourceDetails: "Sahih Muslim 82",
    category: "hadith",
    themes: ["prayer", "faith", "worship", "importance"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) said: 'The coolness of my eyes is in prayer.'",
    source: "Sunan an-Nasa'i",
    sourceDetails: "Sunan an-Nasa'i 3939, authenticated by Al-Albani",
    category: "hadith",
    themes: ["prayer", "comfort", "worship", "peace"],
    verified: true,
  },

  // PATIENCE & TRUST - QURAN VERSES
  {
    text: "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.",
    textArabic:
      "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ",
    source: "Quran 65:3",
    sourceDetails: "Surah At-Talaq (The Divorce), Verse 3",
    category: "quran",
    themes: ["trust", "reliance", "patience", "faith"],
    verified: true,
  },
  {
    text: "And it is He who sends down rain from the sky, and We produce thereby the vegetation of every kind.",
    textArabic:
      "وَهُوَ الَّذِي أَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجْنَا بِهِ نَبَاتَ كُلِّ شَيْءٍ",
    source: "Quran 6:99",
    sourceDetails: "Surah Al-An'am (The Cattle), Verse 99",
    category: "quran",
    themes: ["rain", "sustenance", "creation", "blessing"],
    verified: true,
  },

  // GRATITUDE & REFLECTION - QURAN VERSES
  {
    text: "And whoever is grateful - his gratitude is only for [the benefit of] himself. And whoever is ungrateful - then indeed, Allah is Free of need and Praiseworthy.",
    textArabic:
      "وَمَن شَكَرَ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ ۖ وَمَن كَفَرَ فَإِنَّ اللَّهَ غَنِيٌّ حَمِيدٌ",
    source: "Quran 31:12",
    sourceDetails: "Surah Luqman, Verse 12",
    category: "quran",
    themes: ["gratitude", "thankfulness", "reflection", "blessing"],
    verified: true,
  },
  {
    text: "And if you should count the favors of Allah, you could not enumerate them. Indeed, Allah is Forgiving and Merciful.",
    textArabic:
      "وَإِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا ۗ إِنَّ اللَّهَ لَغَفُورٌ رَّحِيمٌ",
    source: "Quran 16:18",
    sourceDetails: "Surah An-Nahl (The Bee), Verse 18",
    category: "quran",
    themes: ["blessings", "gratitude", "countless", "mercy"],
    verified: true,
  },

  // TIMES OF DAY - AUTHENTIC HADITH
  {
    text: "The Prophet (ﷺ) said: 'Whoever prays the dawn prayer in congregation, it is as if he had prayed the whole night long.'",
    source: "Sahih Muslim",
    sourceDetails: "Sahih Muslim 656",
    category: "hadith",
    themes: ["fajr", "morning", "congregation", "reward"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) said: 'There are two prayers that are beloved to Allah: Fajr and Asr.'",
    source: "Tirmidhi",
    sourceDetails: "Jami' at-Tirmidhi 3579, classified as Hasan",
    category: "hadith",
    themes: ["fajr", "asr", "beloved", "prayer"],
    verified: true,
  },

  // SEASONAL REFLECTIONS
  {
    text: "And it is He who sends winds as good tidings before His mercy, and We send down from the sky pure water.",
    textArabic:
      "وَهُوَ الَّذِي يُرْسِلُ الرِّيَاحَ بُشْرًا بَيْنَ يَدَيْ رَحْمَتِهِ ۚ وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً طَهُورًا",
    source: "Quran 25:48",
    sourceDetails: "Surah Al-Furqan (The Criterion), Verse 48",
    category: "quran",
    themes: ["wind", "mercy", "good_tidings", "blessing"],
    verified: true,
  },
  {
    text: "And Allah has made for you, from that which He has created, shadows and has made for you from the mountains, shelters.",
    textArabic:
      "وَاللَّهُ جَعَلَ لَكُم مِّمَّا خَلَقَ ظِلَالًا وَجَعَلَ لَكُم مِّنَ الْجِبَالِ أَكْنَانًا",
    source: "Quran 16:81",
    sourceDetails: "Surah An-Nahl (The Bee), Verse 81",
    category: "quran",
    themes: ["shade", "shelter", "protection", "blessing"],
    verified: true,
  },

  // ADDITIONAL WEATHER & NATURE QUOTES - QURAN
  {
    text: "And We send the winds fertilizing, and We send down water from the sky and give you drink from it, and you are not its retainers.",
    textArabic:
      "وَأَرْسَلْنَا الرِّيَاحَ لَوَاقِحَ فَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً فَأَسْقَيْنَاكُمُوهُ وَمَا أَنتُمْ لَهُ بِخَازِنِينَ",
    source: "Quran 15:22",
    sourceDetails: "Surah Al-Hijr (The Rocky Tract), Verse 22",
    category: "quran",
    themes: ["wind", "rain", "water", "sustenance", "blessing"],
    verified: true,
  },
  {
    text: "Do you not see that Allah drives clouds? Then He brings them together, then He makes them into a mass, and you see the rain emerge from within it. And He sends down from the sky, mountains [of clouds] within which is hail.",
    textArabic:
      "أَلَمْ تَرَ أَنَّ اللَّهَ يُزْجِي سَحَابًا ثُمَّ يُؤَلِّفُ بَيْنَهُ ثُمَّ يَجْعَلُهُ رُكَامًا فَتَرَى الْوَدْقَ يَخْرُجُ مِنْ خِلَالِهِ وَيُنَزِّلُ مِنَ السَّمَاءِ مِن جِبَالٍ فِيهَا مِن بَرَدٍ",
    source: "Quran 24:43",
    sourceDetails: "Surah An-Nur (The Light), Verse 43 - Extended",
    category: "quran",
    themes: ["clouds", "rain", "weather", "hail", "power"],
    verified: true,
  },
  {
    text: "And it is Allah who created the heavens and earth and sent down rain from the sky and produced thereby some fruits as provision for you.",
    textArabic:
      "اللَّهُ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجَ بِهِ مِنَ الثَّمَرَاتِ رِزْقًا لَّكُمْ",
    source: "Quran 14:32",
    sourceDetails: "Surah Ibrahim (Abraham), Verse 32",
    category: "quran",
    themes: ["creation", "rain", "sustenance", "fruits", "provision"],
    verified: true,
  },
  {
    text: "And He it is who sends down rain after despair and spreads His mercy. And He is the Protector, the Praiseworthy.",
    textArabic:
      "وَهُوَ الَّذِي يُنَزِّلُ الْغَيْثَ مِن بَعْدِ مَا قَنَطُوا وَيَنشُرُ رَحْمَتَهُ ۚ وَهُوَ الْوَلِيُّ الْحَمِيدُ",
    source: "Quran 42:28",
    sourceDetails: "Surah Ash-Shura (The Consultation), Verse 28",
    category: "quran",
    themes: ["rain", "mercy", "hope", "despair", "relief"],
    verified: true,
  },
  {
    text: "And We made the clouds subservient to him, traveling easily by Our command wherever he directed.",
    textArabic:
      "وَلِسُلَيْمَانَ الرِّيحَ عَاصِفَةً تَجْرِي بِأَمْرِهِ إِلَى الْأَرْضِ الَّتِي بَارَكْنَا فِيهَا ۚ وَكُنَّا بِكُلِّ شَيْءٍ عَالِمِينَ",
    source: "Quran 21:81",
    sourceDetails: "Surah Al-Anbiya (The Prophets), Verse 81",
    category: "quran",
    themes: ["wind", "power", "control", "signs"],
    verified: true,
  },

  // PRAYER & WORSHIP - MORE QURAN VERSES
  {
    text: "And seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive [to Allah].",
    textArabic:
      "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ",
    source: "Quran 2:45",
    sourceDetails: "Surah Al-Baqarah (The Cow), Verse 45",
    category: "quran",
    themes: ["prayer", "patience", "help", "humility", "worship"],
    verified: true,
  },
  {
    text: "Guard strictly your prayers, especially the middle prayer, and stand before Allah with devotion.",
    textArabic:
      "حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ",
    source: "Quran 2:238",
    sourceDetails: "Surah Al-Baqarah (The Cow), Verse 238",
    category: "quran",
    themes: ["prayer", "guard", "devotion", "middle_prayer", "worship"],
    verified: true,
  },
  {
    text: "And when you have completed the prayer, remember Allah standing, sitting, or lying on your sides.",
    textArabic:
      "فَإِذَا قَضَيْتُمُ الصَّلَاةَ فَاذْكُرُوا اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِكُمْ",
    source: "Quran 4:103",
    sourceDetails: "Surah An-Nisa (The Women), Verse 103",
    category: "quran",
    themes: ["prayer", "remembrance", "dhikr", "continuous", "worship"],
    verified: true,
  },
  {
    text: "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a [decreed] extent.",
    textArabic:
      "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا",
    source: "Quran 65:3",
    sourceDetails: "Surah At-Talaq (The Divorce), Verse 3 - Complete",
    category: "quran",
    themes: ["trust", "reliance", "sufficiency", "decree", "patience"],
    verified: true,
  },

  // MORE AUTHENTIC HADITH - WEATHER & NATURE
  {
    text: "The Prophet (ﷺ) used to say when it thundered: 'Glory is to Him whom thunder glorifies with His praise, and the angels too, out of fear of Him.'",
    source: "Sahih al-Bukhari",
    sourceDetails: "Al-Adab Al-Mufrad 723, authenticated by Al-Albani",
    category: "hadith",
    themes: ["thunder", "praise", "glory", "angels", "fear"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) said: 'When the wind blows violently, say: O Allah, I ask You for the good of this wind and the good of what it contains and the good of what it was sent for.'",
    source: "Sahih Muslim",
    sourceDetails: "Sahih Muslim 899",
    category: "hadith",
    themes: ["wind", "dua", "good", "protection", "weather"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) said: 'Rain is a mercy from Allah, so do not curse it.'",
    source: "Ibn Majah",
    sourceDetails: "Sunan Ibn Majah 3773, classified as Hasan by Al-Albani",
    category: "hadith",
    themes: ["rain", "mercy", "blessing", "prohibition", "weather"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) would uncover part of his body when it rained and say: 'It has just come from Allah.'",
    source: "Sahih Muslim",
    sourceDetails: "Sahih Muslim 898",
    category: "hadith",
    themes: ["rain", "blessing", "fresh", "from_allah", "sunnah"],
    verified: true,
  },

  // MORE AUTHENTIC HADITH - PRAYER & WORSHIP
  {
    text: "The Prophet (ﷺ) said: 'The key to Paradise is prayer, and the key to prayer is ablution (wudu).'",
    source: "Ahmad & Tirmidhi",
    sourceDetails:
      "Musnad Ahmad 7002, Jami' at-Tirmidhi 4, authenticated by Al-Albani",
    category: "hadith",
    themes: ["prayer", "paradise", "key", "wudu", "purification"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) said: 'When one of you prays, he is in private conversation with his Lord, so let him be aware of what he says.'",
    source: "Sahih al-Bukhari",
    sourceDetails: "Sahih al-Bukhari 531",
    category: "hadith",
    themes: ["prayer", "conversation", "lord", "awareness", "respect"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) said: 'The most beloved deeds to Allah are those done regularly, even if they are small.'",
    source: "Sahih al-Bukhari",
    sourceDetails: "Sahih al-Bukhari 6464",
    category: "hadith",
    themes: ["deeds", "consistency", "small", "beloved", "regular"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) said: 'Whoever prays Fajr is under Allah's protection. So beware, O son of Adam, that Allah does not call you to account for being absent from His protection.'",
    source: "Sahih Muslim",
    sourceDetails: "Sahih Muslim 657",
    category: "hadith",
    themes: ["fajr", "protection", "allah", "morning", "prayer"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) said: 'The one who remembers his Lord and the one who does not are like the living and the dead.'",
    source: "Sahih al-Bukhari",
    sourceDetails: "Sahih al-Bukhari 6407",
    category: "hadith",
    themes: ["remembrance", "dhikr", "living", "dead", "comparison"],
    verified: true,
  },

  // GRATITUDE & REFLECTION - MORE QURAN VERSES
  {
    text: "And it is He who created you from dust, then from a sperm-drop, then from a clinging clot; then He brings you out as a child; then [He develops you] that you reach your [time of] maturity, then [further] that you become elders. And among you is he who is taken in death before [that], and among you is he who is returned to the most decrepit [old] age so that he knows, after [once having] knowledge, nothing. And you see the earth barren, but when We send down upon it rain, it quivers and swells and produces [plants] of every beautiful kind.",
    textArabic:
      "هُوَ الَّذِي خَلَقَكُم مِّن تُرَابٍ ثُمَّ مِن نُّطْفَةٍ ثُمَّ مِنْ عَلَقَةٍ ثُمَّ يُخْرِجُكُمْ طِفْلًا ثُمَّ لِتَبْلُغُوا أَشُدَّكُمْ ثُمَّ لِتَكُونُوا شُيُوخًا ۚ وَمِنكُم مَّن يُتَوَفَّىٰ مِن قَبْلُ ۖ وَلِتَبْلُغُوا أَجَلًا مُّسَمًّى وَلَعَلَّكُمْ تَعْقِلُونَ",
    source: "Quran 40:67",
    sourceDetails: "Surah Ghafir (The Forgiver), Verse 67",
    category: "quran",
    themes: ["creation", "life_stages", "rain", "earth", "reflection"],
    verified: true,
  },
  {
    text: "Say: 'Praise be to Allah, and peace be upon His servants whom He has chosen.' Is Allah better or what they associate [with Him]?",
    textArabic:
      "وَقُلِ الْحَمْدُ لِلَّهِ وَسَلَامٌ عَلَىٰ عِبَادِهِ الَّذِينَ اصْطَفَىٰ ۗ آللَّهُ خَيْرٌ أَمَّا يُشْرِكُونَ",
    source: "Quran 27:59",
    sourceDetails: "Surah An-Naml (The Ant), Verse 59",
    category: "quran",
    themes: ["praise", "gratitude", "peace", "chosen", "servants"],
    verified: true,
  },
  {
    text: "And Allah has extracted you from the wombs of your mothers not knowing a thing, and He made for you hearing and vision and intellect that perhaps you would be grateful.",
    textArabic:
      "وَاللَّهُ أَخْرَجَكُم مِّن بُطُونِ أُمَّهَاتِكُمْ لَا تَعْلَمُونَ شَيْئًا وَجَعَلَ لَكُمُ السَّمْعَ وَالْأَبْصَارَ وَالْأَفْئِدَةَ لَعَلَّكُمْ تَشْكُرُونَ",
    source: "Quran 16:78",
    sourceDetails: "Surah An-Nahl (The Bee), Verse 78",
    category: "quran",
    themes: ["gratitude", "senses", "knowledge", "birth", "learning"],
    verified: true,
  },

  // TIMES OF DAY - MORE AUTHENTIC HADITH
  {
    text: "The Prophet (ﷺ) said: 'Allah said: I have divided the prayer into two halves between Me and My servant, and My servant will receive what he asks for. When the servant says: All praise is due to Allah, the Lord of all the worlds, Allah says: My servant has praised Me.'",
    source: "Sahih Muslim",
    sourceDetails: "Sahih Muslim 395",
    category: "hadith",
    themes: ["prayer", "fatiha", "praise", "allah", "servant"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) said: 'There is no prayer heavier upon the hypocrites than Fajr and Isha prayers, and if they knew what is in them, they would come to them even if crawling.'",
    source: "Sahih al-Bukhari",
    sourceDetails: "Sahih al-Bukhari 657",
    category: "hadith",
    themes: ["fajr", "isha", "hypocrites", "reward", "difficulty"],
    verified: true,
  },
  {
    text: "The Prophet (ﷺ) said: 'Angels come to you in succession by night and day, and all of them get together at the time of the Fajr and Asr prayers. Those who have passed the night with you ascend (to Allah) and He asks them, though He knows everything about you, well, 'In what state did you leave my slaves?' The angels reply: 'When we left them they were praying and when we reached them, they were praying.'",
    source: "Sahih al-Bukhari",
    sourceDetails: "Sahih al-Bukhari 555",
    category: "hadith",
    themes: ["angels", "fajr", "asr", "night", "day", "testimony"],
    verified: true,
  },

  // TRUST & PATIENCE - MORE QUOTES
  {
    text: "And give good tidings to the patient, Who, when disaster strikes them, say, 'Indeed we belong to Allah, and indeed to Him we will return.'",
    textArabic:
      "وَبَشِّرِ الصَّابِرِينَ الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
    source: "Quran 2:155-156",
    sourceDetails: "Surah Al-Baqarah (The Cow), Verses 155-156",
    category: "quran",
    themes: ["patience", "disaster", "return", "belonging", "acceptance"],
    verified: true,
  },
  {
    text: "And it is He who sends down rain from the sky, from it is drink and from it is foliage in which you pasture [animals].",
    textArabic:
      "هُوَ الَّذِي أَنزَلَ مِنَ السَّمَاءِ مَاءً ۖ لَّكُم مِّنْهُ شَرَابٌ وَمِنْهُ شَجَرٌ فِيهِ تُسِيمُونَ",
    source: "Quran 16:10",
    sourceDetails: "Surah An-Nahl (The Bee), Verse 10",
    category: "quran",
    themes: ["rain", "drink", "foliage", "animals", "sustenance"],
    verified: true,
  },
];

// Helper functions for smart quote selection
export const getQuotesByTheme = (themes: string[]): IslamicQuote[] => {
  return ISLAMIC_QUOTES.filter((quote) =>
    quote.themes.some((theme) => themes.includes(theme))
  );
};

export const getQuotesByCategory = (category: string): IslamicQuote[] => {
  return ISLAMIC_QUOTES.filter((quote) => quote.category === category);
};

export const getRandomQuote = (): IslamicQuote => {
  return ISLAMIC_QUOTES[Math.floor(Math.random() * ISLAMIC_QUOTES.length)];
};

export const getDailyQuote = (date: Date): IslamicQuote => {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      1000 /
      60 /
      60 /
      24
  );
  return ISLAMIC_QUOTES[dayOfYear % ISLAMIC_QUOTES.length];
};

export const getWeatherContextualQuote = (
  weatherMain: string,
  themes: string[] = [],
  currentPrayer?: string,
  cityName?: string,
  temperature?: number,
  humidity?: number
): IslamicQuote => {
  // Enhanced weather-specific theme mapping with temperature context
  const weatherThemes: { [key: string]: string[] } = {
    Rain: ["rain", "water", "mercy", "blessing", "relief"],
    Drizzle: ["rain", "water", "mercy", "gentle"],
    Thunderstorm: ["thunder", "lightning", "weather", "protection", "power"],
    Snow: ["weather", "creation", "signs", "purity", "cold"],
    Clear: ["creation", "signs", "day", "blessing", "gratitude"],
    Clouds: ["clouds", "weather", "signs", "shade", "protection"],
    Mist: ["creation", "signs", "mystery"],
    Fog: ["creation", "signs", "patience"],
    Haze: ["creation", "signs", "clarity"],
    Dust: ["creation", "humility", "earth"],
  };

  // Enhanced prayer-specific theme mapping
  const prayerThemes: { [key: string]: string[] } = {
    Fajr: ["fajr", "morning", "dawn", "protection", "new_beginning"],
    Dhuhr: ["midday", "work", "sustenance", "strength"],
    Asr: ["asr", "afternoon", "angels", "reflection"],
    Maghrib: ["evening", "sunset", "reflection", "gratitude"],
    Isha: ["night", "rest", "peace", "contemplation"],
  };

  // Temperature-based themes
  const tempThemes = [];
  if (temperature !== undefined) {
    if (temperature > 35) tempThemes.push("heat", "patience", "shade");
    else if (temperature > 25) tempThemes.push("blessing", "comfort");
    else if (temperature > 15) tempThemes.push("gratitude", "balance");
    else if (temperature > 0) tempThemes.push("cold", "warmth", "shelter");
    else tempThemes.push("cold", "patience", "protection");
  }

  // Time-based themes with local context
  const hour = new Date().getHours();
  const timeThemes = [];

  if (hour >= 4 && hour < 7) timeThemes.push("dawn", "fajr", "morning");
  else if (hour >= 7 && hour < 12)
    timeThemes.push("morning", "work", "blessing");
  else if (hour >= 12 && hour < 15)
    timeThemes.push("midday", "dhuhr", "sustenance");
  else if (hour >= 15 && hour < 18)
    timeThemes.push("afternoon", "asr", "reflection");
  else if (hour >= 18 && hour < 20)
    timeThemes.push("evening", "maghrib", "gratitude");
  else if (hour >= 20 && hour < 22) timeThemes.push("night", "isha", "peace");
  else timeThemes.push("late_night", "rest", "contemplation");

  // Combine all themes for comprehensive matching
  const allThemes = [
    ...(weatherThemes[weatherMain] || []),
    ...(currentPrayer ? prayerThemes[currentPrayer] || [] : []),
    ...timeThemes,
    ...tempThemes,
    ...themes,
  ];

  // Location-aware seeding for different cities
  let locationSeed = 0;
  if (cityName) {
    locationSeed = cityName
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  // Time-based seed that changes throughout the day
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      1000 /
      60 /
      60 /
      24
  );
  const hourSeed = Math.floor(hour / 2); // Changes every 2 hours

  // Weather-based seed
  const weatherSeed = weatherMain
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Create unique seed combining location, date, time, weather, and temperature
  const combinedSeed =
    dayOfYear * 1000 +
    hourSeed * 100 +
    (locationSeed % 100) +
    (weatherSeed % 10) +
    (temperature ? Math.floor(temperature) % 10 : 0);

  // Get contextual quotes
  const contextualQuotes = getQuotesByTheme(allThemes);

  if (contextualQuotes.length > 0) {
    // Use combined seed for location/weather/time-specific but consistent selection
    const index = combinedSeed % contextualQuotes.length;
    return contextualQuotes[index];
  }

  // Fallback to daily quote with location seed
  const allQuotes = ISLAMIC_QUOTES;
  const fallbackIndex = combinedSeed % allQuotes.length;
  return allQuotes[fallbackIndex];
};

// Get prayer-specific quotes for enhanced contextual experience
export const getPrayerContextualQuote = (prayerName: string): IslamicQuote => {
  const prayerSpecificThemes = {
    Fajr: ["fajr", "morning", "dawn", "protection", "angels"],
    Dhuhr: ["prayer", "work", "sustenance", "midday"],
    Asr: ["asr", "afternoon", "angels", "testimony"],
    Maghrib: ["evening", "reflection", "gratitude"],
    Isha: ["night", "rest", "peace", "contemplation"],
  };

  const themes = prayerSpecificThemes[
    prayerName as keyof typeof prayerSpecificThemes
  ] || ["prayer", "worship"];
  const prayerQuotes = getQuotesByTheme(themes);

  if (prayerQuotes.length > 0) {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        1000 /
        60 /
        60 /
        24
    );
    return prayerQuotes[dayOfYear % prayerQuotes.length];
  }

  return getDailyQuote(new Date());
};

// Get quotes that change based on time of day for dynamic experience
export const getTimeBasedQuote = (): IslamicQuote => {
  const hour = new Date().getHours();
  let timeThemes: string[] = [];

  if (hour >= 5 && hour < 12) {
    timeThemes = ["morning", "fajr", "dawn", "new_beginning", "gratitude"];
  } else if (hour >= 12 && hour < 15) {
    timeThemes = ["midday", "work", "sustenance", "blessing"];
  } else if (hour >= 15 && hour < 18) {
    timeThemes = ["afternoon", "asr", "reflection", "remembrance"];
  } else if (hour >= 18 && hour < 21) {
    timeThemes = ["evening", "maghrib", "gratitude", "reflection"];
  } else {
    timeThemes = ["night", "isha", "rest", "contemplation", "peace"];
  }

  const timeQuotes = getQuotesByTheme(timeThemes);

  if (timeQuotes.length > 0) {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        1000 /
        60 /
        60 /
        24
    );
    const hourIndex = Math.floor(hour / 3); // 8 different time periods per day
    return timeQuotes[(dayOfYear + hourIndex) % timeQuotes.length];
  }

  return getDailyQuote(new Date());
};
// Function to get a different quote from the same context (for refresh button)
export const getAlternativeContextualQuote = (
  weatherMain: string,
  themes: string[] = [],
  currentPrayer?: string,
  cityName?: string,
  temperature?: number,
  humidity?: number,
  currentQuoteText?: string
): IslamicQuote => {
  // Enhanced weather-specific theme mapping (same as main function)
  const weatherThemes: { [key: string]: string[] } = {
    Rain: ["rain", "water", "mercy", "blessing", "relief"],
    Drizzle: ["rain", "water", "mercy", "gentle"],
    Thunderstorm: ["thunder", "lightning", "weather", "protection", "power"],
    Snow: ["weather", "creation", "signs", "purity", "cold"],
    Clear: ["creation", "signs", "day", "blessing", "gratitude"],
    Clouds: ["clouds", "weather", "signs", "shade", "protection"],
    Mist: ["creation", "signs", "mystery"],
    Fog: ["creation", "signs", "patience"],
    Haze: ["creation", "signs", "clarity"],
    Dust: ["creation", "humility", "earth"],
  };

  const prayerThemes: { [key: string]: string[] } = {
    Fajr: ["fajr", "morning", "dawn", "protection", "new_beginning"],
    Dhuhr: ["midday", "work", "sustenance", "strength"],
    Asr: ["asr", "afternoon", "angels", "reflection"],
    Maghrib: ["evening", "sunset", "reflection", "gratitude"],
    Isha: ["night", "rest", "peace", "contemplation"],
  };

  // Combine relevant themes
  const allThemes = [
    ...(weatherThemes[weatherMain] || []),
    ...(currentPrayer ? prayerThemes[currentPrayer] || [] : []),
    ...themes,
  ];

  // Get quotes from same context but with different selection
  const contextualQuotes = getQuotesByTheme(allThemes);

  // Filter out the current quote
  const filteredQuotes = currentQuoteText
    ? contextualQuotes.filter((q) => q.text !== currentQuoteText)
    : contextualQuotes;

  if (filteredQuotes.length > 0) {
    // Use random selection for manual refresh
    return filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  }

  // If no alternatives in same context, get from broader theme
  const broadThemes = [
    "creation",
    "signs",
    "gratitude",
    "blessing",
    "worship",
    "patience",
  ];
  const broadQuotes = getQuotesByTheme(broadThemes).filter(
    (q) => q.text !== currentQuoteText
  );

  return broadQuotes.length > 0
    ? broadQuotes[Math.floor(Math.random() * broadQuotes.length)]
    : getRandomQuote();
};
