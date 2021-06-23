import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scyptAsync = promisify(scrypt);
export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    const buffer = (await scyptAsync(password, salt, 64)) as Buffer;
    return `${buffer.toString("hex")}.${salt}`;
  }
  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");
    const buffer = (await scyptAsync(suppliedPassword, salt, 64)) as Buffer;
    return buffer.toString("hex") === hashedPassword;
  }
}
