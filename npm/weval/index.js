import { Buffer } from "node:buffer";
import { endianness } from "node:os";
import { fileURLToPath } from 'node:url';
import { dirname, join, parse } from 'node:path';
import { platform, arch } from "node:process";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

import decompress from 'decompress';
import decompressUnzip from 'decompress-unzip';
import decompressTar from 'decompress-tar';
import xz from '@napi-rs/lzma/xz';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TAG = "v0.3.2";

/**
 * Download Weval from GitHub releases
 *
 * @param {object} [opts]
 * @param {string} [opts.downloadDir] - Directory to which the binary should be downloaded
 * @returns {string} path to the downloaded binary on disk
 */
export async function getWeval(opts) {
    const knownPlatforms = {
      "win32 x64 LE": "x86_64-windows",
      "darwin arm64 LE": "aarch64-macos",
      "darwin x64 LE": "x86_64-macos",
      "linux x64 LE": "x86_64-linux",
      "linux arm64 LE": "aarch64-linux",
    };

    function getPlatformName() {
      let platformKey = `${platform} ${arch} ${endianness()}`;

      if (platformKey in knownPlatforms) {
        return knownPlatforms[platformKey];
      }
      throw new Error(`Unsupported platform: "${platformKey}". "weval does not have a precompiled binary for the platform/architecture you are using. You can open an issue on https://github.com/bytecodealliance/weval/issues to request for your platform/architecture to be included."`);
    }

    async function getJSON(url) {
      let resp;
      try {
        resp = await fetch(url);
        if (!resp.ok) {
          throw new Error("non 2xx response code");
        }
        return resp.json();
      } catch (err) {
        const errMsg = err?.toString() ?? 'unknown error';
        const msg = `failed to fetch JSON from URL [${url}] (status ${resp?.status}): ${errMsg}`;
        console.error(msg);
        throw new Error(msg);
      }
    }

    const platformName = getPlatformName();
    const assetSuffix = (platform == 'win32') ? 'zip' : 'tar.xz';
    const exeSuffix = (platform == 'win32') ? '.exe' : '';

    let downloadDir = opts && opts.downloadDir ? opts.downloadDir : __dirname;
    let exeDir = join(downloadDir, platformName);
    const exePath = join(exeDir, `weval${exeSuffix}`);

    // If we already have the executable installed, then return it
    if (existsSync(exePath)) {
      return exePath;
    }

    await mkdir(exeDir, { recursive: true });

    let releaseURL = `https://github.com/bytecodealliance/weval/releases/download/${TAG}/weval-${TAG}-${platformName}.tar.xz`;
    let data = await fetch(releaseURL);
    if (!data.ok) {
        console.error(`Error downloading ${asset.browser_download_url}`);
        process.exit(1);
    }
    let buf = await data.arrayBuffer();
    buf = await xz.decompress(new Uint8Array(buf));

    await decompress(Buffer.from(buf), exeDir, {
        // Remove the leading directory from the extracted file.
        strip: 1,
        plugins: [
            decompressUnzip(),
            decompressTar()
        ],
        // Only extract the binary file and nothing else
        filter: file => parse(file.path).base === `weval${exeSuffix}`,
    });

    return exePath;
}

export default getWeval;
