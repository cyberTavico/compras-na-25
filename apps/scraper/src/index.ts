import {
  scrapeMercadoLivre,
  scrapeAmazon,
  scrapeShopee,
  scrapeB2Brazil,
  scrapeKalunga,
  saveProductsToDatabase,
} from './scrapers';
import dotenv from 'dotenv';

dotenv.config();

const SEARCH_TERMS = [
  'notebook',
  'smartphone',
  'fone de ouvido',
  'webcam',
  'teclado',
];

async function runScrapers() {
  console.log('🕷️  Iniciando scrapers...');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log('---');

  for (const searchTerm of SEARCH_TERMS) {
    console.log(`\n🔍 Buscando: "${searchTerm}"`);

    try {
      // Mercado Livre
      console.log('\n📦 Mercado Livre...');
      const mlProducts = await scrapeMercadoLivre(searchTerm);
      await saveProductsToDatabase('Mercado Livre', mlProducts);

      // Amazon
      console.log('\n📦 Amazon...');
      const amazonProducts = await scrapeAmazon(searchTerm);
      await saveProductsToDatabase('Amazon', amazonProducts);

      // Shopee
      console.log('\n📦 Shopee...');
      const shopeeProducts = await scrapeShopee(searchTerm);
      await saveProductsToDatabase('Shopee', shopeeProducts);

      // B2Brazil
      console.log('\n📦 B2Brazil...');
      const b2Products = await scrapeB2Brazil(searchTerm);
      await saveProductsToDatabase('B2Brazil', b2Products);

      // Kalunga
      console.log('\n📦 Kalunga...');
      const kaluungaProducts = await scrapeKalunga(searchTerm);
      await saveProductsToDatabase('Kalunga', kaluungaProducts);
    } catch (error) {
      console.error(`Erro ao processar "${searchTerm}":`, error);
    }
  }

  console.log('\n---');
  console.log('✅ Scrapers finalizados!');
  process.exit(0);
}

runScrapers();
