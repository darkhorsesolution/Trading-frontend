import * as OTPAuth from "otpauth";
import crypto from "crypto";
import { encode } from "hi-base32";

export const generateRandomBase32 = () => {
  const buffer = crypto.randomBytes(15);
  const base32 = encode(buffer).replace(/=/g, "").substring(0, 24);
  return base32;
};

export function makeOTP(account: string, secret?: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: "atcplatform",
    label: account,
    algorithm: "SHA1",
    digits: 6,
    secret: secret || generateRandomBase32(),
  });
}
