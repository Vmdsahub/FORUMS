import { fileTypeFromBuffer } from "file-type";
import sanitize from "sanitize-filename";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

export interface FileValidationResult {
  isValid: boolean;
  reasons: string[];
  sanitizedName: string;
  detectedMimeType?: string;
  hash: string;
  size: number;
  quarantined: boolean;
}

export interface SecurityConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  quarantineDir: string;
  safeDir: string;
}

export class AdvancedFileValidator {
  private config: SecurityConfig;
  private suspiciousPatterns: RegExp[];

  constructor(config: SecurityConfig) {
    this.config = config;
    this.suspiciousPatterns = [
      // Script injection patterns
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,

      // Executable signatures (magic bytes)
      /^MZ/, // Windows PE
      /^\x7fELF/, // Linux ELF
      /^PK\x03\x04.*\.exe$/, // ZIP with exe
      /^\xff\xd8\xff.*<script/gi, // JPEG with script

      // Malicious file patterns
      /autorun\.inf/gi,
      /desktop\.ini/gi,
      /thumbs\.db/gi,

      // Document macros
      /Microsoft Office Word.*Macro/gi,
      /VBA.*Project/gi,
    ];

    // Ensure directories exist
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.config.quarantineDir)) {
      fs.mkdirSync(this.config.quarantineDir, { recursive: true });
    }
    if (!fs.existsSync(this.config.safeDir)) {
      fs.mkdirSync(this.config.safeDir, { recursive: true });
    }
  }

  async validateFile(
    filePath: string,
    originalName: string,
  ): Promise<FileValidationResult> {
    const result: FileValidationResult = {
      isValid: true,
      reasons: [],
      sanitizedName: sanitize(originalName),
      hash: "",
      size: 0,
      quarantined: false,
    };

    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        result.isValid = false;
        result.reasons.push("File does not exist");
        return result;
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      result.size = stats.size;

      // Check file size
      if (stats.size > this.config.maxFileSize) {
        result.isValid = false;
        result.reasons.push(
          `File too large: ${stats.size} bytes (max: ${this.config.maxFileSize})`,
        );
      }

      if (stats.size === 0) {
        result.isValid = false;
        result.reasons.push("File is empty");
        return result;
      }

      // Generate file hash
      result.hash = await this.generateFileHash(filePath);

      // Read file buffer for analysis
      const buffer = fs.readFileSync(filePath);

      // Detect actual file type
      const detectedType = await fileTypeFromBuffer(buffer);
      if (detectedType) {
        result.detectedMimeType = detectedType.mime;
      }

      // Validate file extension vs content
      const fileExt = path.extname(originalName).toLowerCase();
      if (!this.config.allowedExtensions.includes(fileExt)) {
        result.isValid = false;
        result.reasons.push(`File extension not allowed: ${fileExt}`);
      }

      // Validate MIME type
      if (
        detectedType &&
        !this.config.allowedMimeTypes.includes(detectedType.mime)
      ) {
        result.isValid = false;
        result.reasons.push(`MIME type not allowed: ${detectedType.mime}`);
      }

      // Check for MIME type spoofing
      if (detectedType) {
        const expectedMimeForExt = this.getMimeTypeForExtension(fileExt);
        if (expectedMimeForExt && expectedMimeForExt !== detectedType.mime) {
          result.isValid = false;
          result.reasons.push(
            `MIME type mismatch: expected ${expectedMimeForExt}, got ${detectedType.mime}`,
          );
        }
      }

      // Scan for malicious patterns
      const maliciousContent = await this.scanForMaliciousContent(
        buffer,
        originalName,
      );
      if (maliciousContent.length > 0) {
        result.isValid = false;
        result.reasons.push(...maliciousContent);
        result.quarantined = true;
      }

      // Additional security checks for images
      if (this.isImageFile(fileExt)) {
        const imageSecurityCheck = await this.validateImageSecurity(filePath);
        if (!imageSecurityCheck.isValid) {
          result.isValid = false;
          result.reasons.push(...imageSecurityCheck.reasons);
        }
      }

      // Check for zip bombs (for archives)
      if (this.isArchiveFile(fileExt)) {
        const archiveCheck = await this.validateArchiveSecurity(buffer);
        if (!archiveCheck.isValid) {
          result.isValid = false;
          result.reasons.push(...archiveCheck.reasons);
          result.quarantined = true;
        }
      }

      // Move to quarantine if suspicious
      if (result.quarantined || !result.isValid) {
        await this.quarantineFile(filePath, result.hash, result.reasons);
      }
    } catch (error) {
      console.error("File validation error:", error);
      result.isValid = false;
      result.reasons.push(
        `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return result;
  }

  private async generateFileHash(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  private async scanForMaliciousContent(
    buffer: Buffer,
    filename: string,
  ): Promise<string[]> {
    const issues: string[] = [];
    const content = buffer.toString("binary");
    const textContent = buffer.toString(
      "utf-8",
      0,
      Math.min(buffer.length, 10000),
    ); // First 10KB as text

    // Check suspicious filename patterns
    if (/\.(exe|scr|bat|cmd|com|pif|vbs|js|jar|app)$/i.test(filename)) {
      issues.push("Potentially dangerous file extension");
    }

    // Double extension check
    if (filename.split(".").length > 2) {
      issues.push("Multiple file extensions detected (potential masquerading)");
    }

    // Scan content for malicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content) || pattern.test(textContent)) {
        issues.push(
          `Suspicious content pattern detected: ${pattern.source.substring(0, 50)}...`,
        );
      }
    }

    // Check for embedded executables
    if (
      content.includes("MZ") &&
      content.includes("This program cannot be run in DOS mode")
    ) {
      issues.push("Contains embedded Windows executable");
    }

    // Check for script tags in non-HTML files
    if (!filename.match(/\.(html|htm)$/i) && /<script/gi.test(textContent)) {
      issues.push("Script tags found in non-HTML file");
    }

    // Check for macro indicators
    if (/Microsoft Office.*Macro|VBA.*Project/gi.test(textContent)) {
      issues.push("Contains Office macros (potential security risk)");
    }

    return issues;
  }

  private async validateImageSecurity(
    filePath: string,
  ): Promise<{ isValid: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    try {
      // Use Sharp to validate and sanitize image
      const metadata = await sharp(filePath).metadata();

      // Check for reasonable image dimensions
      if (metadata.width && metadata.width > 50000) {
        reasons.push("Image width too large (potential zip bomb)");
      }
      if (metadata.height && metadata.height > 50000) {
        reasons.push("Image height too large (potential zip bomb)");
      }

      // Check for embedded data in images
      const buffer = fs.readFileSync(filePath);
      const textContent = buffer.toString("utf-8");

      if (/<script/gi.test(textContent)) {
        reasons.push("Script content found in image file");
      }

      if (/javascript:/gi.test(textContent)) {
        reasons.push("JavaScript URL found in image file");
      }
    } catch (error) {
      reasons.push("Image validation failed - possibly corrupted or malicious");
    }

    return { isValid: reasons.length === 0, reasons };
  }

  private async validateArchiveSecurity(
    buffer: Buffer,
  ): Promise<{ isValid: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    // Basic zip bomb detection by checking for high compression ratios
    // This is a simplified check - in production you'd want more sophisticated detection

    if (buffer.length < 1000 && buffer.includes(Buffer.from("PK"))) {
      // Very small ZIP file might be a zip bomb
      reasons.push("Potentially suspicious archive (very small file size)");
    }

    // Check for suspicious file names in ZIP header
    const content = buffer.toString("binary");
    if (/\.exe|\.scr|\.bat|\.cmd/gi.test(content)) {
      reasons.push("Archive contains potentially dangerous executables");
    }

    return { isValid: reasons.length === 0, reasons };
  }

  private async quarantineFile(
    filePath: string,
    hash: string,
    reasons: string[],
  ): Promise<void> {
    try {
      const quarantinePath = path.join(
        this.config.quarantineDir,
        `${hash}.quarantine`,
      );
      const metadataPath = path.join(
        this.config.quarantineDir,
        `${hash}.metadata.json`,
      );

      // Move file to quarantine
      fs.renameSync(filePath, quarantinePath);

      // Write metadata
      const metadata = {
        originalPath: filePath,
        quarantineTime: new Date().toISOString(),
        hash,
        reasons,
        status: "quarantined",
      };

      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      console.log(
        `[SECURITY] File quarantined: ${hash}, reasons: ${reasons.join(", ")}`,
      );
    } catch (error) {
      console.error("[SECURITY] Failed to quarantine file:", error);
    }
  }

  private isImageFile(extension: string): boolean {
    return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"].includes(
      extension.toLowerCase(),
    );
  }

  private isArchiveFile(extension: string): boolean {
    return [".zip", ".rar", ".7z", ".tar", ".gz"].includes(
      extension.toLowerCase(),
    );
  }

  private getMimeTypeForExtension(ext: string): string | null {
    const mimeTypes: { [key: string]: string } = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".zip": "application/zip",
      ".rar": "application/x-rar-compressed",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
      ".txt": "text/plain",
      ".csv": "text/csv",
    };

    return mimeTypes[ext.toLowerCase()] || null;
  }

  // Method to get quarantine stats
  getQuarantineStats(): { total: number; recent: number } {
    try {
      const files = fs
        .readdirSync(this.config.quarantineDir)
        .filter((f) => f.endsWith(".metadata.json"));

      const recent = files.filter((f) => {
        const metadataPath = path.join(this.config.quarantineDir, f);
        const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
        const quarantineTime = new Date(metadata.quarantineTime);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return quarantineTime > oneDayAgo;
      }).length;

      return { total: files.length, recent };
    } catch (error) {
      console.error("Error getting quarantine stats:", error);
      return { total: 0, recent: 0 };
    }
  }
}

// Security configuration
export const SECURITY_CONFIG: SecurityConfig = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
    "application/zip",
    "application/x-rar-compressed",
  ],
  allowedExtensions: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".mp4",
    ".webm",
    ".mov",
    ".mp3",
    ".wav",
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".csv",
    ".zip",
    ".rar",
  ],
  quarantineDir: path.join(process.cwd(), "quarantine"),
  safeDir: path.join(process.cwd(), "public", "secure-uploads"),
};
