function normalizeStudentCode(value) {
  return String(value ?? "").replace(/\s/g, "").toUpperCase();
}

/** Resolve the identity returned by the trusted member-login Edge Function. */
export function memberIdFromLoginResponse(response, submittedStudentCode) {
  const member = response && typeof response === "object" ? response.member : null;
  const id = String(member?.id ?? "").trim();
  const actualCode = normalizeStudentCode(member?.student_code ?? member?.studentCode);
  const expectedCode = normalizeStudentCode(submittedStudentCode);
  if (!id || !expectedCode || !actualCode || actualCode !== expectedCode) {
    throw new Error("Hồ sơ thành viên máy chủ trả về không khớp MSSV đăng nhập.");
  }
  return id;
}

/** Accept only the server-issued app_metadata member claim, pinned to login identity when supplied. */
export function trustedMemberIdFromAuthUser(authUser, expectedMemberId) {
  const memberId = String(authUser?.app_metadata?.member_id ?? "").trim();
  if (!memberId || (expectedMemberId && memberId !== expectedMemberId)) {
    throw new Error("Phiên Auth không khớp hồ sơ thành viên vừa xác thực.");
  }
  return memberId;
}

export function assertAuthMemberLink(authUserId, memberRow, expectedMemberId) {
  if (
    !authUserId ||
    String(memberRow?.id ?? "") !== expectedMemberId ||
    String(memberRow?.auth_user_id ?? "") !== authUserId
  ) {
    throw new Error("Liên kết Auth và hồ sơ thành viên không khớp.");
  }
}
