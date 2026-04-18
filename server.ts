import express from "express";
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const app = express();
const PORT: number = 3000;
const DATA_PATH: string = path.join(__dirname, "data.json");
const PUBLIC_PATH: string = path.join(__dirname, "public");

interface User {
  username: string;
  password: string;
  email: string;
  role: string;
  blocked?: boolean;
  failedAttempts?: number;
}

interface AppData {
  accounts: User[];
}

const c = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
  cyan:    "\x1b[36m",
  green:   "\x1b[32m",
  yellow:  "\x1b[33m",
  blue:    "\x1b[34m",
  magenta: "\x1b[35m",
  red:     "\x1b[31m",
  white:   "\x1b[37m",
  gray:    "\x1b[90m",
};

// ─── LOGGER ───────────────────────────────────────────
function printBanner(): void {
  console.log();
  console.log(`${c.cyan}${c.bold}  ██╗  ██╗███████╗██╗      ██████╗ ███╗   ███╗██████╗  ██████╗ ██╗  ██╗${c.reset}`);
  console.log(`${c.cyan}${c.bold}  ██║ ██╔╝██╔════╝██║     ██╔═══██╗████╗ ████║██╔══██╗██╔═══██╗██║ ██╔╝${c.reset}`);
  console.log(`${c.cyan}${c.bold}  █████╔╝ █████╗  ██║     ██║   ██║██╔████╔██║██████╔╝██║   ██║█████╔╝ ${c.reset}`);
  console.log(`${c.cyan}${c.bold}  ██╔═██╗ ██╔══╝  ██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║   ██║██╔═██╗ ${c.reset}`);
  console.log(`${c.cyan}${c.bold}  ██║  ██╗███████╗███████╗╚██████╔╝██║ ╚═╝ ██║██║     ╚██████╔╝██║  ██╗${c.reset}`);
  console.log(`${c.cyan}${c.bold}  ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝${c.reset}`);
  console.log();
  console.log(`${c.gray}  ┌─────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.gray}  │${c.reset}  ${c.bold}Kelompok 3${c.reset} — Express TypeScript Server              ${c.gray}│${c.reset}`);
  console.log(`${c.gray}  │${c.reset}  ${c.dim}v1.0.0  •  Node ${process.version}  •  ${os.platform()}/${os.arch()}${c.reset}              ${c.gray}│${c.reset}`);
  console.log(`${c.gray}  └─────────────────────────────────────────────────────┘${c.reset}`);
  console.log();
}

function printRoutes(): void {
  const routes: { method: string; path: string; desc: string; color: string }[] = [
    { method: "GET",  path: "/",      desc: "Halaman utama (index.htm)",     color: c.green },
    { method: "GET",  path: "/info",  desc: "Info sistem & hardware server",  color: c.green },
    { method: "GET", path: "/kalkulator", desc: "Halaman Kalkulator", color: c.red },
    // { method: "POST", path: "/login", desc: "Login akun (maks 3x percobaan)", color: c.yellow },
  ];

  console.log(`${c.bold}  ROUTES${c.reset}`);
  console.log(`${c.gray}  ${"─".repeat(52)}${c.reset}`);

  for (const r of routes) {
    const method  = `${r.color}${c.bold}${r.method.padEnd(6)}${c.reset}`;
    const route   = `${c.white}${r.path.padEnd(10)}${c.reset}`;
    const desc    = `${c.dim}${r.desc}${c.reset}`;
    console.log(`  ${method}  ${route}  ${desc}`);
  }

  console.log(`${c.gray}  ${"─".repeat(52)}${c.reset}`);
  console.log();
}

function printReady(): void {
  console.log(`  ${c.green}${c.bold}▶  Server berjalan${c.reset}`);
  console.log();
  console.log(`     ${c.gray}Local :${c.reset}  ${c.cyan}${c.bold}http://localhost:${PORT}${c.reset}`);
  console.log(`     ${c.gray}Info  :${c.reset}  ${c.cyan}http://localhost:${PORT}/info${c.reset}`);
  console.log();
  console.log(`  ${c.dim}Tekan Ctrl+C untuk menghentikan server${c.reset}`);
  console.log();
}

// ─── MIDDLEWARE ───────────────────────────────────────
app.use(express.json());
app.use(express.static(PUBLIC_PATH));

// Optional: request logger
app.use((req: Request, _res: Response, next) => {
  const time  = new Date().toLocaleTimeString("id-ID");
  const method = req.method === "GET"  ? `${c.green}${req.method}${c.reset}`
               : req.method === "POST" ? `${c.yellow}${req.method}${c.reset}`
               : `${c.magenta}${req.method}${c.reset}`;
  console.log(`  ${c.gray}[${time}]${c.reset}  ${method}  ${c.white}${req.path}${c.reset}`);
  next();
});

// ─── ROUTES ───────────────────────────────────────────

app.get("/", (_req: Request, res: Response): void => {
  res.sendFile(path.join(PUBLIC_PATH, "index.htm"));
});

app.get("/kalkulator", (_req: Request, res: Response): void => {
  res.sendFile(path.join(PUBLIC_PATH, "kalkulator.htm"));
});

app.get("/info", (_req: Request, res: Response): void => {
  try {
    const cpus = os.cpus();
    const firstCpu = cpus[0];

    const systemInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      release:  os.release(),
      arch:     os.arch(),
      uptime:   os.uptime(),
      cpu:      firstCpu ? firstCpu.model : "Unknown",
      cores:    cpus.length,
      memory: {
        total: os.totalmem(),
        free:  os.freemem(),
      },
      loadavg:  os.loadavg(),
      network:  os.networkInterfaces(),
    };

    res.json(systemInfo);
  } catch (_error: unknown) {
    res.status(500).json({ error: "Gagal mengambil informasi sistem" });
  }
});

// ─── DATA HANDLER ─────────────────────────────────────

function getData(): AppData {
  if (!fs.existsSync(DATA_PATH)) {
    const initialData: AppData = { accounts: [] };
    fs.writeFileSync(DATA_PATH, JSON.stringify(initialData, null, 2));
  }
  const raw: string = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as AppData;
}

function saveData(data: AppData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// ─── LOGIN ────────────────────────────────────────────

app.post("/login", (req: Request, res: Response): void => {
  const body: { username?: string; password?: string } = req.body;
  const username: string | undefined = body.username;
  const password: string | undefined = body.password;

  if (!username || !password) {
    res.json({ success: false, message: "Wajib isi semua field" });
    return;
  }

  const data: AppData = getData();
  const user: User | undefined = data.accounts.find((u: User) => u.username === username);

  if (!user) {
    res.json({ success: false, code: "NOT_FOUND", message: "Akun tidak ditemukan" });
    return;
  }

  if (user.blocked === true) {
    res.json({ success: false, code: "BLOCKED", message: "Akun diblokir" });
    return;
  }

  if (user.password !== password) {
    const attempts: number = (user.failedAttempts ?? 0) + 1;
    user.failedAttempts = attempts;

    if (attempts >= 3) {
      user.blocked = true;
      saveData(data);
      res.json({ success: false, code: "BLOCKED_NOW", failedAttempts: attempts });
      return;
    }

    saveData(data);
    res.json({ success: false, code: "WRONG_PASSWORD", failedAttempts: attempts, sisa: 3 - attempts });
    return;
  }

  user.failedAttempts = 0;
  saveData(data);

  res.json({
    success: true,
    user: { username: user.username, role: user.role, email: user.email },
  });
});

app.listen(PORT, (): void => {
  printBanner();
  printRoutes();
  printReady();
});