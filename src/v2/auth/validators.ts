export function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return '이메일을 입력해주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return '올바른 이메일 형식이 아닙니다.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return '비밀번호를 입력해주세요.';
  if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
  return null;
}

export function validateNickname(nickname: string): string | null {
  const trimmed = nickname.trim();
  if (!trimmed) return '닉네임을 입력해주세요.';
  if (trimmed.length > 20) return '닉네임은 20자 이하로 입력해주세요.';
  if (trimmed.includes('@')) return '닉네임에 @를 사용할 수 없습니다.';
  return null;
}
