import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Demo Users
  const passwordHashAdmin = await bcrypt.hash("admin123", 10);
  const passwordHashUser = await bcrypt.hash("user123", 10);
  const passwordHashReviewer = await bcrypt.hash("reviewer123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@shoesy.demo" },
    update: {
      role: Role.ADMIN,
      name: "Demo Admin",
      username: "admin",
      password: passwordHashAdmin,
    },
    create: {
      email: "admin@shoesy.demo",
      username: "admin",
      name: "Demo Admin",
      password: passwordHashAdmin,
      role: Role.ADMIN,
    },
  });

  const demoCustomer = await prisma.user.upsert({
    where: { email: "user@shoesy.demo" },
    update: {
      role: Role.USER,
      name: "Demo User",
      username: "user",
      password: passwordHashUser,
    },
    create: {
      email: "user@shoesy.demo",
      username: "user",
      name: "Demo User",
      password: passwordHashUser,
      role: Role.USER,
    },
  });

  // Additional review authors
  const reviewer1 = await prisma.user.upsert({
    where: { email: "chetan@example.com" },
    update: {},
    create: {
      email: "chetan@example.com",
      username: "chetan_bhati",
      name: "Chetan Bhati",
      password: passwordHashReviewer,
      role: Role.USER,
    },
  });

  const reviewer2 = await prisma.user.upsert({
    where: { email: "gaurav@example.com" },
    update: {},
    create: {
      email: "gaurav@example.com",
      username: "gaurav_g",
      name: "Gaurav Gauda",
      password: passwordHashReviewer,
      role: Role.USER,
    },
  });

  const reviewer3 = await prisma.user.upsert({
    where: { email: "shubham@example.com" },
    update: {},
    create: {
      email: "shubham@example.com",
      username: "shubham_b",
      name: "Shubham Bhandarkar",
      password: passwordHashReviewer,
      role: Role.USER,
    },
  });

  const reviewer4 = await prisma.user.upsert({
    where: { email: "ved@example.com" },
    update: {},
    create: {
      email: "ved@example.com",
      username: "ved_wadekar",
      name: "Ved Wadekar",
      password: passwordHashReviewer,
      role: Role.USER,
    },
  });

  const reviewers = [demoCustomer, reviewer1, reviewer2, reviewer3, reviewer4];

  // 2. Seed Categories
  const categoriesData = [
    { name: "Basketball", slug: "basketball", image: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=600&q=80" },
    { name: "Running", slug: "running", image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=600&q=80" },
    { name: "Lifestyle", slug: "lifestyle", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80" },
    { name: "Tennis", slug: "tennis", image: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=600&q=80" },
    { name: "Skateboarding", slug: "skateboarding", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80" },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const saved = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, image: cat.image },
      create: cat,
    });
    categoryMap.set(cat.slug, saved.id);
  }

  // 3. Seed 26 Realistic Shoes
  const productsData = [
    // NIKE
    {
      name: "Nike Air Jordan 1 Retro High OG",
      slug: "nike-air-jordan-1-retro-high-og",
      description: "Iconic high-top basketball sneaker engineered with genuine full-grain leather, encapsulated Air-Sole cushioning, and the legendary Wings insignia on the collar.",
      price: 16995.0,
      brand: "Nike",
      categorySlug: "basketball",
      images: [
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10, 11],
      colors: ["Chicago Red/White/Black", "University Blue"],
      stock: 18,
      featured: true,
      reviews: [
        { rating: 5, comment: "Absolute holy grail of sneakers! Premium leather quality and timeless aesthetic." },
        { rating: 5, comment: "Fits true to size. Looks stunning in person with jeans or joggers." },
      ],
    },
    {
      name: "Nike Air Jordan 1 Mid SE",
      slug: "nike-air-jordan-1-mid-se",
      description: "Mid-top silhouette built with rich suede overlays, signature swoosh branding, and a padded mid-cut collar for everyday support and off-court swagger.",
      price: 11495.0,
      brand: "Nike",
      categorySlug: "basketball",
      images: [
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [6, 7, 8, 9, 10, 11],
      colors: ["Smoke Grey/Black", "Triple White"],
      stock: 24,
      featured: true,
      reviews: [
        { rating: 4, comment: "Great alternative to the high tops. Very comfortable for daily wear." },
        { rating: 5, comment: "Clean silhouette, zero break-in period required." },
      ],
    },
    {
      name: "Nike Air Force 1 '07",
      slug: "nike-air-force-1-07",
      description: "The radiance lives on in the Nike Air Force 1 '07, the basketball b-ball icon that puts a fresh spin on crisp leather overlays and clean stitched styling.",
      price: 8195.0,
      brand: "Nike",
      categorySlug: "lifestyle",
      images: [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [6, 7, 8, 9, 10, 11],
      colors: ["Triple White", "Black/White"],
      stock: 35,
      featured: true,
      reviews: [
        { rating: 5, comment: "Classic sneaker that literally matches every single outfit. A wardrobe essential." },
        { rating: 4, comment: "A little stiff at first but once broken in, super plush." },
        { rating: 5, comment: "Crisp white look is unbeatable. Shipped fast." },
      ],
    },
    {
      name: "Nike Dunk Low Retro",
      slug: "nike-dunk-low-retro",
      description: "Created for the hardwood but taken to the streets, the Dunk Low returns with crisp leather overlays and original team color-blocking.",
      price: 8695.0,
      brand: "Nike",
      categorySlug: "lifestyle",
      images: [
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10],
      colors: ["Black/White Panda", "University Blue"],
      stock: 12,
      featured: false,
      reviews: [
        { rating: 5, comment: "The Panda colorway never misses. Super sleek." },
        { rating: 4, comment: "Great street style shoe." },
      ],
    },
    {
      name: "Nike Pegasus 40",
      slug: "nike-pegasus-40",
      description: "Responsive road-running workhorse featuring dual Zoom Air units and React foam for an energizing, springy ride across any distance.",
      price: 10495.0,
      brand: "Nike",
      categorySlug: "running",
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10, 11],
      colors: ["Volt Red", "Black/Pure Platinum"],
      stock: 22,
      featured: false,
      reviews: [
        { rating: 5, comment: "Clocked over 100km on these already. Supreme arch support and responsiveness." },
        { rating: 5, comment: "Breathable mesh upper keeps feet cool in summer runs." },
      ],
    },
    {
      name: "Nike Court Vision Low Next Nature",
      slug: "nike-court-vision-low-next-nature",
      description: "In love with the classic look of '80s basketball? Meet the Court Vision Low, made with at least 20% recycled materials by weight.",
      price: 4995.0,
      brand: "Nike",
      categorySlug: "lifestyle",
      images: [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [6, 7, 8, 9, 10],
      colors: ["White/Black", "White/Game Royal"],
      stock: 19,
      featured: false,
      reviews: [
        { rating: 4, comment: "Great budget retro sneaker. Very good value for money." },
      ],
    },

    // ADIDAS
    {
      name: "Adidas Ultraboost Light",
      slug: "adidas-ultraboost-light",
      description: "Experience epic energy return with the lightest Ultraboost yet, featuring 30% lighter Light BOOST material and supportive PRIMEKNIT+ upper.",
      price: 18999.0,
      brand: "Adidas",
      categorySlug: "running",
      images: [
        "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10, 11],
      colors: ["Core Black", "Cloud White/Solar Red"],
      stock: 15,
      featured: true,
      reviews: [
        { rating: 5, comment: "Walking on clouds! Hands down the most comfortable running shoes in my rotation." },
        { rating: 5, comment: "Continental rubber outsole grips wet tarmac with zero slip." },
      ],
    },
    {
      name: "Adidas Forum Low CL",
      slug: "adidas-forum-low-cl",
      description: "Rooted in hardwood history, this low-profile iteration strips back the ankle strap for a versatile, casual lifestyle silhouette wrapped in soft nubuck.",
      price: 9999.0,
      brand: "Adidas",
      categorySlug: "lifestyle",
      images: [
        "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10],
      colors: ["Chalk White/Collegiate Green", "Off White/Navy"],
      stock: 20,
      featured: true,
      reviews: [
        { rating: 4, comment: "Super clean retro vibe. High quality leather lining." },
        { rating: 5, comment: "Got plenty of compliments. Pairs nicely with oversized pants." },
      ],
    },
    {
      name: "Adidas Campus 00s",
      slug: "adidas-campus-00s",
      description: "Chunky skate proportions inspired by the turn of the millennium, crafted with plush suede, bold contrast 3-Stripes, and thick puffy laces.",
      price: 10999.0,
      brand: "Adidas",
      categorySlug: "skateboarding",
      images: [
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [6, 7, 8, 9, 10, 11],
      colors: ["Core Black/Footwear White", "Grey Three"],
      stock: 14,
      featured: false,
      reviews: [
        { rating: 5, comment: "The chunky skate trend done right. Extra laces in the box was a great bonus." },
      ],
    },
    {
      name: "Adidas Samba OG",
      slug: "adidas-samba-og",
      description: "Born on the pitch, this sneaker is an undisputed indoor soccer icon featuring a soft leather upper, suede T-toe cap, and gum rubber sole.",
      price: 10999.0,
      brand: "Adidas",
      categorySlug: "lifestyle",
      images: [
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [6, 7, 8, 9, 10, 11],
      colors: ["Cloud White/Core Black/Gum", "Core Black/Cloud White"],
      stock: 9,
      featured: true,
      reviews: [
        { rating: 5, comment: "The hottest shoe on the planet right now. Looks sleek and minimalist." },
        { rating: 4, comment: "Order half a size up if you have wide feet." },
      ],
    },
    {
      name: "Adidas Stan Smith Lux",
      slug: "adidas-stan-smith-lux",
      description: "The timeless court shoe elevated with ultra-soft buttery leather, perforated 3-Stripes, and metallic gold foil stamping.",
      price: 11999.0,
      brand: "Adidas",
      categorySlug: "tennis",
      images: [
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10],
      colors: ["Off White/Green", "Cloud White/Gold"],
      stock: 17,
      featured: false,
      reviews: [
        { rating: 5, comment: "The leather quality on the Lux edition is unmatched." },
      ],
    },
    {
      name: "Adidas Grand Court 2.0",
      slug: "adidas-grand-court-20",
      description: "Tennis-inspired everyday sneaker featuring Cloudfoam Comfort sockliner cushioning and synthetic leather upper.",
      price: 4599.0,
      brand: "Adidas",
      categorySlug: "tennis",
      images: [
        "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [6, 7, 8, 9, 10],
      colors: ["Cloud White/Black"],
      stock: 28,
      featured: false,
      reviews: [
        { rating: 4, comment: "Affordable and solid for college and daily walking." },
      ],
    },

    // PUMA
    {
      name: "Puma Palermo Leather",
      slug: "puma-palermo-leather",
      description: "A tribute to Sicilian heritage, the Palermo low-profile terrace sneaker features a T-toe construction, golden foil branding, and a gum sole.",
      price: 7999.0,
      brand: "Puma",
      categorySlug: "lifestyle",
      images: [
        "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10],
      colors: ["Cobalt Blue/White", "Feather Gray"],
      stock: 16,
      featured: true,
      reviews: [
        { rating: 5, comment: "Terrace fashion at its absolute best. Extremely comfortable shoe bed." },
        { rating: 5, comment: "Love the vibrant retro colors." },
      ],
    },
    {
      name: "Puma RS-X Efekt",
      slug: "puma-rs-x-efekt",
      description: "Futuristic chunky runner powered by Puma's Running System (RS) technology, layered with mesh, suede, and angular TPU accents.",
      price: 9999.0,
      brand: "Puma",
      categorySlug: "running",
      images: [
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10, 11],
      colors: ["Triple White", "Glacial Blue/Orange"],
      stock: 21,
      featured: false,
      reviews: [
        { rating: 4, comment: "Eye-catching chunky look. Super plush underfoot cushioning." },
        { rating: 4, comment: "A little bulky but great street presence." },
      ],
    },
    {
      name: "Puma Suede Classic XXI",
      slug: "puma-suede-classic-xxi",
      description: "The silhouette that revolutionized b-boy culture and street fashion in 1968, constructed with premium all-suede upper and synthetic lining.",
      price: 6999.0,
      brand: "Puma",
      categorySlug: "lifestyle",
      images: [
        "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [6, 7, 8, 9, 10, 11],
      colors: ["High Risk Red/White", "Black/White"],
      stock: 30,
      featured: false,
      reviews: [
        { rating: 5, comment: "Timeless classic that never goes out of style. The suede is very soft." },
      ],
    },
    {
      name: "Puma Rebound V6 High",
      slug: "puma-rebound-v6-high",
      description: "Basketball-DNA high top silhouette featuring synthetic leather upper, supportive ankle padding, and SoftFoam+ comfort insert.",
      price: 5499.0,
      brand: "Puma",
      categorySlug: "basketball",
      images: [
        "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10, 11],
      colors: ["Black/Red/White", "White/Royal Blue"],
      stock: 18,
      featured: false,
      reviews: [
        { rating: 4, comment: "Great ankle support when playing casual court games." },
      ],
    },
    {
      name: "Puma Club 5V5",
      slug: "puma-club-5v5",
      description: "Soccer-inspired low tops fusing vintage football culture with urban streetwear elements and low-profile vulcanized rubber tooling.",
      price: 4999.0,
      brand: "Puma",
      categorySlug: "lifestyle",
      images: [
        "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [6, 7, 8, 9, 10],
      colors: ["White/Peacoat Navy", "Black/Gold"],
      stock: 25,
      featured: false,
      reviews: [
        { rating: 4, comment: "Very lightweight and stylish for casual office wear." },
      ],
    },

    // ASICS
    {
      name: "Asics GEL-Kayano 30",
      slug: "asics-gel-kayano-30",
      description: "Revolutionary stability running shoe equipped with the 4D GUIDANCE SYSTEM, PureGEL rearfoot technology, and ultra-plush FF BLAST PLUS ECO cushioning.",
      price: 15999.0,
      brand: "Asics",
      categorySlug: "running",
      images: [
        "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10, 11],
      colors: ["Black/Glow Yellow", "White/Deep Ocean"],
      stock: 14,
      featured: true,
      reviews: [
        { rating: 5, comment: "Game-changer for overpronators! Finished a half marathon without any knee discomfort." },
        { rating: 5, comment: "Softest stability shoe I have ever owned. Truly top tier engineering." },
      ],
    },
    {
      name: "Asics GEL-Resolution 9",
      slug: "asics-gel-resolution-9",
      description: "High-performance tennis shoe with DYNAWALL technology for lateral stability during fast baseline transitions and AHARPLUS court durability.",
      price: 12999.0,
      brand: "Asics",
      categorySlug: "tennis",
      images: [
        "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10],
      colors: ["Restful Teal/Safety Yellow", "White/Amethyst"],
      stock: 16,
      featured: false,
      reviews: [
        { rating: 5, comment: "Best hard court tennis shoe hands down. Incredible lock-in feeling." },
      ],
    },
    {
      name: "Asics Novablast 4",
      slug: "asics-novablast-4",
      description: "Bouncy trampoline-inspired geometric midsole powered by FF BLAST PLUS ECO foam delivers explosive toe-offs and plush daily mile munching.",
      price: 13999.0,
      brand: "Asics",
      categorySlug: "running",
      images: [
        "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10, 11],
      colors: ["Illusion Blue/Glow Yellow", "Black/Amber"],
      stock: 20,
      featured: true,
      reviews: [
        { rating: 5, comment: "So much fun to run in! The energy return makes speed runs feel effortless." },
        { rating: 5, comment: "Looks aggressive and performs even better." },
      ],
    },
    {
      name: "Asics GEL-1130",
      slug: "asics-gel-1130",
      description: "Y2K runner revival blending retro mesh aesthetics with GEL unit shock absorption and TRUSSTIC support system for city adventures.",
      price: 8999.0,
      brand: "Asics",
      categorySlug: "lifestyle",
      images: [
        "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [6, 7, 8, 9, 10],
      colors: ["White/Clay Grey", "Oatmeal/Mink"],
      stock: 11,
      featured: false,
      reviews: [
        { rating: 5, comment: "Insanely stylish dad shoe aesthetic. Super comfortable for 15,000+ step days." },
      ],
    },
    {
      name: "Asics GEL-Dedicate 8",
      slug: "asics-gel-dedicate-8",
      description: "Reliable, supportive tennis shoe engineered with forefoot GEL cushioning and synthetic leather toe overlays for stability and confidence.",
      price: 5999.0,
      brand: "Asics",
      categorySlug: "tennis",
      images: [
        "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10],
      colors: ["White/Island Blue"],
      stock: 22,
      featured: false,
      reviews: [
        { rating: 4, comment: "Durable and affordable. Great grip on clay and hard surfaces." },
      ],
    },

    // NEW BALANCE
    {
      name: "New Balance 550",
      slug: "new-balance-550",
      description: "Simple & clean, not overbuilt. Tribute to the 1989 basketball legend that defined a hoops generation, crafted with heavy-duty leather upper.",
      price: 11999.0,
      brand: "New Balance",
      categorySlug: "basketball",
      images: [
        "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10, 11],
      colors: ["White/Green", "White/Navy"],
      stock: 13,
      featured: true,
      reviews: [
        { rating: 5, comment: "Top-notch retro look. Very sturdy build and solid ankle stability." },
        { rating: 4, comment: "Takes a couple wears to break in the thick leather, but worth it." },
      ],
    },
    {
      name: "New Balance 9060",
      slug: "new-balance-9060",
      description: "Experimental expression of classic 99X series styling with Y2K visible tech aesthetics, dual-density ABZORB and SBS cushioning pod midsole.",
      price: 15999.0,
      brand: "New Balance",
      categorySlug: "lifestyle",
      images: [
        "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10],
      colors: ["Rain Cloud/Grey", "Sea Salt/Concrete"],
      stock: 10,
      featured: true,
      reviews: [
        { rating: 5, comment: "Unbelievable comfort and distinctive sculptural aesthetic. My current favorite pair." },
      ],
    },
    {
      name: "New Balance 574 Core",
      slug: "new-balance-574-core",
      description: "The most New Balance shoe ever. Reliable, unpretentious, versatile hybrid road/trail design with ENCAP midsole cushioning.",
      price: 7999.0,
      brand: "New Balance",
      categorySlug: "lifestyle",
      images: [
        "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [6, 7, 8, 9, 10, 11],
      colors: ["Grey/White", "Navy/White"],
      stock: 29,
      featured: false,
      reviews: [
        { rating: 5, comment: "The iconic grey 574 is unmatched. Wore them all day at a music festival without sore feet." },
      ],
    },
    {
      name: "New Balance Fresh Foam X 1080v13",
      slug: "new-balance-fresh-foam-x-1080v13",
      description: "Pinnacle plush cushioning with Fresh Foam X midsole foam delivering seamless transitions and engineered breathable mesh upper.",
      price: 16999.0,
      brand: "New Balance",
      categorySlug: "running",
      images: [
        "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1000&q=80",
      ],
      sizes: [7, 8, 9, 10, 11],
      colors: ["Starlight/Marine Blue", "Triple Black"],
      stock: 15,
      featured: false,
      reviews: [
        { rating: 5, comment: "Maximum cushioning without feeling heavy. Great for marathon training." },
      ],
    },
  ];

  console.log(`📦 Upserting ${productsData.length} products...`);

  for (const item of productsData) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) {
      console.warn(`Category slug ${item.categorySlug} not found for product ${item.name}`);
      continue;
    }

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        brand: item.brand,
        categoryId: categoryId,
        images: item.images,
        sizes: item.sizes,
        colors: item.colors,
        stock: item.stock,
        featured: item.featured,
      },
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        brand: item.brand,
        categoryId: categoryId,
        images: item.images,
        sizes: item.sizes,
        colors: item.colors,
        stock: item.stock,
        featured: item.featured,
      },
    });

    // Seed Reviews idempotently
    // Delete existing reviews for this product to avoid duplicates on re-seed
    await prisma.review.deleteMany({
      where: { productId: product.id },
    });

    for (let i = 0; i < item.reviews.length; i++) {
      const reviewData = item.reviews[i];
      const reviewer = reviewers[i % reviewers.length];

      await prisma.review.create({
        data: {
          productId: product.id,
          userId: reviewer.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        },
      });
    }
  }

  // 4. Seed ~30 Demo Orders Spread Across the Last 30 Days (Idempotent)
  console.log("🛒 Seeding ~30 realistic demo orders spread over the last 30 days...");

  const allProducts = await prisma.product.findMany();
  if (allProducts.length > 0) {
    const customers = [
      { id: demoCustomer.id, name: "Demo User", email: "user@shoesy.demo", phone: "+91 98765 43210", city: "Bengaluru", state: "Karnataka", postalCode: "560001", street: "42 Sneaker Lane, MG Road" },
      { id: reviewer1.id, name: "Chetan Bhati", email: "chetan@example.com", phone: "+91 98111 22334", city: "Mumbai", state: "Maharashtra", postalCode: "400050", street: "12 Linking Road, Bandra West" },
      { id: reviewer2.id, name: "Gaurav Gauda", email: "gaurav@example.com", phone: "+91 98222 33445", city: "New Delhi", state: "Delhi", postalCode: "110001", street: "88 Connaught Place, Block C" },
      { id: reviewer3.id, name: "Shubham Bhandarkar", email: "shubham@example.com", phone: "+91 98333 44556", city: "Pune", state: "Maharashtra", postalCode: "411004", street: "15 FC Road, Shivaji Nagar" },
      { id: reviewer4.id, name: "Ved Wadekar", email: "ved@example.com", phone: "+91 98444 55667", city: "Hyderabad", state: "Telangana", postalCode: "500081", street: "23 Hitec City Main Rd, Madhapur" },
    ];

    const orderStatuses = [
      "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED",
      "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED",
      "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED",
      "SHIPPED", "SHIPPED", "SHIPPED", "SHIPPED", "SHIPPED",
      "PROCESSING", "PROCESSING", "PROCESSING", "PROCESSING",
      "PENDING", "PENDING", "PENDING",
      "CANCELLED", "CANCELLED",
    ] as const;

    const paymentMethods = [
      "COD", "RAZORPAY", "COD", "RAZORPAY", "COD",
      "COD", "RAZORPAY", "COD", "RAZORPAY", "COD",
      "COD", "RAZORPAY", "COD", "COD", "RAZORPAY", "COD",
      "RAZORPAY", "COD", "RAZORPAY", "COD", "COD",
      "RAZORPAY", "COD", "RAZORPAY", "COD",
      "COD", "RAZORPAY", "COD",
      "RAZORPAY", "COD",
    ] as const;

    const baseNow = new Date();

    for (let i = 1; i <= 30; i++) {
      const orderNumber = `ORD-DEMO-${String(i).padStart(3, "0")}`;
      const existing = await prisma.order.findUnique({
        where: { orderNumber },
      });

      if (existing) {
        continue;
      }

      const status = orderStatuses[i - 1];
      const paymentMethod = paymentMethods[i - 1];
      const customer = customers[(i - 1) % customers.length];

      // Distribute creation dates smoothly across 0 to 29 days ago
      const daysAgo = 29 - Math.floor(((i - 1) * 29) / 29);
      const hoursAgo = (i * 3) % 24;
      const orderCreatedAt = new Date(baseNow.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000));

      let paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" = "COMPLETED";
      if (status === "CANCELLED") {
        paymentStatus = paymentMethod === "RAZORPAY" ? "REFUNDED" : "FAILED";
      } else if (status === "PENDING") {
        paymentStatus = "PENDING";
      } else if (status === "PROCESSING" && paymentMethod === "COD") {
        paymentStatus = "PENDING";
      }

      // Pick 1 to 2 products
      const p1 = allProducts[(i * 3) % allProducts.length];
      const hasSecondItem = i % 4 === 0;
      const p2 = hasSecondItem ? allProducts[(i * 3 + 1) % allProducts.length] : null;

      const p1Size = p1.sizes[(i + 1) % p1.sizes.length] || 9;
      const p1Qty = i % 7 === 0 ? 2 : 1;
      const p1Price = Number(p1.price);

      const itemsToCreate = [
        {
          productId: p1.id,
          name: p1.name,
          price: p1Price,
          size: p1Size,
          quantity: p1Qty,
          image: p1.images[0] || "",
        },
      ];

      let totalAmount = p1Price * p1Qty;

      if (p2) {
        const p2Size = p2.sizes[i % p2.sizes.length] || 10;
        const p2Qty = 1;
        const p2Price = Number(p2.price);
        itemsToCreate.push({
          productId: p2.id,
          name: p2.name,
          price: p2Price,
          size: p2Size,
          quantity: p2Qty,
          image: p2.images[0] || "",
        });
        totalAmount += p2Price * p2Qty;
      }

      await prisma.order.create({
        data: {
          orderNumber,
          userId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          shippingAddress: {
            street: customer.street,
            city: customer.city,
            state: customer.state,
            postalCode: customer.postalCode,
            country: "India",
          },
          totalAmount,
          status,
          paymentMethod,
          paymentStatus,
          createdAt: orderCreatedAt,
          items: {
            create: itemsToCreate,
          },
        },
      });
    }

    console.log("🛒 Seeded 30 realistic demo orders across 30 days");
  }

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e instanceof Error ? e.name : "UnknownError");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
