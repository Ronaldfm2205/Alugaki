const fs = require('fs');
const path = require('path');
const db = require('./server/config/db');

async function seed() {
  const images = [
    { name: 'liquidificador', file: 'liquidificador_1781234491360.png' },
    { name: 'aspirador_po', file: 'aspirador_po_1781234500557.png' },
    { name: 'cortador_grama', file: 'cortador_grama_1781234512629.png' },
    { name: 'rocadeira', file: 'rocadeira_1781234529583.png' },
    { name: 'suv_compacto', file: 'suv_compacto_1781234543085.png' },
    { name: 'carro_hatch', file: 'carro_hatch_1781234553297.png' },
  ];

  const sourceDir = 'C:\\Users\\ferna\\.gemini\\antigravity-ide\\brain\\503c1005-e926-4e66-af5c-c59d36904b7e';
  const destDir = path.join(__dirname, 'assets', 'images');

  // Copy images
  for (const img of images) {
    const src = path.join(sourceDir, img.file);
    const destName = `${img.name}.png`;
    const dest = path.join(destDir, destName);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${img.file} to assets/images/${destName}`);
    } else {
      console.log(`Source not found: ${src}`);
    }
  }

  // Define new products
  const products = [
    {
      title: 'Liquidificador Turbo',
      description: 'Liquidificador potente com 1200W, jarra de vidro resistente e 5 velocidades. Ideal para sucos, vitaminas e receitas diversas. Limpeza fácil.',
      category: 'eletrodomesticos',
      category_label: 'Eletrodomésticos',
      price_per_day: 15,
      condition: 'como-novo',
      location: 'Centro, SP',
      images: ['assets/images/liquidificador.png'],
      owner_id: 1 // Default owner
    },
    {
      title: 'Aspirador de Pó Vertical',
      description: 'Aspirador de pó vertical e portátil, muito prático para limpezas rápidas. Filtro HEPA, silencioso e leve.',
      category: 'eletrodomesticos',
      category_label: 'Eletrodomésticos',
      price_per_day: 25,
      condition: 'excelente',
      location: 'Vila Mariana, SP',
      images: ['assets/images/aspirador_po.png'],
      owner_id: 1
    },
    {
      title: 'Cortador de Grama a Gasolina',
      description: 'Cortador de grama a gasolina com motor de 6.5 HP. Ideal para grandes áreas, possui regulagem de altura e cesto recolhedor.',
      category: 'jardinagem',
      category_label: 'Jardinagem',
      price_per_day: 50,
      condition: 'excelente',
      location: 'Morumbi, SP',
      images: ['assets/images/cortador_grama.png'],
      owner_id: 1
    },
    {
      title: 'Roçadeira Profissional',
      description: 'Roçadeira profissional a gasolina, ideal para mato alto e acabamentos de jardim. Acompanha cinto ergonômico e lâmina.',
      category: 'jardinagem',
      category_label: 'Jardinagem',
      price_per_day: 40,
      condition: 'bom',
      location: 'Granja Viana, SP',
      images: ['assets/images/rocadeira.png'],
      owner_id: 1
    },
    {
      title: 'SUV Compacto Premium',
      description: 'Aluguel de SUV compacto automático (modelo Jeep Renegade ou similar). Ar condicionado, direção elétrica, multimídia e muito conforto para sua viagem.',
      category: 'carros',
      category_label: 'Carros',
      price_per_day: 180,
      condition: 'excelente',
      location: 'Aeroporto Congonhas, SP',
      images: ['assets/images/suv_compacto.png'],
      owner_id: 1
    },
    {
      title: 'Carro Hatch Econômico',
      description: 'Aluguel de carro hatch econômico (Chevrolet Onix ou similar). Ar condicionado, Bluetooth e muito econômico no combustível.',
      category: 'carros',
      category_label: 'Carros',
      price_per_day: 100,
      condition: 'excelente',
      location: 'Centro, SP',
      images: ['assets/images/carro_hatch.png'],
      owner_id: 1
    }
  ];

  // Insert into DB
  try {
    for (const prod of products) {
      // First check if a user with ID 1 exists, if not, we need a valid user ID. 
      // Let's get the first user ID
      const userRes = await db.query('SELECT id FROM users LIMIT 1');
      if (userRes.rows.length > 0) {
        prod.owner_id = userRes.rows[0].id;
      }

      await db.query(`
        INSERT INTO products (
          title, description, category, price_per_day, price_per_week, 
          condition, location, images, owner_id, category_label
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        prod.title, prod.description, prod.category, prod.price_per_day, prod.price_per_day * 6,
        prod.condition, prod.location, JSON.stringify(prod.images), prod.owner_id,
        prod.category_label
      ]);
      console.log(`Inserted product: ${prod.title}`);
    }
    console.log('✅ All products inserted successfully!');
  } catch (error) {
    console.error('Error inserting products:', error);
  }

  process.exit();
}

seed();
