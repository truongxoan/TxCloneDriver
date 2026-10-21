import { DriveFileItem } from "./driveEndpointsContext";
import { getJunkDetail } from "./junkFilter";

export type FileRoleType =
  | "course_study"
  | "os_installer"
  | "software"
  | "automation_tool"
  | "game_mod"
  | "private_vault"
  | "license_key"
  | "movie_video"
  | "music_audio"
  | "document"
  | "image"
  | "archive_misc"
  | "junk_ghost"
  | "folder";

export interface FileRoleInfo {
  role: FileRoleType;
  label: string;
  groupLabel: string;
  badgeColor: string;
  textColor: string;
  iconType: "disc" | "software" | "zap" | "key" | "film" | "music" | "doc" | "image" | "archive" | "junk" | "graduation" | "game" | "lock" | "folder";
  description: string;
}

export type StorageSortOption =
  | "size-desc"
  | "size-asc"
  | "name-asc"
  | "name-desc"
  | "date-desc"
  | "date-asc"
  | "role";

export type MusicSubGenre = "all" | "bay_phong" | "viet_mix" | "china_co_phong";

/**
 * Detects specific vibe/genre of DJ Nonstop / Vinahouse tracks
 */
export function detectMusicSubGenre(name: string): MusicSubGenre {
  const lower = name.toLowerCase();
  if (
    lower.includes("vietmix") ||
    lower.includes("việt mix") ||
    lower.includes("that tinh") ||
    lower.includes("thất tình") ||
    lower.includes("nho em") ||
    lower.includes("nhớ em") ||
    lower.includes("tinh dang") ||
    lower.includes("tình dang") ||
    lower.includes("nhac vang") ||
    lower.includes("nhạc vàng") ||
    lower.includes("chot roi xa") ||
    lower.includes("chợt rời xa") ||
    lower.includes("em va noi nho") ||
    lower.includes("em và nỗi nhớ")
  ) {
    return "viet_mix";
  }
  if (
    lower.includes("china") ||
    lower.includes("xich linh") ||
    lower.includes("xích linh") ||
    lower.includes("tay trai chi trang") ||
    lower.includes("tay trái chỉ trăng")
  ) {
    return "china_co_phong";
  }
  if (
    lower.includes("ke") ||
    lower.includes("kẹo") ||
    lower.includes("trôi") ||
    lower.includes("kem") ||
    lower.includes("bay") ||
    lower.includes("cảnh") ||
    lower.includes("bồng lai") ||
    lower.includes("tiên") ||
    lower.includes("bố đời") ||
    lower.includes("phòng") ||
    lower.includes("ép đi") ||
    lower.includes("sập") ||
    lower.includes("cực phẩm") ||
    lower.includes("hái sao") ||
    lower.includes("dòng chảy")
  ) {
    return "bay_phong";
  }
  return "all";
}

/**
 * Classifies any drive item into a distinct, human-understandable role.
 */
export function classifyFileRole(item: {
  name: string;
  sizeBytes?: number;
  mimeType?: string;
  isFolder?: boolean;
}): FileRoleInfo {
  const name = item.name.trim();
  const lower = name.toLowerCase();
  const size = item.sizeBytes ?? 0;
  const mime = item.mimeType?.toLowerCase() || "";
  const isFolder = !!item.isFolder || mime.includes("folder") || mime === "application/vnd.google-apps.folder";

  // 1. Check if it is a known system / ghost junk file
  const junkDetail = getJunkDetail(item);
  if (junkDetail) {
    return {
      role: "junk_ghost",
      label: junkDetail.categoryLabel,
      groupLabel: "File rác & File ẩn",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      textColor: "text-rose-400",
      iconType: "junk",
      description: junkDetail.reason,
    };
  }

  // 1.1 Special handling for Folders (Categories by folder topic)
  if (isFolder) {
    if (
      lower.includes("khoa hoc") ||
      lower.includes("khóa học") ||
      lower.includes("khoahoc") ||
      lower.includes("course") ||
      lower.includes("tutorial") ||
      lower.includes("bai giang") ||
      lower.includes("bài giảng") ||
      lower.includes("giao trinh") ||
      lower.includes("giáo trình") ||
      lower.includes("tieng trung") ||
      lower.includes("tiếng trung") ||
      lower.includes("hsk") ||
      lower.includes("lap trinh") ||
      lower.includes("lập trình") ||
      lower.includes("python") ||
      lower.includes("study") ||
      lower.includes("hoc tap") ||
      lower.includes("học tập") ||
      lower.includes("tailieu") ||
      lower.includes("tài liệu")
    ) {
      let specificLabel = "📁 Thư mục Khóa học & Bài giảng";
      let desc = "Thư mục chứa video bài giảng, tài liệu giáo trình và tài nguyên học tập.";

      if (lower.includes("tieng trung") || lower.includes("tiếng trung") || lower.includes("hsk")) {
        specificLabel = "📁 Thư mục Học Tiếng Trung HSK";
        desc = "Thư mục bài giảng, tài liệu luyện thi và file nghe tiếng Trung chuẩn HSK.";
      } else if (lower.includes("lap trinh") || lower.includes("lập trình") || lower.includes("python")) {
        specificLabel = "📁 Thư mục Khóa học Lập trình";
        desc = "Thư mục bài giảng, tài liệu kỹ thuật và mã nguồn học lập trình.";
      }

      return {
        role: "course_study",
        label: specificLabel,
        groupLabel: "Khóa học & Học tập",
        badgeColor: "bg-indigo-500/25 text-indigo-200 border-indigo-400/50 shadow-sm",
        textColor: "text-indigo-300",
        iconType: "folder",
        description: desc,
      };
    }

    if (lower.includes("game") || lower.includes("mod") || lower.includes("rom")) {
      return {
        role: "game_mod",
        label: "📁 Thư mục Game & Mods",
        groupLabel: "Game & Auto CF",
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
        textColor: "text-cyan-400",
        iconType: "folder",
        description: "Thư mục lưu trữ bộ cài game, tiện ích mod và ROMs giả lập.",
      };
    }

    if (lower.includes("nhac") || lower.includes("nhạc") || lower.includes("audio") || lower.includes("music")) {
      return {
        role: "music_audio",
        label: "📁 Thư mục Âm nhạc & DJ",
        groupLabel: "Âm nhạc & Audio",
        badgeColor: "bg-pink-500/20 text-pink-300 border-pink-400/40",
        textColor: "text-pink-400",
        iconType: "folder",
        description: "Thư mục tuyển tập bài hát, album nhạc Nonstop và Vinahouse.",
      };
    }

    // Default general folder
    return {
      role: "folder",
      label: "📁 Thư mục Google Drive",
      groupLabel: "Thư mục Drive",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      textColor: "text-amber-400",
      iconType: "folder",
      description: "Thư mục lưu trữ trên Google Drive. Bấm để mở hoặc khám phá nội dung bên trong.",
    };
  }

  // 2. Windows OS / Ghost OS / ISO Installers (High priority)
  if (
    lower.includes("windows11") ||
    lower.includes("windows10") ||
    lower.includes("windows 11") ||
    lower.includes("windows 10") ||
    lower.includes("win11") ||
    lower.includes("win10") ||
    lower.endsWith(".iso") ||
    mime.includes("iso9660") ||
    (lower.includes("premium") && (lower.endsWith(".7z") || lower.endsWith(".iso")))
  ) {
    let specificLabel = "Bộ cài Hệ điều hành Windows";
    let desc = "Bản cài đặt hệ điều hành Windows đầy đủ, có thể bung ghost hoặc tạo USB boot.";

    if (lower.includes("workstation")) {
      specificLabel = "Bộ cài Windows 11 Workstation";
      desc = "Bản cài đặt Windows 11 Pro dành cho máy trạm Workstation hiệu năng cao.";
    } else if (lower.includes("pro-premium") || lower.includes("pro")) {
      specificLabel = "Bộ cài Windows 11 Pro";
      desc = "Bản cài đặt Windows 11 Professional cao cấp tích hợp sẵn tinh chỉnh tối ưu.";
    } else if (lower.includes("home-sl") || lower.includes("home")) {
      specificLabel = "Bộ cài Windows 11 Home SL";
      desc = "Bản cài đặt Windows 11 Home Single Language nhẹ mượt, ổn định.";
    } else if (lower.includes("10_build") || lower.includes("windows.10")) {
      specificLabel = "File ISO Windows 10 (64-bit)";
      desc = "Tệp ảnh đĩa ISO cài đặt Windows 10 Build 1809 64-bit nguyên gốc.";
    }

    return {
      role: "os_installer",
      label: specificLabel,
      groupLabel: "Hệ điều hành & OS",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/40",
      textColor: "text-blue-400",
      iconType: "disc",
      description: desc,
    };
  }

  // 3. License Keys, Activation Scripts & Credentials
  if (
    lower.startsWith("key-") ||
    lower.includes("key-win") ||
    lower.includes("activation") ||
    lower.includes("anhdvshop") ||
    lower.includes("serial") ||
    lower.includes("license") ||
    (lower.endsWith(".txt") && size < 2048 && (lower.includes("key") || lower.includes("pass")))
  ) {
    let specificLabel = "Mã bản quyền / Kích hoạt";
    let desc = "Thông tin khóa kích hoạt hoặc kịch bản bản quyền phần mềm.";

    if (lower.includes("key-win-10") || lower.includes("key-win")) {
      specificLabel = "Key Bản quyền Windows 10/11";
      desc = "Khóa mã kích hoạt số bản quyền Windows.";
    } else if (lower.includes("online.activation") || lower.includes("activation.script")) {
      specificLabel = "Script Kích hoạt Bản quyền (MAS/KMS)";
      desc = "Bộ công cụ kịch bản kích hoạt Windows & Office tự động.";
    } else if (lower.includes("anhdvshop")) {
      specificLabel = "Thông tin Nguồn & Pass Anhdv Boot";
      desc = "Tệp văn bản chứa liên kết nguồn hoặc mật khẩu giải nén bộ cứu hộ.";
    }

    return {
      role: "license_key",
      label: specificLabel,
      groupLabel: "Key & Bản quyền",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      textColor: "text-amber-400",
      iconType: "key",
      description: desc,
    };
  }

  // 4. Private Vault & Confidential Archives (Discreetly protected)
  if (
    lower.includes("jav") ||
    lower.includes("vlxx") ||
    lower.includes("18+") ||
    lower.includes("phim_set") ||
    lower.includes("nhay_cam")
  ) {
    return {
      role: "private_vault",
      label: "Kho Tệp Riêng Tư (Mật khẩu)",
      groupLabel: "Dữ liệu Riêng tư & Bảo mật",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/40",
      textColor: "text-purple-400",
      iconType: "lock",
      description: "Tệp lưu trữ riêng tư, khuyến nghị quản lý trong Két sắt số bí mật.",
    };
  }

  // 5. Courses, Study Materials, Textbooks & Educational Resources
  if (
    lower.includes("khoa hoc") ||
    lower.includes("khóa học") ||
    lower.includes("khoahoc") ||
    lower.includes("course") ||
    lower.includes("tutorial") ||
    lower.includes("bai giang") ||
    lower.includes("bài giảng") ||
    lower.includes("giao trinh") ||
    lower.includes("giáo trình") ||
    lower.includes("tieng trung") ||
    lower.includes("tiếng trung") ||
    lower.includes("hsk") ||
    lower.includes("lap trinh") ||
    lower.includes("lập trình") ||
    lower.includes("python") ||
    lower.includes("javascript") ||
    lower.includes("typescript") ||
    lower.includes("react") ||
    lower.includes("fullstack") ||
    lower.includes("frontend") ||
    lower.includes("backend") ||
    lower.includes("hoc tap") ||
    lower.includes("học tập") ||
    lower.includes("sach") ||
    lower.includes("sách") ||
    lower.includes("ebook") ||
    lower.includes("tailieu") ||
    lower.includes("tài liệu") ||
    lower.includes("de thi") ||
    lower.includes("đề thi") ||
    lower.includes("flashcard") ||
    lower.includes("tieng anh") ||
    lower.includes("english") ||
    lower.includes("toeic") ||
    lower.includes("ielts")
  ) {
    let specificLabel = "Khóa học & Tài liệu học tập";
    let desc = "Tài liệu học tập, giáo trình hoặc video bài giảng chuyên sâu.";

    if (lower.includes("tieng trung") || lower.includes("tiếng trung") || lower.includes("hsk")) {
      specificLabel = "Giáo trình / Khóa học Tiếng Trung";
      desc = "Bộ tài liệu, bài giảng và từ vựng tiếng Trung chuẩn HSK.";
    } else if (
      lower.includes("lap trinh") ||
      lower.includes("python") ||
      lower.includes("react") ||
      lower.includes("javascript") ||
      lower.includes("fullstack")
    ) {
      specificLabel = "Khóa học Lập trình & CNTT";
      desc = "Video bài giảng và mã nguồn thực hành lập trình phần mềm.";
    } else if (lower.includes("sach") || lower.includes("sách") || lower.includes("ebook")) {
      specificLabel = "Sách & Ebook Điện tử";
      desc = "Sách điện tử, cẩm nang kiến thức tra cứu học tập.";
    } else if (lower.includes("tieng anh") || lower.includes("english") || lower.includes("toeic") || lower.includes("ielts")) {
      specificLabel = "Khóa học Tiếng Anh";
      desc = "Tài liệu và giáo trình luyện thi tiếng Anh.";
    }

    return {
      role: "course_study",
      label: specificLabel,
      groupLabel: "Khóa học & Giáo trình",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40",
      textColor: "text-indigo-400",
      iconType: "graduation",
      description: desc,
    };
  }

  // 6. Game Mods & Game Tools
  if (
    lower.includes("autocf") ||
    lower.includes("dot kich") ||
    lower.includes("đột kích") ||
    lower.includes("crossfire")
  ) {
    return {
      role: "game_mod",
      label: "Mã nguồn Auto Game CF",
      groupLabel: "Game & Giải trí",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      textColor: "text-cyan-400",
      iconType: "game",
      description: "Bộ mã nguồn kịch bản tự động cho game Đột Kích.",
    };
  }

  // 4. Software & System Utilities
  if (
    lower.includes("vmware") ||
    lower.includes("partition.wizard") ||
    lower.includes("office.20") ||
    lower.includes("coreldraw") ||
    lower.includes("mydockfinder") ||
    lower.includes("photoshop") ||
    lower.includes("autocad") ||
    lower.includes("illustrator") ||
    lower.includes("premiere")
  ) {
    let specificLabel = "Phần mềm & Tiện ích";
    let desc = "Phần mềm ứng dụng hoặc tiện ích hệ thống hoàn chỉnh.";

    if (lower.includes("vmware")) {
      specificLabel = "Máy ảo VMware Workstation 16";
      desc = "Phần mềm tạo và quản lý máy ảo đa nền tảng chuyên nghiệp.";
    } else if (lower.includes("partition.wizard")) {
      specificLabel = "Tiện ích Quản lý Phân vùng Ổ cứng";
      desc = "Công cụ phân chia, định dạng và cứu dữ liệu ổ cứng MiniTool Partition Wizard.";
    } else if (lower.includes("office")) {
      specificLabel = "Bộ Cài đặt Microsoft Office (C2R)";
      desc = "Trình cài đặt và cấu hình bộ ứng dụng văn phòng Word, Excel, PowerPoint.";
    } else if (lower.includes("coreldraw")) {
      specificLabel = "Phần mềm Đồ họa CorelDRAW X7";
      desc = "Bộ phần mềm thiết kế đồ họa vector chuyên nghiệp cho Designer.";
    } else if (lower.includes("mydockfinder")) {
      specificLabel = "Tiện ích Giao diện macOS trên Windows";
      desc = "Công cụ biến giao diện Windows thành thanh Dock và MenuBar phong cách Mac.";
    }

    return {
      role: "software",
      label: specificLabel,
      groupLabel: "Phần mềm & Tiện ích",
      badgeColor: "bg-violet-500/20 text-violet-300 border-violet-400/40",
      textColor: "text-violet-400",
      iconType: "software",
      description: desc,
    };
  }

  // 5. Automation Tools, Bots, Scripts & Source Code
  if (
    lower.includes("autoit") ||
    lower.includes("automatic.mouse") ||
    lower.includes("autocf") ||
    lower.includes("autotx") ||
    lower.includes("setupng") ||
    lower.includes("autoveo") ||
    lower.includes("tool text") ||
    lower.includes("photo_tool") ||
    lower.includes("deplao-builder") ||
    lower.includes("ccnet") ||
    lower.includes("prt.zip") ||
    (lower.includes("auto") && (lower.endsWith(".zip") || lower.endsWith(".rar") || lower.endsWith(".exe")))
  ) {
    let specificLabel = "Tool Tự động hóa";
    let desc = "Công cụ viết script hoặc tự động hóa tác vụ hệ thống / game.";

    if (lower.includes("autoit")) {
      specificLabel = "Môi trường Lập trình AutoIt v3";
      desc = "Bộ cài đặt ngôn ngữ kịch bản AutoIt dùng để tự động hóa Windows GUI.";
    } else if (lower.includes("automatic.mouse")) {
      specificLabel = "Tool Auto Click Chuột & Phím";
      desc = "Phần mềm tự động ghi nhớ và lặp lại thao tác chuột, bàn phím máy tính.";
    } else if (lower.includes("autocf")) {
      specificLabel = "Mã nguồn Auto Game Đột Kích (AutoCF)";
      desc = "Bộ mã nguồn kịch bản tự động cho game Đột Kích.";
    } else if (lower.includes("autotx")) {
      specificLabel = "Bộ Tool Tự động Hóa TxAuto v2.0";
      desc = "Gói phần mềm tự động hóa tác vụ chuyên dụng của Tx.";
    } else if (lower.includes("autoveo")) {
      specificLabel = "Tool Auto Sáng tạo Video AI (AutoVEO)";
      desc = "Công cụ tự động kết nối mô hình sinh video AI để tạo clip hàng loạt.";
    } else if (lower.includes("setupng")) {
      specificLabel = "Bộ Cấu hình Cài đặt Tool SetupNG";
      desc = "Gói thiết lập thông số và môi trường khởi chạy hệ thống.";
    } else if (lower.includes("tool text")) {
      specificLabel = "Bộ Công cụ Xử lý Văn bản Tự động";
      desc = "Tập hợp các tiện ích lọc, ghép, định dạng chuỗi văn bản.";
    } else if (lower.includes("photo_tool")) {
      specificLabel = "Tool Xử lý & Xuất Ảnh Tự động";
      desc = "Công cụ tự động xử lý hàng loạt hình ảnh nghệ thuật.";
    } else if (lower.includes("deplao-builder")) {
      specificLabel = "Dự án / Mã nguồn Deplao Builder";
      desc = "Mã nguồn dự án hệ thống đóng gói và triển khai ứng dụng.";
    } else if (lower.includes("ccnet")) {
      specificLabel = "Mô-đun Tiện ích Mạng CCNet9";
      desc = "Gói công cụ hỗ trợ giao thức mạng và truyền tải dữ liệu.";
    } else if (lower.includes("prt.zip")) {
      specificLabel = "Gói Tài nguyên / Tool PRT";
      desc = "Bộ tệp tài nguyên cấu hình nén PRT.";
    }

    return {
      role: "automation_tool",
      label: specificLabel,
      groupLabel: "Công cụ Tự động & Tool",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
      textColor: "text-emerald-400",
      iconType: "zap",
      description: desc,
    };
  }

  // 6. Movies, Cinema & Video Files
  if (
    mime.includes("video") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".mkv") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".avi") ||
    lower.endsWith(".webm")
  ) {
    let specificLabel = "Video / Clip";
    let desc = "Tệp video có thể xem trực tiếp tại Rạp chiếu phim Cinema.";

    if (lower.includes("ngu?i nh?n") || lower.includes("nguoi nhan") || lower.includes("spider-man") || size > 1000000000) {
      specificLabel = "Phim Bom tấn Rạp (Người Nhện)";
      desc = "Phim điện ảnh độ nét cao chất lượng Bluray/HD rạp chiếu.";
    } else if (lower.includes("phonk") || lower.includes("trailer") || lower.includes("wake")) {
      specificLabel = "Video Âm nhạc / Trailer Phonk";
      desc = "Video clip âm nhạc chất lượng cao kèm hiệu ứng.";
    }

    return {
      role: "movie_video",
      label: specificLabel,
      groupLabel: "Video & Phim Rạp",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-400/40",
      textColor: "text-rose-400",
      iconType: "film",
      description: desc,
    };
  }

  // 7. Audio, Songs, Nonstop & DJ Vinahouse
  if (
    mime.includes("audio") ||
    lower.endsWith(".mp3") ||
    lower.endsWith(".m4a") ||
    lower.endsWith(".wav") ||
    lower.endsWith(".ogg") ||
    lower.endsWith(".flac")
  ) {
    let specificLabel = "Bản nhạc Âm thanh";
    let desc = "Tệp âm thanh chất lượng cao, đồng bộ phát nhạc với Dynamic Island.";

    if (
      lower.includes("nonstop") ||
      lower.includes("remix") ||
      lower.includes("rmx") ||
      lower.includes("dj kenbjn") ||
      lower.includes("vinahouse") ||
      lower.includes("vietmix") ||
      lower.includes("mixtap")
    ) {
      specificLabel = "Nhạc DJ Nonstop / Vinahouse";
      desc = "Bản phối Vinahouse / Nonstop Remix sống động, hỗ trợ tua trực tiếp.";
    }

    return {
      role: "music_audio",
      label: specificLabel,
      groupLabel: "Âm nhạc & Audio",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-400/40",
      textColor: "text-pink-400",
      iconType: "music",
      description: desc,
    };
  }

  // 8. Documents, Spreadsheets, PDFs, Text, SQL
  if (
    mime.includes("pdf") ||
    mime.includes("document") ||
    mime.includes("sheet") ||
    mime.includes("text") ||
    lower.endsWith(".pdf") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".doc") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".pptx") ||
    lower.endsWith(".csv") ||
    lower.endsWith(".sql") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md")
  ) {
    let specificLabel = "Tài liệu Văn bản";
    let desc = "Tài liệu văn phòng hoặc cơ sở dữ liệu.";

    if (lower.endsWith(".pdf")) {
      specificLabel = "Tài liệu Adobe PDF";
    } else if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || mime.includes("sheet")) {
      specificLabel = "Bảng tính Excel";
    } else if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
      specificLabel = "Văn bản Word";
    } else if (lower.endsWith(".sql")) {
      specificLabel = "Sao lưu Cơ sở Dữ liệu SQL";
    }

    return {
      role: "document",
      label: specificLabel,
      groupLabel: "Tài liệu & Dữ liệu",
      badgeColor: "bg-sky-500/20 text-sky-300 border-sky-400/40",
      textColor: "text-sky-400",
      iconType: "doc",
      description: desc,
    };
  }

  // 9. Images & Graphics
  if (
    mime.includes("image") ||
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".svg")
  ) {
    return {
      role: "image",
      label: "Hình ảnh / Đồ họa",
      groupLabel: "Hình ảnh & Đồ họa",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-400/40",
      textColor: "text-teal-400",
      iconType: "image",
      description: "Tệp hình ảnh hoặc biểu ngữ độ phân giải cao.",
    };
  }

  // 10. Miscellaneous Archives (Zip, Rar, 7z, Tar)
  if (
    lower.endsWith(".zip") ||
    lower.endsWith(".rar") ||
    lower.endsWith(".7z") ||
    lower.endsWith(".tar") ||
    lower.endsWith(".gz") ||
    mime.includes("zip") ||
    mime.includes("compressed") ||
    mime.includes("archive")
  ) {
    let specificLabel = "Gói Nén Dữ liệu";
    let desc = "Tệp nén lưu trữ dữ liệu cá nhân hoặc bộ sưu tập.";

    if (lower.includes("jav") || lower.includes("vlxx")) {
      specificLabel = "Kho Dữ liệu Nén Riêng tư";
      desc = "Gói tệp nén lưu trữ nội dung bảo mật cá nhân.";
    }

    return {
      role: "archive_misc",
      label: specificLabel,
      groupLabel: "Tập tin Nén Khác",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-400/40",
      textColor: "text-orange-400",
      iconType: "archive",
      description: desc,
    };
  }

  // Default fallback
  return {
    role: "archive_misc",
    label: "Tệp tin Khác",
    groupLabel: "Tệp tin Khác",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-400/40",
    textColor: "text-slate-400",
    iconType: "doc",
    description: "Tệp tin lưu trữ trong thư mục đám mây.",
  };
}

/**
 * Parses date string like "17/05/2026 21:12", "Hôm nay, 14:30", "26/04/2025" into timestamp.
 */
export function parseDateToTimestamp(dateStr?: string): number {
  if (!dateStr) return 0;
  if (dateStr.includes("Hôm nay")) return Date.now();
  if (dateStr.includes("Hôm qua")) return Date.now() - 86400000;

  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const min = match[5] ? parseInt(match[5], 10) : 0;
    return new Date(year, month, day, hour, min).getTime();
  }
  return 0;
}

/**
 * Sorts drive items according to selected sort criteria.
 */
export function sortDriveItems(items: DriveFileItem[], sortBy: StorageSortOption): DriveFileItem[] {
  const cloned = [...items];

  switch (sortBy) {
    case "size-desc":
      return cloned.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));

    case "size-asc":
      return cloned.sort((a, b) => (a.sizeBytes || 0) - (b.sizeBytes || 0));

    case "name-asc":
      return cloned.sort((a, b) => a.name.localeCompare(b.name, "vi", { sensitivity: "base" }));

    case "name-desc":
      return cloned.sort((a, b) => b.name.localeCompare(a.name, "vi", { sensitivity: "base" }));

    case "date-desc":
      return cloned.sort((a, b) => parseDateToTimestamp(b.updatedAt) - parseDateToTimestamp(a.updatedAt));

    case "date-asc":
      return cloned.sort((a, b) => parseDateToTimestamp(a.updatedAt) - parseDateToTimestamp(b.updatedAt));

    case "role": {
      // Role priority: Folder -> Course -> OS -> Software -> Tools -> Video -> Audio -> Key -> Doc -> Image -> Game -> Vault -> Archive -> Junk
      const roleWeight: Record<FileRoleType, number> = {
        folder: 0,
        course_study: 1,
        os_installer: 2,
        software: 3,
        automation_tool: 4,
        movie_video: 5,
        music_audio: 6,
        license_key: 7,
        document: 8,
        image: 9,
        game_mod: 10,
        private_vault: 11,
        archive_misc: 12,
        junk_ghost: 13,
      };

      return cloned.sort((a, b) => {
        const roleA = classifyFileRole(a).role;
        const roleB = classifyFileRole(b).role;
        const diff = (roleWeight[roleA] || 99) - (roleWeight[roleB] || 99);
        if (diff !== 0) return diff;
        return (b.sizeBytes || 0) - (a.sizeBytes || 0);
      });
    }

    default:
      return cloned;
  }
}
