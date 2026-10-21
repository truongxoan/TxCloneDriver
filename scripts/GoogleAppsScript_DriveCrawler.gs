/**
 * ==============================================================================
 * TxCloneDriver - GOOGLE APPS SCRIPT CRAWLER 2.0 (HỖ TRỢ THƯ MỤC & ĐỆ QUY CON)
 * ==============================================================================
 * 
 * Hướng dẫn cài đặt / nâng cấp trên Google Apps Script:
 * 1. Truy cập https://script.google.com/
 * 2. Mở dự án Apps Script hiện tại của bạn (hoặc tạo dự án mới).
 * 3. Dán toàn bộ mã nguồn bên dưới thay thế cho Code.gs cũ.
 * 4. Điền ID thư mục Google Drive của bạn vào biến ROOT_FOLDER_ID (hoặc để trống nếu quét thư mục gốc).
 * 5. Bấm "Triển khai" (Deploy) -> "Bản triển khai mới" (New Deployment):
 *    - Loại: "Ứng dụng web" (Web App)
 *    - Thực thi dưới dạng: "Tôi" (Me)
 *    - Ai có quyền truy cập: "Bất kỳ ai" (Anyone)
 * 6. Sao chép URL Web App dạng https://script.google.com/macros/s/.../exec 
 *    và dán vào mục "Quản lý thư mục" trên webadmin là xong!
 */

// ĐIỀN ID THƯ MỤC CỦA BẠN VÀO ĐÂY (Lấy từ link Drive: https://drive.google.com/drive/folders/ID_Ở_ĐÂY)
// Ví dụ: var ROOT_FOLDER_ID = "1Uf1dMCA9TFSTqUHXGP7FWzECXg-G5Xoy";
// Nếu để trống "" thì script sẽ quét toàn bộ My Drive (Thư mục gốc)
var ROOT_FOLDER_ID = "";

var MAX_ITEMS_LIMIT = 2000; // Giới hạn tối đa để tránh quá tải
var MAX_DEPTH = 6;          // Độ sâu đệ quy tối đa (6 tầng thư mục con)

function doGet(e) {
  try {
    // Cho phép truyền ?folderId=... qua URL nếu muốn quét thư mục bất kỳ
    var targetFolderId = (e && e.parameter && e.parameter.folderId) ? e.parameter.folderId : ROOT_FOLDER_ID;
    
    // Kiểm tra cache trước để tăng tốc độ phản hồi < 500ms
    var cache = CacheService.getScriptCache();
    var cacheKey = "tx_drive_cache_" + (targetFolderId || "root");
    var cachedData = cache.get(cacheKey);
    
    // Nếu người dùng không yêu cầu làm mới (?refresh=1) và có cache thì trả về ngay
    if (cachedData && (!e || !e.parameter || !e.parameter.refresh)) {
      return ContentService.createTextOutput(cachedData)
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var rootFolder;
    if (targetFolderId && targetFolderId.trim() !== "") {
      rootFolder = DriveApp.getFolderById(targetFolderId.trim());
    } else {
      rootFolder = DriveApp.getRootFolder();
    }
    
    var allItems = [];
    
    // Đệ quy quét cả files và subfolders
    crawlFolder(rootFolder, "", allItems, 0);
    
    var responseObj = {
      success: true,
      folderName: rootFolder.getName(),
      totalItems: allItems.length,
      files: allItems
    };
    
    var jsonOutput = JSON.stringify(responseObj);
    
    // Lưu cache trong 10 phút (600 giây)
    try {
      if (jsonOutput.length < 100000) {
        cache.put(cacheKey, jsonOutput, 600);
      }
    } catch (cErr) {
      // Bỏ qua nếu dữ liệu quá giới hạn cache của Apps Script
    }
    
    return ContentService.createTextOutput(jsonOutput)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Lỗi Google Apps Script: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Hàm đệ quy quét tệp tin và các thư mục con
 */
function crawlFolder(folder, currentPath, resultList, depth) {
  if (depth > MAX_DEPTH || resultList.length >= MAX_ITEMS_LIMIT) {
    return;
  }
  
  // 1. Quét toàn bộ tệp tin trong thư mục hiện tại
  var files = folder.getFiles();
  while (files.hasNext() && resultList.length < MAX_ITEMS_LIMIT) {
    var file = files.next();
    try {
      resultList.push({
        id: file.getId(),
        name: file.getName(),
        sizeBytes: file.getSize(),
        mimeType: file.getMimeType(),
        updatedAt: Utilities.formatDate(file.getLastUpdated(), "GMT+7", "dd/MM/yyyy HH:mm"),
        downloadUrl: "https://drive.google.com/uc?id=" + file.getId() + "&export=download",
        isFolder: false,
        folderPath: currentPath,
        starred: file.isStarred()
      });
    } catch (e) {
      // Bỏ qua tệp nếu không có quyền truy cập
    }
  }
  
  // 2. Quét các thư mục con và đệ quy vào từng thư mục
  var subFolders = folder.getFolders();
  while (subFolders.hasNext() && resultList.length < MAX_ITEMS_LIMIT) {
    var sub = subFolders.next();
    try {
      var subPath = currentPath ? (currentPath + "/" + sub.getName()) : sub.getName();
      
      // Thêm chính thư mục con vào danh sách để hiển thị trên Web
      resultList.push({
        id: sub.getId(),
        name: sub.getName(),
        sizeBytes: 0,
        mimeType: "application/vnd.google-apps.folder",
        updatedAt: Utilities.formatDate(sub.getLastUpdated(), "GMT+7", "dd/MM/yyyy HH:mm"),
        downloadUrl: sub.getUrl(),
        isFolder: true,
        folderPath: currentPath,
        starred: sub.isStarred()
      });
      
      // Đệ quy tiếp vào trong thư mục con
      crawlFolder(sub, subPath, resultList, depth + 1);
    } catch (e) {
      // Bỏ qua thư mục nếu bị hạn chế quyền
    }
  }
}

/**
 * ==============================================================================
 * TỰ ĐỘNG ĐỒNG BỘ: Thiết lập Trigger chạy ngầm tự động quét định kỳ mỗi 6 giờ
 * ==============================================================================
 * Hướng dẫn:
 * 1. Mở dự án Google Apps Script (https://script.google.com/)
 * 2. Chọn hàm 'setupAutoSyncTrigger' ở thanh công cụ phía trên và bấm 'Chạy' (Run).
 * 3. Apps Script sẽ tự động lập lịch quét định kỳ mỗi 6 tiếng, giữ cho cache
 *    của trang webadmin luôn mới nhất mà bạn không cần phải bấm quét tay!
 */
function setupAutoSyncTrigger() {
  // Xóa các trigger cũ cùng tên nếu có để tránh trùng lặp
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "autoSyncBackground") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Tạo trigger mới chạy định kỳ mỗi 6 tiếng
  ScriptApp.newTrigger("autoSyncBackground")
    .timeBased()
    .everyHours(6)
    .create();
    
  Logger.log("✅ Đã kích hoạt tự động quét Google Drive mỗi 6 giờ thành công!");
}

function autoSyncBackground() {
  try {
    var rootFolder = ROOT_FOLDER_ID ? DriveApp.getFolderById(ROOT_FOLDER_ID.trim()) : DriveApp.getRootFolder();
    var allItems = [];
    crawlFolder(rootFolder, "", allItems, 0);
    
    var cache = CacheService.getScriptCache();
    var cacheKey = "tx_drive_cache_" + (ROOT_FOLDER_ID || "root");
    var jsonOutput = JSON.stringify({
      success: true,
      folderName: rootFolder.getName(),
      totalItems: allItems.length,
      files: allItems,
      autoSyncTime: Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss")
    });
    
    if (jsonOutput.length < 100000) {
      cache.put(cacheKey, jsonOutput, 21600); // Lưu cache 6 giờ
    }
    Logger.log("✅ Đã tự động cập nhật " + allItems.length + " tệp vào cache lúc " + new Date());
  } catch (err) {
    Logger.log("❌ Lỗi autoSyncBackground: " + err.toString());
  }
}

