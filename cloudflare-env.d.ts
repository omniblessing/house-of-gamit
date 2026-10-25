declare namespace Cloudflare {
  interface Env {
    FAMILY_OWNER_EMAIL?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
