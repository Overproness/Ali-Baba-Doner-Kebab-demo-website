'use strict';

// Demo prices in PKR for this pitch. Confirm the live branch menu before launch.
window.AliBabaMenu = [
  {
    id: 'wrap',
    name: 'The Chicken Döner Wrap',
    category: 'doner',
    favourite: true,
    image: 'doner-wrap.webp',
    tag: 'THE SIGNATURE',
    price: 1000,
    description: 'Tender chicken, crisp salad and signature sauces, all wrapped up in warm flatbread.',
    detail: 'Chicken döner, fresh vegetables and creamy sauces wrapped in warm flatbread. Toasted, generous and ready for that first bite.'
  },
  {
    id: 'platter',
    name: 'The Chicken Döner Platter',
    category: 'doner',
    favourite: true,
    image: 'doner-platter.webp',
    tag: 'GO ALL IN',
    price: 1500,
    description: 'Your döner favourites, unpacked. Chicken, fresh salad, golden fries and warm pita.',
    detail: 'A generous chicken döner platter with French fries, rice, salad and pita bread. A little of everything for the table.'
  },
  {
    id: 'pizza',
    name: 'Chicken Supreme Pizza',
    category: 'pizza',
    favourite: true,
    image: 'doner-pizza.webp',
    tag: 'A SLICE OF ALI BABA',
    price: 1800,
    description: 'Chicken tikka, peppers, mushrooms and olives under a golden layer of melted cheese.',
    detail: 'A golden pizza base with tomato sauce, mozzarella, chicken tikka, green peppers, mushrooms and olives. Made for a proper pizza night.'
  },
  {
    id: 'beef-burger',
    name: 'Ali Baba Special Beef Burger',
    category: 'burgers',
    favourite: true,
    image: 'beef-burger.webp',
    tag: 'THE BIG BITE',
    price: 1200,
    description: 'A beef patty, melted cheese, crisp salad and a fried egg. Bring your appetite.',
    detail: 'A beef patty stacked with melted cheese, lettuce, tomato and a fried egg, finished with burger sauce. A full-flavoured handful from the Ali Baba menu.'
  },
  {
    id: 'fries',
    name: 'Döner Loaded Fries',
    category: 'sides',
    favourite: true,
    image: 'loaded-fries.webp',
    tag: 'ON THE SIDE',
    price: 550,
    description: 'Golden fries topped with döner meat, fresh vegetables and a generous drizzle of sauce.',
    detail: 'French fries with seasoned döner meat, fresh vegetables and sauces. Add a portion to the table or keep the whole tray for yourself.'
  },
  {
    id: 'beef-wrap',
    name: 'Beef Döner Wrap',
    category: 'doner',
    favourite: false,
    image: 'beef-wrap.webp',
    tag: 'BEEF IT UP',
    price: 1150,
    description: 'Seasoned beef, fresh vegetables and plenty of sauce in a warm, toasted wrap.',
    detail: 'Grilled beef, crisp vegetables and savoury sauces, wrapped in soft flatbread. All the döner flavour in one satisfying bite.'
  },
  {
    id: 'mixed-wrap',
    name: 'Mixed Döner Wrap',
    category: 'doner',
    favourite: false,
    image: 'mixed-wrap.webp',
    tag: 'MIX THINGS UP',
    price: 1100,
    description: 'A mix of seasoned meats, crisp salad and creamy sauces, wrapped up together.',
    detail: 'Mixed döner meat with fresh vegetables and sauces in soft flatbread. A good choice when one filling is hard to choose.'
  },
  {
    id: 'chicken-pita',
    name: 'Chicken Döner Kebab',
    category: 'doner',
    favourite: false,
    image: 'chicken-pita.webp',
    tag: 'PITA PERFECTION',
    price: 950,
    description: 'Chicken döner tucked into bread with colourful salad and a tangy finishing sauce.',
    detail: 'Grilled chicken and fresh vegetables tucked into warm bread with a tangy sauce. A classic döner kebab from the restaurant menu.'
  },
  {
    id: 'falafel',
    name: 'Falafel Döner',
    category: 'doner',
    favourite: false,
    image: 'falafel.webp',
    tag: 'CRUNCH TIME',
    price: 750,
    description: 'Crispy chickpea falafel, fresh vegetables and tangy sauce tucked into warm pita.',
    detail: 'Spiced chickpea falafel served in pita with fresh vegetables and sauce. Ask the restaurant about ingredients and dietary requirements.'
  },
  {
    id: 'beef-pizza',
    name: 'Beef Döner Pizza',
    category: 'pizza',
    favourite: false,
    image: 'beef-pizza.webp',
    tag: 'DÖNER, BY THE SLICE',
    price: 1900,
    description: 'Sliced beef döner, mozzarella, onions, olives and tomatoes on a golden pizza base.',
    detail: 'Beef döner layered with mozzarella, onions, olives and tomatoes over tomato sauce. Two good cravings brought together in one pizza.'
  },
  {
    id: 'margherita',
    name: 'Margherita Pizza',
    category: 'pizza',
    favourite: false,
    image: 'margherita.webp',
    tag: 'KEEP IT CLASSIC',
    price: 1500,
    description: 'Rich tomato sauce and melted mozzarella. Sometimes simple is exactly right.',
    detail: 'A classic pizza with tomato sauce and mozzarella, baked until golden. A cheesy addition to any table.'
  },
  {
    id: 'chicken-burger',
    name: 'Chicken Burger',
    category: 'burgers',
    favourite: false,
    image: 'chicken-burger.webp',
    tag: 'STACKED WITH FLAVOUR',
    price: 1000,
    description: 'Grilled chicken, melted cheese, lettuce and tomato with our burger sauce.',
    detail: 'A grilled chicken patty topped with cheese, lettuce, tomato and burger sauce. The restaurant listing serves this burger with fries and a drink; confirm available serving options with your branch.'
  },
  {
    id: 'hummus',
    name: 'Hummus & Pita',
    category: 'sides',
    favourite: false,
    image: 'hummus.webp',
    tag: 'DIP RIGHT IN',
    price: 650,
    description: 'Creamy chickpea hummus with soft, warm pita. Made for dipping and sharing.',
    detail: 'Smooth chickpea hummus served with warm pita bread. Start with a dip while you decide what comes next.'
  },
  {
    id: 'mint',
    name: 'Mint Margarita',
    category: 'drinks',
    favourite: false,
    image: 'mint-margarita.webp',
    tag: 'SIP SOMETHING FRESH',
    price: 350,
    description: 'Cool, minty and refreshing. The perfect partner for a serious döner craving.',
    detail: 'A refreshing mint drink with an icy finish. A cool companion for wraps, pizzas and loaded fries.'
  },
  {
    id: 'colada',
    name: 'Piña Colada',
    category: 'drinks',
    favourite: false,
    image: 'pina-colada.webp',
    tag: 'A TROPICAL FINISH',
    price: 450,
    description: 'Pineapple and creamy coconut, blended into a refreshing tropical sip.',
    detail: 'A creamy pineapple and coconut refreshment from the restaurant drinks menu. Smooth, fruity and made for a leisurely sip.'
  }
];
