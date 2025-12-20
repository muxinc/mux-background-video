import { NextRequest, NextResponse } from 'next/server';

// URL to the Chromium binary package hosted in /public, if not in production, use a fallback URL
// alternatively, you can host the chromium-pack.tar file elsewhere and update the URL below
const CHROMIUM_PACK_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/chromium-pack.tar`
  : "https://github.com/gabenunez/puppeteer-on-vercel/raw/refs/heads/main/example/chromium-dont-use-in-prod.tar";

// Cache the Chromium executable path to avoid re-downloading on subsequent requests
let cachedExecutablePath: string | null = null;
let downloadPromise: Promise<string> | null = null;

/**
 * Downloads and caches the Chromium executable path.
 * Uses a download promise to prevent concurrent downloads.
 */
async function getChromiumPath(): Promise<string> {
  // Return cached path if available
  if (cachedExecutablePath) return cachedExecutablePath;

  // Prevent concurrent downloads by reusing the same promise
  if (!downloadPromise) {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    downloadPromise = chromium
      .executablePath(CHROMIUM_PACK_URL)
      .then((path) => {
        cachedExecutablePath = path;
        console.log("Chromium path resolved:", path);
        return path;
      })
      .catch((error) => {
        console.error("Failed to get Chromium path:", error);
        downloadPromise = null; // Reset on error to allow retry
        throw error;
      });
  }

  return downloadPromise;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const js = searchParams.get('js') === 'true';
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let browser;
    try {
      // Configure browser based on environment
      const isVercel = !!process.env.VERCEL_ENV;
      let puppeteer: any;
      let launchOptions: any = {
        headless: true,
      };
  
      if (isVercel) {
        // Vercel: Use puppeteer-core with downloaded Chromium binary
        const chromium = (await import("@sparticuz/chromium-min")).default;
        puppeteer = await import("puppeteer-core");
        const executablePath = await getChromiumPath();
        launchOptions = {
          ...launchOptions,
          args: chromium.args,
          executablePath,
        };
        console.log("Launching browser with executable path:", executablePath);
      } else {
        // Local: Use regular puppeteer with bundled Chromium
        puppeteer = await import("puppeteer");
      }
  
      // Launch browser and capture screenshot
      browser = await puppeteer.launch(launchOptions);

      const page = await browser.newPage();
      
      // Enable performance monitoring
      await page.setCacheEnabled(false);

      // Disable JavaScript
      await page.setJavaScriptEnabled(js);

      // Track response sizes using content-length header
      let totalSize = 0;
      const responseSizes = new Map<string, number>();

      // Listen to response events to capture content-length headers
      page.on('response', (response: any) => {
        try {
          const responseUrl = response.url();
          const urlObj = new URL(responseUrl);
          const pathname = urlObj.pathname.toLowerCase();
          
          // Get file extension from pathname
          const lastDotIndex = pathname.lastIndexOf('.');
          const extension = lastDotIndex !== -1 ? pathname.substring(lastDotIndex) : '';
          
          // Exclude m4s files (video segments)
          if (extension === '.m4s') {
            return;
          }

          // Get content-length header
          const contentLength = response.headers()['content-length'];
          if (contentLength) {
            const size = parseInt(contentLength, 10);
            if (!isNaN(size)) {
              // Avoid counting the same response multiple times (e.g., redirects)
              if (!responseSizes.has(responseUrl)) {
                responseSizes.set(responseUrl, size);
                totalSize += size;
              }
            }
          }
        } catch (error) {
          // If URL parsing fails, skip this response
          console.warn('Failed to parse response URL:', response.url());
        }
      });

      // Navigate to the page
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      await browser.close();

      return NextResponse.json(
        { size: totalSize },
        {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        }
      );
    } catch (error) {
      await browser.close();
      throw error;
    }
  } catch (error) {
    console.error('Error measuring page size:', error);
    return NextResponse.json(
      { error: 'Failed to measure page size' },
      { status: 500 }
    );
  }
}
