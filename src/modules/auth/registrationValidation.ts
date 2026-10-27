// Đăng ký thành viên đã bị TẮT vĩnh viễn (hệ thống chỉ có admin + 10 thành
// viên cố định trong defaultUsers.ts). File này được giữ lại dưới dạng stub
// để các import cũ không vỡ, nhưng không còn logic đăng ký nào nữa.
export function registrationDisabledMessage(): string {
  return "Chức năng đăng ký đã bị tắt. Hệ thống chỉ có các tài khoản được cấp sẵn.";
}
