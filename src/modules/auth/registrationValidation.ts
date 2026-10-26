// Shared registration validation, used by the login form, authContext and
// the /api/auth register endpoint so all three enforce the same rules.
// Messages are in Vietnamese and are shown to the user as-is.
export function validateRegistration(input: {
  username: string;
  password: string;
  name: string;
  confirmPassword?: string;
}): string | null {
  const name = (input.name || "").trim();
  if (!name) {
    return "Vui lòng nhập họ và tên.";
  }

  const username = (input.username || "").trim();
  if (!username) {
    return "Vui lòng nhập tên tài khoản.";
  }
  if (username.length < 3 || /\s/.test(username)) {
    return "Tên tài khoản phải có ít nhất 3 ký tự và không chứa khoảng trắng.";
  }

  const password = (input.password || "").trim();
  if (password.length < 6) {
    return "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  if (input.confirmPassword !== undefined) {
    if ((input.confirmPassword || "").trim() !== password) {
      return "Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.";
    }
  }

  return null;
}
