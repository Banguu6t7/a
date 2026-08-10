import fs from "node:fs";
import path from "node:path";

export type DependencyKind = "production" | "development";

export type DependencyFindingSeverity =
  | "info"
  | "low"
  | "medium"
  | "high";

export interface DependencyFinding {
  packageName: string;
  requestedVersion: string;
  resolvedVersion: string | null;
  kind: DependencyKind;
  severity: DependencyFindingSeverity;
  reason: string;
  source: "package.json" | "package-lock.json";
}

export interface DependencyScanResult {
  ok: boolean;
  scannedAt: string;
  packageManager: "npm" | "unknown";
  projectName: string | null;
  projectVersion: string | null;
  totalDependencies: number;
  productionDependencies: number;
  developmentDependencies: number;
  lockfileVersion: number | null;
  findings: DependencyFinding[];
  warnings: string[];
}

interface PackageJson {
  name?: unknown;
  version?: unknown;
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
}

interface LockPackage {
  version?: unknown;
  resolved?: unknown;
  integrity?: unknown;
}

interface PackageLock {
  lockfileVersion?: unknown;
  packages?: Record<string, LockPackage>;
}

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function isPlainVersion(value: string): boolean {
  return /^[0-9]+\.[0-9]+\.[0-9]+$/.test(value);
}

function normalizeRequestedVersion(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function severityFor(
  requestedVersion: string,
  resolvedVersion: string | null,
): DependencyFindingSeverity {
  if (!resolvedVersion) {
    return "medium";
  }

  if (requestedVersion.startsWith("file:")) {
    return "low";
  }

  if (
    requestedVersion.startsWith("git+") ||
    requestedVersion.startsWith("github:") ||
    requestedVersion.startsWith("http://") ||
    requestedVersion.startsWith("https://")
  ) {
    return "medium";
  }

  if (isPlainVersion(requestedVersion)) {
    return requestedVersion === resolvedVersion ? "info" : "low";
  }

  return "info";
}

function packageLockEntry(
  lock: PackageLock,
  packageName: string,
): LockPackage | null {
  const packages = lock.packages;

  if (!packages) {
    return null;
  }

  const entry = packages[`node_modules/${packageName}`];

  return entry ?? null;
}

export function scanDependencies(
  rootDirectory: string = process.cwd(),
): DependencyScanResult {
  const packageJsonPath = path.join(rootDirectory, "package.json");
  const packageLockPath = path.join(rootDirectory, "package-lock.json");

  const packageJson = readJson<PackageJson>(packageJsonPath);

  const dependencies = packageJson.dependencies ?? {};
  const devDependencies = packageJson.devDependencies ?? {};

  let lock: PackageLock | null = null;
  const warnings: string[] = [];

  if (fs.existsSync(packageLockPath)) {
    try {
      lock = readJson<PackageLock>(packageLockPath);
    } catch {
      warnings.push("package-lock.json exists but could not be parsed.");
    }
  } else {
    warnings.push(
      "No package-lock.json was found. Resolved versions cannot be verified.",
    );
  }

  const findings: DependencyFinding[] = [];

  const scanGroup = (
    group: Record<string, unknown>,
    kind: DependencyKind,
  ) => {
    for (const [packageName, rawRequestedVersion] of Object.entries(group)) {
      const requestedVersion = normalizeRequestedVersion(rawRequestedVersion);

      const lockEntry = lock
        ? packageLockEntry(lock, packageName)
        : null;

      const resolvedVersion =
        typeof lockEntry?.version === "string"
          ? lockEntry.version
          : null;

      if (!requestedVersion) {
        findings.push({
          packageName,
          requestedVersion: "",
          resolvedVersion,
          kind,
          severity: "high",
          reason: "Dependency has an empty or invalid version declaration.",
          source: "package.json",
        });

        continue;
      }

      if (!lockEntry && lock) {
        findings.push({
          packageName,
          requestedVersion,
          resolvedVersion: null,
          kind,
          severity: "medium",
          reason:
            "Dependency is declared in package.json but no matching lockfile entry was found.",
          source: "package-lock.json",
        });

        continue;
      }

      const severity = severityFor(
        requestedVersion,
        resolvedVersion,
      );

      let reason = "Dependency declaration looks normal.";

      if (requestedVersion.startsWith("git+")) {
        reason =
          "Dependency is installed directly from a Git repository.";
      } else if (
        requestedVersion.startsWith("http://") ||
        requestedVersion.startsWith("https://")
      ) {
        reason =
          "Dependency is installed from a remote URL rather than a registry version.";
      } else if (requestedVersion.startsWith("file:")) {
        reason =
          "Dependency is loaded from a local filesystem path.";
      } else if (
        resolvedVersion &&
        isPlainVersion(requestedVersion) &&
        requestedVersion !== resolvedVersion
      ) {
        reason =
          "Declared exact version differs from the lockfile resolved version.";
      }

      findings.push({
        packageName,
        requestedVersion,
        resolvedVersion,
        kind,
        severity,
        reason,
        source: lockEntry ? "package-lock.json" : "package.json",
      });
    }
  };

  scanGroup(dependencies, "production");
  scanGroup(devDependencies, "development");

  return {
    ok: true,
    scannedAt: new Date().toISOString(),
    packageManager: "npm",
    projectName:
      typeof packageJson.name === "string"
        ? packageJson.name
        : null,
    projectVersion:
      typeof packageJson.version === "string"
        ? packageJson.version
        : null,
    totalDependencies:
      Object.keys(dependencies).length +
      Object.keys(devDependencies).length,
    productionDependencies: Object.keys(dependencies).length,
    developmentDependencies: Object.keys(devDependencies).length,
    lockfileVersion:
      typeof lock?.lockfileVersion === "number"
        ? lock.lockfileVersion
        : null,
    findings,
    warnings,
  };
}
