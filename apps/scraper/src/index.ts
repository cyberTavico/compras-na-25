import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function scrapeStores() {
  const browser = await chromium.launch();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  try {
    console.log('🕷️ Starting scraper...');

    // Example: scrape a store (configure your actual store)
    // await page.goto('https://example-store.com');
    // const products = await page.locator('.product-item').count();
    // console.log(`Found ${products} products`);

    console.log('✅ Scraping completed');
  } catch (error) {
    console.error('❌ Scraping error:', error);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

scrapeStores();
