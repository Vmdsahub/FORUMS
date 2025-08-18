import { fileTypeFromBuffer } from "file-type";
import sanitize from "sanitize-filename";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { AdvancedSecurityAnalyzer, AdvancedAnalysisResult } from "./advancedAnalysis";

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
  private advancedAnalyzer: AdvancedSecurityAnalyzer;

  constructor(config: SecurityConfig) {
    this.config = config;
    this.advancedAnalyzer = new AdvancedSecurityAnalyzer();
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

      // Validate MIME type (more permissive)
    if (
      detectedType &&
      !this.config.allowedMimeTypes.includes(detectedType.mime)
    ) {
      result.isValid = false;
      result.reasons.push(`MIME type not allowed: ${detectedType.mime}`);
    }

    // Check for MIME type spoofing (more permissive for images and archives)
    if (detectedType) {
      const expectedMimeForExt = this.getMimeTypeForExtension(fileExt);
      if (expectedMimeForExt && expectedMimeForExt !== detectedType.mime) {
        // Be more permissive with image files (common to have jpg extension with png content)
        const isImageMismatch =
          this.isImageFile(fileExt) &&
          detectedType.mime.startsWith('image/');

        // Be more permissive with ZIP files (many different MIME types)
        const isZipMismatch =
          fileExt === '.zip' &&
          (detectedType.mime.includes('zip') || detectedType.mime === 'application/octet-stream');

        if (!isImageMismatch && !isZipMismatch) {
          result.isValid = false;
          result.reasons.push(
            `MIME type mismatch: expected ${expectedMimeForExt}, got ${detectedType.mime}`,
          );
        }
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

    // Get file extension for context-aware scanning
    const fileExt = path.extname(filename).toLowerCase();
    const isVideoFile = [".mp4", ".webm", ".mov", ".avi", ".mkv"].includes(fileExt);
    const isAudioFile = [".mp3", ".wav", ".ogg", ".m4a"].includes(fileExt);
    const isMediaFile = isVideoFile || isAudioFile;

    // Detect if this looks like a development project archive
    const isDevelopmentProject = this.isDevelopmentProject(filename, textContent);

    // Check suspicious filename patterns
    if (/\.(exe|scr|bat|cmd|com|pif|vbs|js|jar|app)$/i.test(filename)) {
      issues.push("Potentially dangerous file extension");
    }

    // Double extension check (more intelligent)
    const parts = filename.split(".");
    if (parts.length > 2) {
      // Check if it's a legitimate pattern
      const isLegitimate = this.isLegitimateMultipleExtension(filename);
      if (!isLegitimate) {
        issues.push("Multiple file extensions detected (potential masquerading)");
      }
    }

    // Scan content for malicious patterns (skip some patterns for media files and archives)
    for (const pattern of this.suspiciousPatterns) {
      // Skip JavaScript event handler patterns for all media files and images
      const isImageFile = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(fileExt);
      const isArchiveFile = ['.zip', '.rar', '.7z'].includes(fileExt);

      // Skip JavaScript patterns for media files, images, and development archives
      if ((isMediaFile || isImageFile || isArchiveFile || isDevelopmentProject) && pattern.source.includes("on\\w+\\s*=")) {
        continue;
      }

      // Skip script tags in binary files (common in metadata and legitimate web projects)
      if ((isImageFile || isArchiveFile || isDevelopmentProject) && pattern.source.includes("<script")) {
        continue;
      }

      // Skip JavaScript URL patterns in development archives (common in legitimate web projects)
      if ((isArchiveFile || isDevelopmentProject) && pattern.source.includes("javascript:")) {
        continue;
      }

      // Skip VBS script patterns in development projects (common in package.json scripts)
      if (isDevelopmentProject && pattern.source.includes("vbscript:")) {
        continue;
      }

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

    // Check for script tags in non-HTML files (but allow in development archives)
    const isArchiveFile = ['.zip', '.rar', '.7z'].includes(fileExt);
    if (!filename.match(/\.(html|htm|zip|rar|7z)$/i) && !isArchiveFile && /<script/gi.test(textContent)) {
      issues.push("Script tags found in non-HTML file");
    }

    // Check for macro indicators (but be more specific)
    if (/Microsoft Office.*Macro|VBA.*Project/gi.test(textContent) && !isArchiveFile) {
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

    if (buffer.length < 500 && buffer.includes(Buffer.from("PK"))) {
      // Very small ZIP file might be a zip bomb (reduced threshold for legitimate small projects)
      reasons.push("Potentially suspicious archive (very small file size)");
    }

    // Check for suspicious file names in ZIP header (more specific)
    const content = buffer.toString("binary");
    // Only flag dangerous executables, not common development files
    if (/\.(exe|scr|bat|cmd|com|pif|vbs)[\x00-\x20]/gi.test(content)) {
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
    return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff", ".svg"].includes(
      extension.toLowerCase(),
    );
  }

  private isArchiveFile(extension: string): boolean {
    return [".zip", ".rar", ".7z", ".tar", ".gz"].includes(
      extension.toLowerCase(),
    );
  }

  private isLegitimateMultipleExtension(filename: string): boolean {
    const parts = filename.split(".");

    // Allow common legitimate patterns
    const legitimatePatterns = [
      // Version numbers (e.g., project.v1.0.zip, app.2.1.exe)
      /\.\d+(\.\d+)*\./,
      // Common double extensions that are safe
      /\.(min|prod|dev|test|backup|temp|old|new)\./i,
      // Timestamps (e.g., backup.2024.01.15.zip)
      /\.\d{4}(\.\d{2}){2}\./,
      // Node.js patterns (e.g., config.local.js, webpack.prod.js)
      /\.(local|prod|dev|test|staging)\./i,
      // Common file patterns from development
      /\.(component|service|module|controller|model)\./i,
    ];

    // Check against legitimate patterns
    for (const pattern of legitimatePatterns) {
      if (pattern.test(filename)) {
        return true;
      }
    }

    // Special case: if the filename has many parts but ends with a safe extension
    // and doesn't contain dangerous patterns, it's probably legitimate
    const lastExtension = parts[parts.length - 1].toLowerCase();
    const safeExtensions = ['.zip', '.rar', '.7z', '.txt', '.json', '.js', '.css', '.html', '.md'];

    if (safeExtensions.includes('.' + lastExtension)) {
      // Check if any part contains dangerous extensions
      const dangerousExtensions = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com', 'vbs', 'jar'];
      const hasDangerousExtension = parts.some(part =>
        dangerousExtensions.includes(part.toLowerCase())
      );

      if (!hasDangerousExtension) {
        return true; // Legitimate multi-part filename
      }
    }

    return false;
  }

  private isDevelopmentProject(filename: string, content: string): boolean {
    // Check filename patterns that suggest development projects
    const devProjectPatterns = [
      /\b(app|project|webapp|website|client|frontend|backend|api)\b/i,
      /\b(react|vue|angular|node|express|next|nuxt)\b/i,
      /\b(src|components|pages|routes|controllers|models)\b/i,
    ];

    // Check content patterns that suggest legitimate web development
    const devContentPatterns = [
      /package\.json/i,
      /node_modules/i,
      /src\/components/i,
      /import.*from/i,
      /export.*default/i,
      /\.jsx?|\.tsx?|\.vue|\.css|\.scss/i,
      /webpack|vite|rollup|babel/i,
    ];

    // Check filename
    for (const pattern of devProjectPatterns) {
      if (pattern.test(filename)) {
        return true;
      }
    }

    // Check content
    for (const pattern of devContentPatterns) {
      if (pattern.test(content)) {
        return true;
      }
    }

    return false;
  }

  private getMimeTypeForExtension(ext: string): string | null {
    const mimeTypes: { [key: string]: string } = {
      // Images
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".tiff": "image/tiff",
      ".svg": "image/svg+xml",

      // Videos
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
      ".wmv": "video/x-ms-wmv",

      // Audio
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".m4a": "audio/mp4",
      ".ogg": "audio/ogg",

      // Documents
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".txt": "text/plain",
      ".csv": "text/csv",

      // Archives (flexible MIME type checking for ZIP)
      ".zip": "application/zip", // Primary, but will accept variants
      ".rar": "application/x-rar-compressed",
      ".7z": "application/x-7z-compressed",
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
  maxFileSize: 500 * 1024 * 1024, // 500MB (similar to Discord Nitro)
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/svg+xml",
    "video/mp4",
    "video/webm",
    "video/quicktime", // .mov files
    "video/x-msvideo", // .avi files
    "video/x-ms-wmv", // .wmv files
    "audio/mpeg",
    "audio/wav",
    "audio/mp4", // .m4a files
    "audio/ogg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/plain",
    "text/csv",
    // ZIP files - multiple MIME types
    "application/zip",
    "application/x-zip",
    "application/x-zip-compressed",
    "application/octet-stream", // Generic binary (used by some browsers for ZIP)
    // RAR and 7Z
    "application/x-rar-compressed",
    "application/vnd.rar", // Modern RAR MIME type
    "application/x-7z-compressed",
  ],
  allowedExtensions: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".tiff",
    ".svg",
    ".mp4",
    ".webm",
    ".mov",
    ".avi",
    ".wmv",
    ".m4a",
    ".mp3",
    ".wav",
    ".ogg",
    ".pdf",
    ".doc",
    ".docx",
    ".pptx",
    ".xlsx",
    ".txt",
    ".csv",
    ".zip",
    ".rar",
    ".7z",
  ],
  quarantineDir: path.join(process.cwd(), "quarantine"),
  safeDir: path.join(process.cwd(), "public", "secure-uploads"),
};
