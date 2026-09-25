import test from "node:test";
import assert from "node:assert/strict";
import { assertAuthMemberLink, memberIdFromLoginResponse, trustedMemberIdFromAuthUser } from "../lib/member-auth-identity.mjs";

test("login identity comes from the server member selected by the submitted student code", () => {
  assert.equal(
    memberIdFromLoginResponse({ member: { id: "server-member", student_code: "20262026" } }, " 20262026 "),
    "server-member",
  );
});

test("login identity rejects a server member that does not match the submitted code", () => {
  assert.throws(
    () => memberIdFromLoginResponse({ member: { id: "other-member", student_code: "00000000" } }, "20262026"),
    /không khớp MSSV/,
  );
  assert.throws(
    () => memberIdFromLoginResponse({ member: { id: "server-member" } }, "20262026"),
    /không khớp MSSV/,
  );
});

test("Auth identity accepts only matching trusted app metadata", () => {
  assert.equal(
    trustedMemberIdFromAuthUser({ app_metadata: { member_id: "server-member" }, user_metadata: { member_id: "forged" } }, "server-member"),
    "server-member",
  );
  assert.throws(
    () => trustedMemberIdFromAuthUser({ app_metadata: { member_id: "stale-member" } }, "server-member"),
    /không khớp hồ sơ/,
  );
  assert.throws(
    () => trustedMemberIdFromAuthUser({ user_metadata: { member_id: "forged" } }, "server-member"),
    /không khớp hồ sơ/,
  );
});

test("member profile must belong to the authenticated user and trusted member claim", () => {
  assert.doesNotThrow(() => assertAuthMemberLink("auth-user", { id: "member", auth_user_id: "auth-user" }, "member"));
  assert.throws(() => assertAuthMemberLink("auth-user", { id: "other-member", auth_user_id: "auth-user" }, "member"), /không khớp/);
  assert.throws(() => assertAuthMemberLink("auth-user", { id: "member", auth_user_id: "other-auth-user" }, "member"), /không khớp/);
});
