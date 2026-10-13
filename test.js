
import {
  issueToken,
  consumeToken,
  closeRedis
} from "./token-service.js";

try {
  const id = await issueToken({ userId: 42 }, 60);

  console.log("issued token:", id);

  // Five consumers try to use the same token simultaneously.
  const results = await Promise.all([
    consumeToken(id),
    consumeToken(id),
    consumeToken(id),
    consumeToken(id),
    consumeToken(id),
  ]);

  // Count successful consumers.
  const winners = results.filter((r) => r.ok).length;

  console.log("winners:", winners);

  // Exactly one consumer must succeed.
  if (winners !== 1) {
    throw new Error(`SINGLE-USE VIOLATED! winners = ${winners}`);
  }

  console.log("PASS: token was single-use.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await closeRedis();
}
