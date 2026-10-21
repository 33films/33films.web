import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  actionRejectionFrom,
  actionResultFailure,
  classifyStorageFailure,
  interpretSignedUploadResponse,
  isPutUploadFailure,
  sanitizeDiagnosticText,
  storageFailureRecord,
  uploadDiagnosticRecord,
} from "./diagnostics.ts";

const SAMPLE_KEY = "sb_secret_examplekeyvalue";
const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.signaturevalue";
const SIGNED_URL =
  "https://example.supabase.co/storage/v1/object/upload/sign/portfolio-thumbnails/file.jpg?token=super-secret-token";

describe("classifyStorageFailure", () => {
  it("classifies a missing service role as configuration", () => {
    assert.equal(classifyStorageFailure(new Error("Missing service role key")), "configuration");
  });

  it("classifies an invalid API key as configuration even when the status is 401", () => {
    assert.equal(
      classifyStorageFailure({ message: "Invalid API key", statusCode: "401" }),
      "configuration"
    );
  });

  it("classifies session failures as authentication", () => {
    assert.equal(classifyStorageFailure(new Error("UNAUTHENTICATED")), "authentication");
    assert.equal(classifyStorageFailure(new Error("INACTIVE")), "authentication");
    assert.equal(classifyStorageFailure({ message: "JWT expired", status: 401 }), "authentication");
  });

  it("classifies permission failures as authorization", () => {
    assert.equal(classifyStorageFailure(new Error("FORBIDDEN")), "authorization");
    assert.equal(
      classifyStorageFailure({ message: "permission denied for table files", code: "42501" }),
      "authorization"
    );
    assert.equal(
      classifyStorageFailure({ message: "new row violates row-level security policy", statusCode: 403 }),
      "authorization"
    );
  });

  it("classifies a missing object as not_found", () => {
    assert.equal(
      classifyStorageFailure({ message: "Object not found", statusCode: 404 }),
      "not_found"
    );
    assert.equal(classifyStorageFailure({ message: "JSON object requested, multiple (or no) rows returned", code: "PGRST116" }), "not_found");
  });

  it("classifies other storage failures as storage", () => {
    assert.equal(
      classifyStorageFailure({ message: "Could not create download URL", statusCode: 500 }),
      "storage"
    );
  });
});

describe("storageFailureRecord", () => {
  it("keeps category, operation and safe context, and strips secrets", () => {
    const record = storageFailureRecord({
      operation: "client-files.download",
      category: "configuration",
      context: {
        fileId: "file-1",
        bucket: "client-files",
        stage: "sign",
        signedUrl: SIGNED_URL,
        token: "super-secret-token",
        path: "projects/private/file.jpg",
      },
      error: new Error(`Missing service role key ${SAMPLE_KEY} ${SIGNED_URL}`),
    });

    assert.equal(record.operation, "client-files.download");
    assert.equal(record.category, "configuration");
    assert.deepEqual(record.context, {
      fileId: "file-1",
      bucket: "client-files",
      stage: "sign",
    });
    assert.equal(record.message?.includes(SAMPLE_KEY), false);
    assert.equal(record.message?.includes("token="), false);
    assert.equal(record.message?.includes("https://"), false);
    assert.equal(JSON.stringify(record).includes("super-secret-token"), false);
  });
});

describe("sanitizeDiagnosticText", () => {
  it("redacts keys, bearer tokens and signed urls", () => {
    const text = sanitizeDiagnosticText(
      `Bearer ${SAMPLE_JWT} SUPABASE_SERVICE_ROLE_KEY=${SAMPLE_KEY} ${SIGNED_URL}`
    );
    assert.equal(text.includes(SAMPLE_KEY), false);
    assert.equal(text.includes(SAMPLE_JWT), false);
    assert.equal(text.includes("super-secret-token"), false);
    assert.equal(text.includes("https://"), false);
  });
});

describe("upload failures", () => {
  it("treats a successful PUT as no failure", () => {
    assert.equal(interpretSignedUploadResponse(200, "{\"Key\":\"ok\"}"), null);
  });

  it("records a sanitized HTTP failure separately from an action rejection", () => {
    const put = interpretSignedUploadResponse(
      400,
      `{"message":"Invalid","url":"${SIGNED_URL}","token":"${SAMPLE_KEY}"}`
    );
    assert.ok(put);
    assert.equal(isPutUploadFailure(put), true);
    assert.equal(put?.status, 400);
    assert.equal(put?.message.includes(SAMPLE_KEY), false);
    assert.equal(put?.message.includes("super-secret-token"), false);

    const action = actionResultFailure("upload");
    assert.equal(action.source, "action");
    assert.equal(action.code, "upload");
    assert.notEqual(action.source, put?.source);

    const rejected = actionRejectionFrom(new Error(`Missing service role key ${SAMPLE_JWT}`));
    assert.equal(rejected.code, "rejected");
    assert.equal(rejected.message?.includes(SAMPLE_JWT), false);

    const record = uploadDiagnosticRecord("thumbnail", put!);
    assert.equal(record.operation, "portfolio-thumbnails.upload");
    assert.equal(record.bucket, "portfolio-thumbnails");
    assert.equal(JSON.stringify(record).includes("super-secret-token"), false);
  });

  it("records a network PUT as status 0", () => {
    const failure = interpretSignedUploadResponse(0, "");
    assert.deepEqual(failure, { source: "put", status: 0, message: "network" });
  });

  it("does not keep a secret passed as an action code", () => {
    const failure = actionResultFailure(SAMPLE_KEY);
    assert.equal(failure.code.includes(SAMPLE_KEY), false);
    const record = uploadDiagnosticRecord("video", failure);
    assert.equal(record.bucket, "portfolio-videos");
    assert.equal(JSON.stringify(record).includes(SAMPLE_KEY), false);
  });
});
