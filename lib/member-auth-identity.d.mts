export function memberIdFromLoginResponse(response: unknown, submittedStudentCode: string): string;
export function trustedMemberIdFromAuthUser(authUser: unknown, expectedMemberId?: string): string;
export function assertAuthMemberLink(authUserId: string, memberRow: unknown, expectedMemberId: string): void;
