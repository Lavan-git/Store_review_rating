export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16}$)/;
  return passwordRegex.test(password);
};

export const validateName = (name) => {
  return name && name.length >= 20 && name.length <= 60;
};

export const validateAddress = (address) => {
  return address && address.length <= 400;
};
