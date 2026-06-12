const db = require('./server/config/db');

async function seedMotos() {
  try {
    // 1. Inserir categoria "Motos"
    await db.query(`
      INSERT INTO categories (name, slug, icon)
      VALUES ('Motos', 'motos', 'bike')
      ON CONFLICT (slug) DO NOTHING
    `);
    console.log('✅ Categoria "Motos" inserida');

    // 2. Inserir as duas motos
    const motos = [
      {
        title: 'Honda CB 500F',
        description: 'Moto naked esportiva Honda CB 500F com motor bicilíndrico de 471cc e 50 cv. Ideal para cidade e estrada, com excelente consumo e dirigibilidade. Perfeita para quem quer agilidade no trânsito com estilo.',
        category: 'motos',
        category_label: 'Motos',
        price_per_day: 120,
        price_per_week: 600,
        condition: 'excelente',
        location: 'São Paulo, SP',
        images: JSON.stringify(['assets/images/moto_naked.png']),
        rating: 4.8,
        rentals: 28,
        distance: 3.5,
        owner_id: 1
      },
      {
        title: 'Yamaha NMAX 160',
        description: 'Scooter Yamaha NMAX 160 automática com motor de 155cc e tecnologia VVA. Conforto premium com porta-malas espaçoso, painel digital e freios ABS. A melhor opção para mobilidade urbana.',
        category: 'motos',
        category_label: 'Motos',
        price_per_day: 80,
        price_per_week: 420,
        condition: 'excelente',
        location: 'São Paulo, SP',
        images: JSON.stringify(['assets/images/moto_scooter.png']),
        rating: 4.9,
        rentals: 45,
        distance: 2.1,
        owner_id: 1
      }
    ];

    for (const moto of motos) {
      await db.query(`
        INSERT INTO products (title, description, category, category_label, price_per_day, price_per_week, condition, location, images, rating, rentals, distance, owner_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        moto.title, moto.description, moto.category, moto.category_label,
        moto.price_per_day, moto.price_per_week, moto.condition, moto.location,
        moto.images, moto.rating, moto.rentals, moto.distance, moto.owner_id
      ]);
      console.log(`✅ Produto "${moto.title}" inserido`);
    }

    console.log('\n🏍️ Todas as motos foram adicionadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

seedMotos();
