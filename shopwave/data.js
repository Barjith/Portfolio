// ── Product catalog data ──────────────────────────────────────────────────────
const PRODUCTS = [
  { id:1,  name:'Wireless Noise-Cancelling Headphones', price:79.99,  category:'Electronics', rating:4.8, reviews:245, badge:'Best Seller', emoji:'🎧', desc:'Premium sound with 30-hour battery life and active noise cancellation.' },
  { id:2,  name:'Smart Fitness Watch',                  price:129.99, category:'Electronics', rating:4.6, reviews:182, badge:'New',         emoji:'⌚', desc:'Track heart rate, steps, sleep, and 20+ workout modes.' },
  { id:3,  name:'Mechanical Keyboard',                  price:89.99,  category:'Electronics', rating:4.7, reviews:310, badge:null,          emoji:'⌨️', desc:'RGB backlit with tactile switches for the ultimate typing experience.' },
  { id:4,  name:'Portable Bluetooth Speaker',           price:49.99,  category:'Electronics', rating:4.5, reviews:198, badge:'Sale',        emoji:'🔊', desc:'360° sound, waterproof IPX7 rated, 12-hour playtime.' },
  { id:5,  name:'Running Shoes Pro',                    price:119.99, category:'Fashion',     rating:4.9, reviews:421, badge:'Best Seller', emoji:'👟', desc:'Lightweight foam sole with breathable mesh upper for all-day comfort.' },
  { id:6,  name:'Minimalist Leather Wallet',            price:34.99,  category:'Fashion',     rating:4.4, reviews:156, badge:null,          emoji:'👛', desc:'Slim RFID-blocking genuine leather wallet, fits 8 cards.' },
  { id:7,  name:'Sunglasses UV400',                     price:44.99,  category:'Fashion',     rating:4.3, reviews:89,  badge:'Sale',        emoji:'🕶️', desc:'Polarized lenses with UV400 protection and lightweight frame.' },
  { id:8,  name:'Backpack 30L',                         price:64.99,  category:'Fashion',     rating:4.6, reviews:203, badge:null,          emoji:'🎒', desc:'Durable water-resistant backpack with USB charging port and laptop sleeve.' },
  { id:9,  name:'Ceramic Coffee Mug Set',               price:24.99,  category:'Home',        rating:4.7, reviews:134, badge:'New',         emoji:'☕', desc:'Set of 4 handcrafted ceramic mugs, microwave and dishwasher safe.' },
  { id:10, name:'Scented Candle Collection',            price:29.99,  category:'Home',        rating:4.5, reviews:97,  badge:null,          emoji:'🕯️', desc:'Set of 3 soy wax candles with calming lavender and vanilla scents.' },
  { id:11, name:'Bamboo Desk Organizer',                price:39.99,  category:'Home',        rating:4.4, reviews:72,  badge:null,          emoji:'🪵', desc:'Eco-friendly bamboo organizer with 6 compartments for a clean desk.' },
  { id:12, name:'Plant Grow Kit',                       price:19.99,  category:'Home',        rating:4.8, reviews:161, badge:'Best Seller', emoji:'🌱', desc:'Everything you need to grow herbs indoors — seeds, soil, and pots included.' },
  { id:13, name:'JavaScript: The Good Parts',           price:22.99,  category:'Books',       rating:4.9, reviews:512, badge:null,          emoji:'📗', desc:'The definitive guide to JavaScript best practices by Douglas Crockford.' },
  { id:14, name:'Clean Code',                           price:27.99,  category:'Books',       rating:4.8, reviews:389, badge:'Best Seller', emoji:'📘', desc:'A handbook of agile software craftsmanship by Robert C. Martin.' },
  { id:15, name:'The Pragmatic Programmer',             price:25.99,  category:'Books',       rating:4.7, reviews:267, badge:null,          emoji:'📙', desc:'Your journey to mastery — timeless advice for software developers.' },
  { id:16, name:'Yoga Mat Premium',                     price:54.99,  category:'Sports',      rating:4.6, reviews:178, badge:'New',         emoji:'🧘', desc:'6mm thick non-slip mat with alignment lines and carry strap.' },
];

const CATEGORIES = ['All', ...new Set(PRODUCTS.map(p => p.category))];
