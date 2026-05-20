import { chromium, Browser } from 'playwright';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface ScrapedProduct {
  name: string;
  price: number;
  url: string;
}

// Mercado Livre Scraper
export async function scrapeMercadoLivre(
  searchTerm: string
): Promise<ScrapedProduct[]> {
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const products: ScrapedProduct[] = [];

    const searchUrl = `https://lista.mercadolivre.com.br/${encodeURIComponent(
      searchTerm
    )}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle' });

    // Wait for products to load
    await page.waitForSelector('.ui-search-result', { timeout: 5000 });

    const items = await page.locator('.ui-search-result').all();

    for (let i = 0; i < Math.min(items.length, 10); i++) {
      try {
        const titleElement = await items[i].locator('.ui-search-item__title');
        const priceElement = await items[i].locator(
          '.ui-search-price__second-line .ui-search-price__fraction'
        );
        const linkElement = await items[i].locator('a.ui-search-link');

        const title = await titleElement.textContent();
        const priceText = await priceElement.textContent();
        const link = await linkElement.getAttribute('href');

        if (title && priceText && link) {
          const price = parseFloat(priceText.replace(/[^0-9,]/g, '').replace(',', '.'));
          products.push({
            name: title.trim(),
            price,
            url: link,
          });
        }
      } catch (error) {
        console.log(`Erro ao extrair produto ${i}`);
      }
    }

    console.log(`✅ Mercado Livre: ${products.length} produtos encontrados`);
    return products;
  } catch (error) {
    console.error('❌ Erro ao fazer scrape do Mercado Livre:', error);
    return [];
  } finally {
    await browser?.close();
  }
}

// Amazon Scraper
export async function scrapeAmazon(
  searchTerm: string
): Promise<ScrapedProduct[]> {
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const products: ScrapedProduct[] = [];

    const searchUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(
      searchTerm
    )}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle' });

    // Wait for products to load
    await page.waitForSelector('[data-component-type="s-search-result"]', {
      timeout: 5000,
    });

    const items = await page
      .locator('[data-component-type="s-search-result"]')
      .all();

    for (let i = 0; i < Math.min(items.length, 10); i++) {
      try {
        const titleElement = await items[i].locator('h2 a span');
        const priceElement = await items[i].locator(
          '.a-price-whole'
        );
        const linkElement = await items[i].locator('h2 a');

        const title = await titleElement.textContent();
        const priceText = await priceElement.textContent();
        const link = await linkElement.getAttribute('href');

        if (title && priceText && link) {
          const price = parseFloat(
            priceText.replace(/[^0-9,]/g, '').replace(',', '.')
          );
          products.push({
            name: title.trim(),
            price,
            url: `https://www.amazon.com.br${link}`,
          });
        }
      } catch (error) {
        console.log(`Erro ao extrair produto ${i}`);
      }
    }

    console.log(`✅ Amazon: ${products.length} produtos encontrados`);
    return products;
  } catch (error) {
    console.error('❌ Erro ao fazer scrape da Amazon:', error);
    return [];
  } finally {
    await browser?.close();
  }
}

// Shopee Scraper
export async function scrapeShopee(
  searchTerm: string
): Promise<ScrapedProduct[]> {
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const products: ScrapedProduct[] = [];

    const searchUrl = `https://shopee.com.br/search?keyword=${encodeURIComponent(
      searchTerm
    )}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle' });

    // Aguarda produtos carregarem
    await page.waitForSelector('div[role="button"][data-sqe="item"]', {
      timeout: 5000,
    });

    const items = await page
      .locator('div[role="button"][data-sqe="item"]')
      .all();

    for (let i = 0; i < Math.min(items.length, 10); i++) {
      try {
        const titleElement = await items[i].locator('div._1NoI8 > button');
        const priceElement = await items[i].locator(
          'span.sGHSqe'
        );

        const title = await titleElement.textContent();
        const priceText = await priceElement.textContent();

        if (title && priceText) {
          const price = parseFloat(
            priceText.replace(/[^0-9,]/g, '').replace(',', '.')
          );
          products.push({
            name: title.trim(),
            price,
            url: searchUrl,
          });
        }
      } catch (error) {
        console.log(`Erro ao extrair produto ${i}`);
      }
    }

    console.log(`✅ Shopee: ${products.length} produtos encontrados`);
    return products;
  } catch (error) {
    console.error('❌ Erro ao fazer scrape da Shopee:', error);
    return [];
  } finally {
    await browser?.close();
  }
}

// B2Brazil Scraper (Fast Fashion)
export async function scrapeB2Brazil(
  searchTerm: string
): Promise<ScrapedProduct[]> {
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const products: ScrapedProduct[] = [];

    const searchUrl = `https://www.b2brazil.com.br/search?q=${encodeURIComponent(
      searchTerm
    )}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle' });

    // Wait for products
    await page.waitForSelector('.product-item', { timeout: 5000 });

    const items = await page.locator('.product-item').all();

    for (let i = 0; i < Math.min(items.length, 10); i++) {
      try {
        const titleElement = await items[i].locator('.product-name');
        const priceElement = await items[i].locator('.product-price');
        const linkElement = await items[i].locator('a');

        const title = await titleElement.textContent();
        const priceText = await priceElement.textContent();
        const link = await linkElement.getAttribute('href');

        if (title && priceText && link) {
          const price = parseFloat(
            priceText.replace(/[^0-9,]/g, '').replace(',', '.')
          );
          products.push({
            name: title.trim(),
            price,
            url: `https://www.b2brazil.com.br${link}`,
          });
        }
      } catch (error) {
        console.log(`Erro ao extrair produto ${i}`);
      }
    }

    console.log(`✅ B2Brazil: ${products.length} produtos encontrados`);
    return products;
  } catch (error) {
    console.error('❌ Erro ao fazer scrape da B2Brazil:', error);
    return [];
  } finally {
    await browser?.close();
  }
}

// Kalunga Scraper (Office Supply)
export async function scrapeKalunga(
  searchTerm: string
): Promise<ScrapedProduct[]> {
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const products: ScrapedProduct[] = [];

    const searchUrl = `https://www.kalunga.com.br/busca?q=${encodeURIComponent(
      searchTerm
    )}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle' });

    // Wait for products
    await page.waitForSelector('.product-card', { timeout: 5000 });

    const items = await page.locator('.product-card').all();

    for (let i = 0; i < Math.min(items.length, 10); i++) {
      try {
        const titleElement = await items[i].locator('.product-title');
        const priceElement = await items[i].locator('.product-price');
        const linkElement = await items[i].locator('a');

        const title = await titleElement.textContent();
        const priceText = await priceElement.textContent();
        const link = await linkElement.getAttribute('href');

        if (title && priceText && link) {
          const price = parseFloat(
            priceText.replace(/[^0-9,]/g, '').replace(',', '.')
          );
          products.push({
            name: title.trim(),
            price,
            url: `https://www.kalunga.com.br${link}`,
          });
        }
      } catch (error) {
        console.log(`Erro ao extrair produto ${i}`);
      }
    }

    console.log(`✅ Kalunga: ${products.length} produtos encontrados`);
    return products;
  } catch (error) {
    console.error('❌ Erro ao fazer scrape da Kalunga:', error);
    return [];
  } finally {
    await browser?.close();
  }
}

// Save products to database
export async function saveProductsToDatabase(
  storeName: string,
  products: ScrapedProduct[]
): Promise<void> {
  try {
    // Get or create store
    let store = await prisma.store.findUnique({
      where: { name: storeName },
    });

    if (!store) {
      store = await prisma.store.create({
        data: {
          name: storeName,
          url: `https://www.${storeName.toLowerCase().replace(' ', '')}.com.br`,
        },
      });
    }

    // Process each product
    for (const product of products) {
      // Get or create product
      let dbProduct = await prisma.product.findFirst({
        where: {
          name: {
            contains: product.name.substring(0, 30),
            mode: 'insensitive',
          },
        },
      });

      if (!dbProduct) {
        dbProduct = await prisma.product.create({
          data: {
            name: product.name,
            description: `Encontrado em ${storeName}`,
          },
        });
      }

      // Create or update price
      await prisma.price.upsert({
        where: {
          productId_storeId: {
            productId: dbProduct.id,
            storeId: store.id,
          },
        },
        update: {
          price: product.price,
          url: product.url,
        },
        create: {
          productId: dbProduct.id,
          storeId: store.id,
          price: product.price,
          url: product.url,
        },
      });
    }

    console.log(`💾 ${products.length} produtos salvos no banco`);
  } catch (error) {
    console.error('Erro ao salvar produtos:', error);
  }
}
