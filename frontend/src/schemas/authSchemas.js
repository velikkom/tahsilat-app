import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email zorunludur")
    .email("Geçerli bir email adresi girin"),
  password: yup
    .string()
    .required("Şifre zorunludur")
    .min(6, "Şifre en az 6 karakter olmalıdır"),
  rememberMe: yup.boolean().default(false),
});

export const registerSchema = yup.object({
  username: yup.string().required("Kullanıcı adı zorunludur"),
  email: yup
    .string()
    .required("Email zorunludur")
    .email("Geçerli bir email adresi girin"),
  password: yup
    .string()
    .required("Şifre zorunludur")
    .min(8, "Şifre en az 8 karakter olmalıdır")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d).+$/,
      "Şifre en az bir harf ve bir rakam içermelidir"
    ),
  confirmPassword: yup
    .string()
    .required("Şifre tekrarı zorunludur")
    .oneOf([yup.ref("password")], "Şifreler eşleşmiyor"),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required("Email zorunludur")
    .email("Geçerli bir email adresi girin"),
});

/**
 * Maps UI username to backend RegisterRequest (firstName / lastName).
 */
export function mapUsernameToRegisterNames(username) {
  const trimmed = username.trim();
  const spaceIndex = trimmed.indexOf(" ");

  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: "User" };
  }

  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim() || "User",
  };
}
