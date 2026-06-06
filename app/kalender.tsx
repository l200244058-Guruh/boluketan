import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  TextInput,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Header } from "@/components/ui/header";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Button } from "@/components/ui/button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- Tabular Islamic Calendar Bidirectional Conversion Math ---
// Epoch of Islamic calendar is Julian Day 1948439.5
const EPOCH_ISLAMIC = 1948439.5;
const LEAP_YEARS_30_CYCLE = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
const MONTH_NAMES_HIJRI = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Syakban",
  "Ramadan",
  "Syawal",
  "Zulkaidah",
  "Zulhijah",
];

const MONTH_NAMES_GREGORIAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAYS_NAMES_INDO = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// Convert Gregorian Date to Hijri
function gregorianToHijri(date: Date) {
  let day = date.getDate();
  let month = date.getMonth() + 1; // 1-12
  let year = date.getFullYear();

  if (month < 3) {
    year -= 1;
    month += 12;
  }

  let a = Math.floor(year / 100);
  let b = 2 - a + Math.floor(a / 4);

  // Julian Day
  let jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524;

  let diff = jd - EPOCH_ISLAMIC;
  let cycles = Math.floor(diff / 10631);
  let cycleRemainder = diff % 10631;

  let hijriYear = cycles * 30;
  let daysAcc = 0;

  for (let y = 1; y <= 30; y++) {
    let isLeap = LEAP_YEARS_30_CYCLE.includes(y);
    let daysInYear = isLeap ? 355 : 354;
    if (cycleRemainder < daysAcc + daysInYear) {
      hijriYear += y;
      cycleRemainder -= daysAcc;
      break;
    }
    daysAcc += daysInYear;
  }

  let hijriMonth = 1;
  daysAcc = 0;
  for (let m = 1; m <= 12; m++) {
    let daysInMonth = m % 2 === 1 ? 30 : 29;
    if (m === 12 && LEAP_YEARS_30_CYCLE.includes(hijriYear % 30)) {
      daysInMonth = 30;
    }
    if (cycleRemainder < daysAcc + daysInMonth) {
      hijriMonth = m;
      cycleRemainder -= daysAcc;
      break;
    }
    daysAcc += daysInMonth;
  }

  let hijriDay = Math.floor(cycleRemainder) + 1;

  return {
    day: hijriDay,
    month: hijriMonth,
    year: hijriYear,
    monthName: MONTH_NAMES_HIJRI[hijriMonth - 1],
  };
}

// Convert Hijri Date to Gregorian Date
function hijriToGregorian(hYear: number, hMonth: number, hDay: number): Date {
  let cycles = Math.floor((hYear - 1) / 30);
  let yearInCycle = ((hYear - 1) % 30) + 1; // 1-30

  let jd = EPOCH_ISLAMIC + cycles * 10631;

  for (let y = 1; y < yearInCycle; y++) {
    let isLeap = LEAP_YEARS_30_CYCLE.includes(y);
    jd += isLeap ? 355 : 354;
  }

  for (let m = 1; m < hMonth; m++) {
    let daysInMonth = m % 2 === 1 ? 30 : 29;
    if (m === 12 && LEAP_YEARS_30_CYCLE.includes(yearInCycle)) {
      daysInMonth = 30;
    }
    jd += daysInMonth;
  }

  jd += hDay - 1;

  let z = Math.floor(jd + 0.5);
  let f = jd + 0.5 - z;

  let a;
  if (z < 2299161) {
    a = z;
  } else {
    let alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }

  let b = a + 1524;
  let c = Math.floor((b - 122.1) / 365.25);
  let d = Math.floor(365.25 * c);
  let e = Math.floor((b - d) / 30.6001);

  let day = b - d - Math.floor(30.6001 * e) + f;
  let month = e < 14 ? e - 1 : e - 13;
  let year = month > 2 ? c - 4716 : c - 4715;

  return new Date(year, month - 1, Math.round(day));
}

// Lookup Islamic Event / Holiday
function getIslamicEvent(hMonth: number, hDay: number): string | null {
  if (hMonth === 1 && hDay === 1) return "Tahun Baru Islam (1 Muharram)";
  if (hMonth === 1 && hDay === 9) return "Puasa Tasu'a";
  if (hMonth === 1 && hDay === 10) return "Puasa Asyura";
  if (hMonth === 3 && hDay === 12) return "Maulid Nabi Muhammad SAW";
  if (hMonth === 7 && hDay === 27) return "Isra Mikraj Nabi SAW";
  if (hMonth === 8 && hDay === 15) return "Nisfu Syakban";
  if (hMonth === 9 && hDay === 1) return "Awal Ramadan (Hari Pertama Puasa)";
  if (hMonth === 9 && hDay === 17) return "Nuzulul Quran";
  if (hMonth === 10 && hDay === 1) return "Hari Raya Idul Fitri (1 Syawal)";
  if (hMonth === 10 && hDay === 2) return "Hari Raya Idul Fitri (Hari Ke-2)";
  if (hMonth === 12 && hDay === 9) return "Hari Arafah (Puasa Arafah)";
  if (hMonth === 12 && hDay === 10) return "Hari Raya Idul Adha (10 Zulhijah)";
  if (hMonth === 12 && (hDay === 11 || hDay === 12 || hDay === 13)) {
    return `Hari Tasyrik (${hDay} Zulhijah)`;
  }
  return null;
}

// Helper to format Gregorian date in Indonesian format
function formatGregorianDateIndo(date: Date): string {
  const dayName = DAYS_NAMES_INDO[date.getDay()];
  const day = date.getDate();
  const monthName = MONTH_NAMES_GREGORIAN[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
}

export default function KalenderScreen() {
  const router = useRouter();

  // Active Main Tab: "calendar" or "converter"
  const [activeTab, setActiveTab] = useState<"calendar" | "converter">("calendar");

  // Calendar States
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 5, 1)); // Default June 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 5, 3)); // Default selected 3 June 2026

  // Converter States
  const [converterMode, setConverterMode] = useState<"greg2hijri" | "hijri2greg">("greg2hijri");

  // Gregorian inputs (for converter)
  const [gDay, setGDay] = useState("3");
  const [gMonth, setGMonth] = useState("6"); // 1-indexed
  const [gYear, setGYear] = useState("2026");
  const [gResult, setGResult] = useState<any>(null);

  // Hijri inputs (for converter)
  const [hDayInput, setHDayInput] = useState("17");
  const [hMonthInput, setHMonthInput] = useState("12"); // 1-indexed
  const [hYearInput, setHYearInput] = useState("1447");
  const [hResult, setHResult] = useState<any>(null);

  // Dropdown states for picker menus
  const [activePicker, setActivePicker] = useState<"gMonth" | "hMonth" | null>(null);

  // Sync today's date
  const today = useMemo(() => new Date(), []);

  // --- Dynamic Hijri Span calculation for Month ---
  const hijriSpanStr = useMemo(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const firstH = gregorianToHijri(firstDay);
    const lastH = gregorianToHijri(lastDay);

    if (firstH.year !== lastH.year) {
      return `${firstH.monthName} ${firstH.year} H - ${lastH.monthName} ${lastH.year} H`;
    }
    if (firstH.month !== lastH.month) {
      return `${firstH.monthName} - ${lastH.monthName} ${firstH.year} H`;
    }
    return `${firstH.monthName} ${firstH.year} H`;
  }, [currentMonth]);

  // --- Calendar Day Cells builder ---
  const gridCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday

    const blanks = Array(firstDayIndex).fill(null);
    const days = Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, month, i + 1)
    );

    return [...blanks, ...days];
  }, [currentMonth]);

  // Navigate Gregorian Month
  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // Check if a date cell is today
  const isToday = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if a date cell is selected
  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // --- Selected Day Detailed Info ---
  const selectedDayInfo = useMemo(() => {
    const hDate = gregorianToHijri(selectedDate);
    const event = getIslamicEvent(hDate.month, hDate.day);
    
    // Simulate prayer times for selected date using exact salat.tsx offset logic
    const basePrayers = [
      { name: "Subuh", baseTime: "04:30", icon: "cloudy-night-outline" },
      { name: "Terbit", baseTime: "05:43", icon: "sunny-outline" },
      { name: "Zuhur", baseTime: "11:36", icon: "sunny" },
      { name: "Asar", baseTime: "14:57", icon: "partly-sunny-outline" },
      { name: "Magrib", baseTime: "17:27", icon: "sunny-outline" },
      { name: "Isya", baseTime: "18:42", icon: "moon-outline" },
    ];
    const baseDate = new Date(2026, 5, 3); // match base reference
    const diffTime = selectedDate.getTime() - baseDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const minutesOffset = Math.round(Math.sin(diffDays * 0.1) * 3);

    const prayers = basePrayers.map((p) => {
      const [h, m] = p.baseTime.split(":").map(Number);
      let newM = m + minutesOffset;
      let newH = h;
      if (newM >= 60) {
        newM -= 60;
        newH += 1;
      } else if (newM < 0) {
        newM += 60;
        newH -= 1;
      }
      const timeStr = `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`;
      return {
        ...p,
        time: timeStr,
      };
    });

    return {
      gregorianStr: formatGregorianDateIndo(selectedDate),
      hijriStr: `${hDate.day} ${hDate.monthName} ${hDate.year} H`,
      event: event,
      prayers: prayers,
    };
  }, [selectedDate]);

  // --- Dynamic Islamic Holidays List for Calendar Sidebar / Footer ---
  const holidayList = useMemo(() => {
    // Determine the Hijri year range for the current month
    const yearH = gregorianToHijri(currentMonth).year;

    // List of major holidays to convert for the year
    const holidayData = [
      { name: "Tahun Baru Islam (1 Muharram)", month: 1, day: 1 },
      { name: "Puasa Tasu'a (9 Muharram)", month: 1, day: 9 },
      { name: "Puasa Asyura (10 Muharram)", month: 1, day: 10 },
      { name: "Maulid Nabi Muhammad SAW (12 Rabiul Awal)", month: 3, day: 12 },
      { name: "Isra Mikraj Nabi SAW (27 Rajab)", month: 7, day: 27 },
      { name: "Nisfu Syakban (15 Syakban)", month: 8, day: 15 },
      { name: "Hari Pertama Ramadan (Awal Puasa)", month: 9, day: 1 },
      { name: "Nuzulul Quran (17 Ramadan)", month: 9, day: 17 },
      { name: "Hari Raya Idul Fitri (1 Syawal)", month: 10, day: 1 },
      { name: "Hari Arafah (9 Zulhijah)", month: 12, day: 9 },
      { name: "Hari Raya Idul Adha (10 Zulhijah)", month: 12, day: 10 },
    ];

    const mappedCurrent = holidayData.map((h) => {
      const gDate = hijriToGregorian(yearH, h.month, h.day);
      return {
        name: h.name,
        hijriStr: `${h.day} ${MONTH_NAMES_HIJRI[h.month - 1]} ${yearH} H`,
        gregDate: gDate,
        gregStr: formatGregorianDateIndo(gDate),
      };
    });

    // Also include next Hijri year holidays to cover transitions smoothly
    const mappedNext = holidayData.map((h) => {
      const gDate = hijriToGregorian(yearH + 1, h.month, h.day);
      return {
        name: h.name,
        hijriStr: `${h.day} ${MONTH_NAMES_HIJRI[h.month - 1]} ${yearH + 1} H`,
        gregDate: gDate,
        gregStr: formatGregorianDateIndo(gDate),
      };
    });

    // Filter to only include those relevant to the current year or next, sorted chronologically
    return [...mappedCurrent, ...mappedNext]
      .filter((h) => h.gregDate.getFullYear() === currentMonth.getFullYear())
      .sort((a, b) => a.gregDate.getTime() - b.gregDate.getTime());
  }, [currentMonth]);

  // --- Perform Conversions ---
  const handleGregToHijriConversion = () => {
    const dayVal = parseInt(gDay);
    const monthVal = parseInt(gMonth);
    const yearVal = parseInt(gYear);

    if (
      isNaN(dayVal) ||
      isNaN(monthVal) ||
      isNaN(yearVal) ||
      dayVal < 1 ||
      dayVal > 31 ||
      monthVal < 1 ||
      monthVal > 12 ||
      yearVal < 1900 ||
      yearVal > 2100
    ) {
      alert("Masukkan tanggal Gregorian yang valid (1900 - 2100).");
      return;
    }

    const testDate = new Date(yearVal, monthVal - 1, dayVal);
    const hResultObj = gregorianToHijri(testDate);
    const event = getIslamicEvent(hResultObj.month, hResultObj.day);

    setGResult({
      gregStr: formatGregorianDateIndo(testDate),
      hijriStr: `${hResultObj.day} ${hResultObj.monthName} ${hResultObj.year} H`,
      event: event,
      rawDate: testDate,
    });
  };

  const handleHijriToGregConversion = () => {
    const dayVal = parseInt(hDayInput);
    const monthVal = parseInt(hMonthInput);
    const yearVal = parseInt(hYearInput);

    if (
      isNaN(dayVal) ||
      isNaN(monthVal) ||
      isNaN(yearVal) ||
      dayVal < 1 ||
      dayVal > 30 ||
      monthVal < 1 ||
      monthVal > 12 ||
      yearVal < 1300 ||
      yearVal > 1600
    ) {
      alert("Masukkan tanggal Hijriah yang valid (1300 - 1600 H).");
      return;
    }

    const gResultDate = hijriToGregorian(yearVal, monthVal, dayVal);
    const event = getIslamicEvent(monthVal, dayVal);

    setHResult({
      hijriStr: `${dayVal} ${MONTH_NAMES_HIJRI[monthVal - 1]} ${yearVal} H`,
      gregStr: formatGregorianDateIndo(gResultDate),
      event: event,
      rawDate: gResultDate,
    });
  };

  const viewConvertedOnCalendar = (date: Date) => {
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setSelectedDate(date);
    setActiveTab("calendar");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0E1A39", "#0B0F1C"]} style={StyleSheet.absoluteFillObject} />

      {/* Header Bar */}
      <Header
        title="Kalender Islami"
        theme="dark"
        onBackPress={() => router.back()}
        titleStyle={styles.headerTitle}
        containerStyle={styles.header}
      />

      {/* Tab Segment Controls */}
      <SegmentedControl
        options={[
          {
            label: "Kalender",
            value: "calendar",
            icon: (
              <Ionicons
                name="calendar-outline"
                size={18}
                color={activeTab === "calendar" ? "#FFFFFF" : "rgba(255,255,255,0.6)"}
              />
            ),
          },
          {
            label: "Konverter",
            value: "converter",
            icon: (
              <Ionicons
                name="swap-horizontal-outline"
                size={18}
                color={activeTab === "converter" ? "#FFFFFF" : "rgba(255,255,255,0.6)"}
              />
            ),
          },
        ]}
        selectedValue={activeTab}
        onValueChange={setActiveTab}
        containerStyle={styles.tabsContainer}
        tabStyle={styles.tabButton}
        activeTabStyle={styles.tabButtonActive}
        labelStyle={styles.tabText}
        activeLabelStyle={styles.tabTextActive}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === "calendar" ? (
          // --- TAB 1: CALENDAR VIEW ---
          <View style={styles.tabView}>
            {/* Month Selector Navigation */}
            <Card variant="elevated" style={styles.calendarCard}>
              <View style={styles.monthSelectorRow}>
                <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.monthNavButton}>
                  <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.monthLabelContainer}>
                  <Text style={styles.gregMonthLabel}>
                    {MONTH_NAMES_GREGORIAN[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </Text>
                  <Text style={styles.hijriSpanLabel}>{hijriSpanStr}</Text>
                </View>

                <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.monthNavButton}>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Days of Week Header */}
              <View style={styles.weekdaysRow}>
                {DAYS_NAMES_INDO.map((dayName, idx) => (
                  <Text key={idx} style={styles.weekdayText}>
                    {dayName.substring(0, 3)}
                  </Text>
                ))}
              </View>

              {/* Monthly Grid */}
              <View style={styles.gridContainer}>
                {gridCells.map((dateVal, idx) => {
                  if (dateVal === null) {
                    return <View key={`blank-${idx}`} style={styles.gridCellEmpty} />;
                  }

                  const isDateToday = isToday(dateVal);
                  const isDateSelected = isSelected(dateVal);
                  const hijriDateInfo = gregorianToHijri(dateVal);
                  const hasHoliday = getIslamicEvent(hijriDateInfo.month, hijriDateInfo.day) !== null;

                  return (
                    <TouchableOpacity
                      key={dateVal.toISOString()}
                      style={[
                        styles.gridCell,
                        isDateSelected && styles.gridCellSelected,
                        isDateToday && styles.gridCellToday,
                      ]}
                      onPress={() => setSelectedDate(dateVal)}
                      activeOpacity={0.8}
                    >
                      {/* Cell Content */}
                      <Text
                        style={[
                          styles.dayGregNumber,
                          isDateSelected && styles.dayGregNumberSelected,
                        ]}
                      >
                        {dateVal.getDate()}
                      </Text>
                      <Text
                        style={[
                          styles.dayHijriNumber,
                          isDateSelected && styles.dayHijriNumberSelected,
                          hasHoliday && !isDateSelected && styles.dayHijriNumberHoliday,
                        ]}
                      >
                        {hijriDateInfo.day}
                      </Text>

                      {/* Event Indicator Dot */}
                      {hasHoliday && (
                        <View
                          style={[
                            styles.eventDot,
                            isDateSelected ? styles.eventDotSelected : styles.eventDotActive,
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* Selected Day Detailed Info Panel */}
            <Card variant="elevated" style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <Ionicons name="time-outline" size={20} color="#FFD60A" />
                <View style={styles.detailCardTitleContainer}>
                  <Text style={styles.detailCardHijriTitle}>{selectedDayInfo.hijriStr}</Text>
                  <Text style={styles.detailCardGregSubtitle}>{selectedDayInfo.gregorianStr}</Text>
                </View>
              </View>

              {/* Event display if any */}
              {selectedDayInfo.event && (
                <View style={styles.eventBanner}>
                  <FontAwesome5 name="star-of-david" size={14} color="#FFD60A" style={styles.eventBannerIcon} />
                  <Text style={styles.eventBannerText}>{selectedDayInfo.event}</Text>
                </View>
              )}

              {/* Display Prayer times for selected date */}
              <View style={styles.prayersDivider} />
              <Text style={styles.prayersSectionTitle}>Jadwal Salat Hari Ini</Text>
              <View style={styles.prayerTimesGrid}>
                {selectedDayInfo.prayers.map((prayerItem, idx) => (
                  <View key={idx} style={styles.prayerGridItem}>
                    <Ionicons name={prayerItem.icon as any} size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.prayerGridTime}>{prayerItem.time}</Text>
                    <Text style={styles.prayerGridLabel}>{prayerItem.name}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Islamic Holidays list for the viewed Gregorian Year */}
            <View style={styles.holidaysSection}>
              <Text style={styles.sectionTitle}>Hari Besar Islam ({currentMonth.getFullYear()})</Text>
              {holidayList.length > 0 ? (
                holidayList.map((h, idx) => {
                  const isCurrentDayHoliday =
                    selectedDate.getDate() === h.gregDate.getDate() &&
                    selectedDate.getMonth() === h.gregDate.getMonth() &&
                    selectedDate.getFullYear() === h.gregDate.getFullYear();

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.holidayListItem,
                        isCurrentDayHoliday && styles.holidayListItemActive,
                      ]}
                      onPress={() => setSelectedDate(h.gregDate)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.holidayListLeft}>
                        <View style={styles.holidayBadge}>
                          <Ionicons name="moon-outline" size={14} color="#FFD60A" />
                        </View>
                        <View style={styles.holidayTextContainer}>
                          <Text style={styles.holidayNameText}>{h.name}</Text>
                          <Text style={styles.holidayHijriText}>{h.hijriStr}</Text>
                        </View>
                      </View>
                      <View style={styles.holidayListRight}>
                        <Text style={styles.holidayGregText}>{h.gregStr.split(",")[1].trim()}</Text>
                        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.4)" />
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardText}>
                    Tidak ada hari besar pada tahun ini.
                  </Text>
                </View>
              )}
            </View>

            {/* Disclaimer Disclaimer */}
            <Text style={styles.disclaimerText}>
              * Kalender didasarkan pada perhitungan hisab tabular. Penentuan hari besar (Ramadan &
              Hari Raya) secara resmi tetap mengacu pada keputusan sidang isbat Kementerian Agama
              RI.
            </Text>
          </View>
        ) : (
          // --- TAB 2: DATE CONVERTER VIEW ---
          <View style={styles.tabView}>
            {/* Mode Selector Toggle */}
            <View style={styles.modeToggleRow}>
              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  converterMode === "greg2hijri" && styles.modeToggleButtonActive,
                ]}
                onPress={() => setConverterMode("greg2hijri")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modeToggleText,
                    converterMode === "greg2hijri" && styles.modeToggleTextActive,
                  ]}
                >
                  Masehi ke Hijriah
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  converterMode === "hijri2greg" && styles.modeToggleButtonActive,
                ]}
                onPress={() => setConverterMode("hijri2greg")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modeToggleText,
                    converterMode === "hijri2greg" && styles.modeToggleTextActive,
                  ]}
                >
                  Hijriah ke Masehi
                </Text>
              </TouchableOpacity>
            </View>

            {converterMode === "greg2hijri" ? (
              // SUBTAB A: Gregorian to Hijri Form
              <Card variant="elevated" style={styles.converterFormCard}>
                <Text style={styles.formTitle}>Konversi Masehi ke Hijriah</Text>
                
                <View style={styles.formInputsRow}>
                  {/* Day Picker */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tanggal</Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setGDay((prev) => Math.max(1, parseInt(prev) - 1).toString())}
                      >
                        <Text style={styles.stepperBtnText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.stepperInput}
                        keyboardType="number-pad"
                        value={gDay}
                        onChangeText={setGDay}
                      />
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setGDay((prev) => Math.min(31, parseInt(prev) + 1).toString())}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Month Select */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Bulan</Text>
                    <TouchableOpacity
                      style={styles.selectTriggerButton}
                      onPress={() => setActivePicker((prev) => (prev === "gMonth" ? null : "gMonth"))}
                    >
                      <Text style={styles.selectTriggerText}>
                        {MONTH_NAMES_GREGORIAN[parseInt(gMonth) - 1] || "Pilih"}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  {/* Year Picker */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tahun</Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setGYear((prev) => Math.max(1900, parseInt(prev) - 1).toString())}
                      >
                        <Text style={styles.stepperBtnText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.stepperInput}
                        keyboardType="number-pad"
                        value={gYear}
                        onChangeText={setGYear}
                      />
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setGYear((prev) => Math.min(2100, parseInt(prev) + 1).toString())}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Gregorian Month Dropdown overlay */}
                {activePicker === "gMonth" && (
                  <View style={styles.pickerOverlay}>
                    <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                      {MONTH_NAMES_GREGORIAN.map((mName, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.pickerItem}
                          onPress={() => {
                            setGMonth((index + 1).toString());
                            setActivePicker(null);
                          }}
                        >
                          <Text style={styles.pickerItemText}>{mName}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Button
                  label="Konversi Sekarang"
                  onPress={handleGregToHijriConversion}
                  style={styles.convertButtonGradient}
                  textStyle={styles.convertButtonText}
                />

                {/* Gregorian Result Display */}
                {gResult && (
                  <Card variant="elevated" style={styles.resultCard}>
                    <Text style={styles.resultHeaderLabel}>Hasil Konversi</Text>
                    <View style={styles.resultDetailsBox}>
                      <Text style={styles.resultPrimaryText}>{gResult.hijriStr}</Text>
                      <Text style={styles.resultSecondaryText}>Dari: {gResult.gregStr}</Text>
                      {gResult.event && (
                        <View style={styles.resultEventBadge}>
                          <FontAwesome5 name="star-of-david" size={10} color="#FFD60A" />
                          <Text style={styles.resultEventText}>{gResult.event}</Text>
                        </View>
                      )}
                    </View>
                    <Button
                      label="Lihat di Kalender"
                      variant="outline"
                      onPress={() => viewConvertedOnCalendar(gResult.rawDate)}
                      style={styles.viewOnCalButton}
                      textStyle={styles.viewOnCalText}
                      icon={<Ionicons name="calendar-outline" size={16} color="#2F58E8" />}
                    />
                  </Card>
                )}
              </Card>
            ) : (
              // SUBTAB B: Hijri to Gregorian Form
              <Card variant="elevated" style={styles.converterFormCard}>
                <Text style={styles.formTitle}>Konversi Hijriah ke Masehi</Text>

                <View style={styles.formInputsRow}>
                  {/* Day Picker */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Hari</Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setHDayInput((prev) => Math.max(1, parseInt(prev) - 1).toString())}
                      >
                        <Text style={styles.stepperBtnText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.stepperInput}
                        keyboardType="number-pad"
                        value={hDayInput}
                        onChangeText={setHDayInput}
                      />
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setHDayInput((prev) => Math.min(30, parseInt(prev) + 1).toString())}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Hijri Month Select */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Bulan</Text>
                    <TouchableOpacity
                      style={styles.selectTriggerButton}
                      onPress={() => setActivePicker((prev) => (prev === "hMonth" ? null : "hMonth"))}
                    >
                      <Text style={styles.selectTriggerText}>
                        {MONTH_NAMES_HIJRI[parseInt(hMonthInput) - 1] || "Pilih"}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  {/* Hijri Year Picker */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tahun (H)</Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setHYearInput((prev) => Math.max(1300, parseInt(prev) - 1).toString())}
                      >
                        <Text style={styles.stepperBtnText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.stepperInput}
                        keyboardType="number-pad"
                        value={hYearInput}
                        onChangeText={setHYearInput}
                      />
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setHYearInput((prev) => Math.min(1600, parseInt(prev) + 1).toString())}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Hijri Month Dropdown overlay */}
                {activePicker === "hMonth" && (
                  <View style={styles.pickerOverlay}>
                    <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                      {MONTH_NAMES_HIJRI.map((mName, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.pickerItem}
                          onPress={() => {
                            setHMonthInput((index + 1).toString());
                            setActivePicker(null);
                          }}
                        >
                          <Text style={styles.pickerItemText}>{mName}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Button
                  label="Konversi Sekarang"
                  onPress={handleHijriToGregConversion}
                  style={styles.convertButtonGradient}
                  textStyle={styles.convertButtonText}
                />

                {/* Hijri Result Display */}
                {hResult && (
                  <Card variant="elevated" style={styles.resultCard}>
                    <Text style={styles.resultHeaderLabel}>Hasil Konversi</Text>
                    <View style={styles.resultDetailsBox}>
                      <Text style={styles.resultPrimaryText}>{hResult.gregStr}</Text>
                      <Text style={styles.resultSecondaryText}>Dari: {hResult.hijriStr}</Text>
                      {hResult.event && (
                        <View style={styles.resultEventBadge}>
                          <FontAwesome5 name="star-of-david" size={10} color="#FFD60A" />
                          <Text style={styles.resultEventText}>{hResult.event}</Text>
                        </View>
                      )}
                    </View>
                    <Button
                      label="Lihat di Kalender"
                      variant="outline"
                      onPress={() => viewConvertedOnCalendar(hResult.rawDate)}
                      style={styles.viewOnCalButton}
                      textStyle={styles.viewOnCalText}
                      icon={<Ionicons name="calendar-outline" size={16} color="#2F58E8" />}
                    />
                  </Card>
                )}
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0F1C",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerRightPlaceholder: {
    width: 32,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: "#2F58E8",
    shadowColor: "#2F58E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  tabView: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  calendarCard: {
    backgroundColor: "#131C38",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  monthSelectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    paddingBottom: 16,
    marginBottom: 12,
  },
  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  monthLabelContainer: {
    alignItems: "center",
    flex: 1,
  },
  gregMonthLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  hijriSpanLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekdayText: {
    width: (SCREEN_WIDTH - 64) / 7,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    fontWeight: "600",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridCell: {
    width: (SCREEN_WIDTH - 64) / 7,
    height: (SCREEN_WIDTH - 64) / 7 + 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    borderRadius: 12,
    position: "relative",
  },
  gridCellEmpty: {
    width: (SCREEN_WIDTH - 64) / 7,
    height: (SCREEN_WIDTH - 64) / 7 + 6,
  },
  gridCellSelected: {
    backgroundColor: "#2F58E8",
  },
  gridCellToday: {
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  dayGregNumber: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  dayGregNumberSelected: {
    color: "#FFFFFF",
  },
  dayHijriNumber: {
    position: "absolute",
    bottom: 2,
    right: 4,
    fontSize: 9,
    color: "rgba(255, 255, 255, 0.4)",
    fontWeight: "600",
  },
  dayHijriNumberSelected: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  dayHijriNumberHoliday: {
    color: "#FFD60A",
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "absolute",
    top: 6,
  },
  eventDotActive: {
    backgroundColor: "#FFD60A",
  },
  eventDotSelected: {
    backgroundColor: "#FFFFFF",
  },
  detailCard: {
    backgroundColor: "#131C38",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 18,
    marginTop: 16,
  },
  detailCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailCardTitleContainer: {
    marginLeft: 12,
  },
  detailCardHijriTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  detailCardGregSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
    fontWeight: "500",
  },
  eventBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 214, 10, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 214, 10, 0.2)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  eventBannerIcon: {
    marginRight: 8,
  },
  eventBannerText: {
    color: "#FFD60A",
    fontSize: 13,
    fontWeight: "600",
  },
  prayersDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 14,
  },
  prayersSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  prayerTimesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  prayerGridItem: {
    width: "31%",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  prayerGridTime: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  prayerGridLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  holidaysSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  holidayListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#131C38",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  holidayListItemActive: {
    borderColor: "#2F58E8",
    backgroundColor: "rgba(47, 88, 232, 0.08)",
  },
  holidayListLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  holidayBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 214, 10, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  holidayTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  holidayNameText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  holidayHijriText: {
    fontSize: 11.5,
    color: "rgba(255, 255, 255, 0.4)",
    marginTop: 2,
  },
  holidayListRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  holidayGregText: {
    fontSize: 11.5,
    color: "rgba(255, 255, 255, 0.6)",
    marginRight: 6,
    fontWeight: "500",
  },
  emptyCard: {
    backgroundColor: "#131C38",
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
  },
  emptyCardText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
  },
  disclaimerText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    lineHeight: 16,
    marginTop: 24,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  modeToggleRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  modeToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  modeToggleButtonActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  modeToggleTextActive: {
    color: "#FFFFFF",
  },
  converterFormCard: {
    backgroundColor: "#131C38",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 18,
    position: "relative",
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  formInputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 1,
  },
  inputContainer: {
    width: "31%",
  },
  inputLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 6,
    fontWeight: "600",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  stepperBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepperInput: {
    flex: 1,
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    paddingVertical: 4,
  },
  selectTriggerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 38,
  },
  selectTriggerText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
    marginRight: 4,
  },
  pickerOverlay: {
    backgroundColor: "#1C2A54",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 180,
    zIndex: 10,
  },
  pickerScroll: {
    padding: 4,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  pickerItemText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
  convertButton: {
    marginTop: 18,
    borderRadius: 12,
    overflow: "hidden",
  },
  convertButtonGradient: {
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  convertButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  resultCard: {
    backgroundColor: "rgba(47, 88, 232, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(47, 88, 232, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  resultHeaderLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2F58E8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resultDetailsBox: {
    alignItems: "center",
    paddingVertical: 8,
  },
  resultPrimaryText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  resultSecondaryText: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
    textAlign: "center",
    fontWeight: "500",
  },
  resultEventBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 214, 10, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 214, 10, 0.25)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  resultEventText: {
    color: "#FFD60A",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 6,
  },
  viewOnCalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 14,
  },
  viewOnCalText: {
    color: "#2F58E8",
    fontSize: 12.5,
    fontWeight: "700",
    marginLeft: 6,
  },
});
