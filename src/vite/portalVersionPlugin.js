import { promises as fs } from 'fs';
import path from 'path';
import { loadEnv } from 'vite';
import useLx from '@/hooks/useLx';

/**
 * Generates the version data object
 * @returns {Promise<Object>} The version data
 */
async function generateVersionData() {
  try {
    const env = loadEnv(useLx().getGlobals()?.environment, process.cwd(), '');

    // Get package.json path
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    // Read package.json and extract version
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    return {
      version: env.CUSTOM_VERSION || packageJson.version,
      buildTime: new Date().toISOString(),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error generating version data:', error);
    return { version: 'unknown', buildTime: new Date().toISOString() };
  }
}

/**
 * @typedef {Object} PortalVersionOptions
 * @property {string} [outDir] - Custom output directory for version.json (defaults to vite build.outDir with fallback 'dist')
 */

/**
 * Creates a Vite plugin for version.json generation for both development and production
 * @param {PortalVersionOptions} [options] - Plugin options
 * @returns {import('vite').Plugin}
 */
export function lxVitePortalVersionPlugin(options = {}) {
  let outDir = 'dist';
  let config;
  // In-memory version data for development mode
  let versionData = null;

  /**
   * Generates the version.json file for production build
   */
  async function generateVersionFile() {
    try {
      // Get version data
      const data = await generateVersionData();

      // In build mode, write to output directory
      const targetDir = path.resolve(process.cwd(), outDir);

      // Ensure directory exists
      try {
        await fs.access(targetDir);
      } catch (error) {
        await fs.mkdir(targetDir, { recursive: true });
      }

      // Write version.json file
      const versionPath = path.resolve(targetDir, 'version.json');
      await fs.writeFile(versionPath, JSON.stringify(data, null, 2), 'utf-8');

      // eslint-disable-next-line no-console
      console.log(`✅ Version file generated at ${versionPath}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error generating version file:', error);
    }
  }

  return {
    name: 'vite-plugin-portal-version',

    configResolved(resolvedConfig) {
      // Store config for later use
      config = resolvedConfig;
      outDir = options.outDir || config.build?.outDir || 'dist';
    },

    // For development mode, initialize in-memory version data
    async buildStart() {
      if (config.command === 'serve') {
        versionData = await generateVersionData();
        // eslint-disable-next-line no-console
        console.log('✅ In-memory version data initialized:', versionData);
      }
    },

    // For production build, generate the physical file
    async closeBundle() {
      if (config.command === 'build') {
        await generateVersionFile();
      }
    },

    // In development, serve version.json from memory
    configureServer(server) {
      // Add a watcher to update in-memory version data when package.json changes
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');

      server.watcher.add(packageJsonPath);
      server.watcher.on('change', async (changedPath) => {
        if (changedPath === packageJsonPath) {
          versionData = await generateVersionData();
          // eslint-disable-next-line no-console
          console.log('📦 package.json changed, in-memory version data updated:', versionData);
        }
      });

      // Add special route to manually trigger version changes for testing
      server.middlewares.use(async (req, res, next) => {
        // Special route to update version for testing
        if (req.url === '/__update_version') {
          try {
            // Generate new version data with current timestamp
            versionData = await generateVersionData();
            // Force a different buildTime to simulate a version change
            versionData.buildTime = new Date().toISOString();
            // eslint-disable-next-line no-console
            console.log('🔄 Version manually updated for testing:', versionData);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                message: 'Version updated for testing',
                versionData,
              })
            );
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to update version' }));
          }
          return;
        }

        // Handle version.json requests during development
        if (req.url.startsWith('/version.json')) {
          try {
            // If version data isn't initialized yet, generate it
            if (!versionData) {
              versionData = await generateVersionData();
            }

            // Serve the in-memory version data with correct headers
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(versionData));
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error serving version.json:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to serve version.json' }));
          }
        } else {
          next();
        }
      });
    },
  };
}
