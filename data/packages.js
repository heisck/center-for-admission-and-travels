export const travelPackages = [
  {
    id: 1,
    name: 'Dubai Experience',
    category: 'travel',
    duration: '6 Days / 5 Nights',
    price: 1299,
    description: 'Discover the perfect blend of ultramodern luxury and Arabian heritage in the City of Gold. Experience world-class attractions, pristine beaches, and authentic cultural experiences.',
    highlights: [
      'Burj Khalifa - World\'s tallest building with breathtaking city views',
      'Desert Safari - Thrilling dune adventure with camel ride and sunset',
      'Dhow Cruise Dinner - Traditional sailing experience along Dubai Marina',
      'Dubai Mall & Gold Souk - Shopping and cultural exploration',
      'Palm Jumeirah - Iconic artificial island and beach relaxation',
      'Spice Market - Authentic Arabian culture and cuisine',
    ],
    images: [
      '/dubai-burj-khalifa-city-skyline.jpg',
      '/dubai-burj-khalifa-city-skyline.jpg',
      '/dubai-burj-khalifa-city-skyline.jpg',
    ],
    itinerary: `
      Day 1: Arrival & Hotel Check-in
      Welcome to Dubai. Transfer to your 4-star hotel, settle in, and enjoy an evening at Jumeirah Beach.

      Day 2: City Exploration
      Morning visit to Burj Khalifa (Level 124), afternoon at Dubai Mall, evening at Dubai Fountain show. Traditional Emirati dinner at a local restaurant.

      Day 3: Desert Adventure
      Experience the iconic Dubai desert safari with dune bashing, camel ride, and spectacular sunset. Enjoy BBQ dinner under the stars with traditional entertainment.

      Day 4: Water & Culture
      Morning at Aquaventure Water Park or Palm Jumeirah beach. Evening Dhow Cruise along Dubai Marina with dinner and entertainment.

      Day 5: Shopping & Heritage
      Explore Gold Souk in Old Dubai, traditional spice market, and Dubai Heritage Museum. Visit Emirates Mall for luxury shopping. Evening at Souk al-Bahar.

      Day 6: Leisure & Departure
      Final morning at leisure for last-minute shopping or relaxation. Afternoon transfer to airport for departure.
    `,
    included: [
      '5 nights accommodation in 4-star hotel',
      'Daily breakfast',
      'Airport transfers',
      'Burj Khalifa ticket',
      'Desert safari with dinner',
      'Dhow cruise with dinner',
      'Guided city tour',
      'Travel insurance',
    ],
    notIncluded: [
      'International flights',
      'Visa (if required)',
      'Personal expenses',
      'Additional meals',
    ],
  },
  {
    id: 2,
    name: 'Europe Multi-City',
    category: 'travel',
    duration: '10 Days / 9 Nights',
    price: 1899,
    description: 'Experience the charm and elegance of three iconic European cities. From Paris\'s romance to Amsterdam\'s canals to Rome\'s ancient history, create unforgettable memories across the continent.',
    highlights: [
      'Paris - Eiffel Tower, Louvre Museum, and charming neighborhoods',
      'Amsterdam - Canal tours, Anne Frank House, and windmills',
      'Rome - Colosseum, Vatican City, and ancient ruins',
      'Local cuisine and wine tasting experiences',
      'Professional guided tours of major attractions',
      'Comfortable transportation between cities',
    ],
    images: [
      '/europe-paris-eiffel-tower-landmarks.jpg',
      '/europe-paris-eiffel-tower-landmarks.jpg',
      '/europe-paris-eiffel-tower-landmarks.jpg',
    ],
    itinerary: `
      Days 1-3: Paris
      Arrive in Paris and settle into your 4-star hotel. Day 2: Visit Eiffel Tower, Champs-Élysées, Arc de Triomphe. Day 3: Louvre Museum, Notre-Dame, Seine river cruise. Traditional French dinner.

      Days 4-6: Amsterdam
      Train journey to Amsterdam (3 hours). Canal house tour and Anne Frank House. Windmills at Zaanse Schans. Cheese and flower markets. Bike tour through the city.

      Days 7-9: Rome
      Flight to Rome. Colosseum and Roman Forum guided tour. Vatican City and Sistine Chapel. Spanish Steps and Trevi Fountain. Traditional Italian cooking class and dinner.

      Day 10: Departure
      Final morning for personal exploration. Transfer to airport for your return journey.
    `,
    included: [
      '9 nights accommodation in 4-star hotels',
      'Daily breakfast',
      'Airport transfers',
      'Train Paris-Amsterdam',
      'Flight Amsterdam-Rome',
      'All major attraction tickets',
      'Professional guides',
      'Travel insurance',
    ],
    notIncluded: [
      'International flights to Europe',
      'Visas (if required)',
      'Meals except breakfast',
      'Personal shopping and expenses',
    ],
  },
  {
    id: 3,
    name: 'Asia Cultural Tour',
    category: 'travel',
    duration: '12 Days / 11 Nights',
    price: 1499,
    description: 'Immerse yourself in the vibrant colors, flavors, and cultures of Southeast Asia. Discover ancient temples, tropical islands, bustling markets, and warm hospitality across multiple countries.',
    highlights: [
      'Thailand - Bangkok temples and Phuket beaches',
      'Cambodia - Angkor Wat ancient temple complex',
      'Vietnam - Hanoi culture and Ha Long Bay cruise',
      'Island beach relaxation and water activities',
      'Traditional massage and wellness experiences',
      'Street food tours and cooking classes',
      'Authentic cultural encounters with local communities',
    ],
    images: [
      '/asia-tropical-beaches-thailand-temples.jpg',
      '/asia-tropical-beaches-thailand-temples.jpg',
      '/asia-tropical-beaches-thailand-temples.jpg',
    ],
    itinerary: `
      Days 1-3: Thailand (Bangkok)
      Arrive in Bangkok. Visit Grand Palace, Temple of the Emerald Buddha, and Wat Pho. Traditional Thai massage. Street food tour in local night markets.

      Days 4-6: Thailand (Phuket)
      Beach resort days in Phuket. Island hopping tour to Phang Nga Bay. Snorkeling and water activities. Traditional Thai cooking class. Sunset beach dinner.

      Days 7-8: Cambodia (Siem Reap)
      Flight to Cambodia. Explore the magnificent Angkor Wat temple complex at sunrise. Visit local village and floating markets. Traditional Khmer massage.

      Days 9-11: Vietnam (Hanoi & Ha Long Bay)
      Flight to Vietnam. Hanoi city tour including Old Quarter and Temple of Literature. Ha Long Bay cruise with overnight on boat. Limestone karst exploration and kayaking.

      Day 12: Departure
      Return to Hanoi airport for departure or extend your journey.
    `,
    included: [
      '11 nights accommodation',
      'Daily breakfast',
      'All domestic flights',
      'Airport transfers',
      'All tour activities and guides',
      'Ha Long Bay overnight cruise',
      'Meals as specified in itinerary',
      'Travel insurance',
    ],
    notIncluded: [
      'International flights',
      'Visas (if required)',
      'Travel insurance upgrade',
      'Personal expenses and shopping',
    ],
  },
  {
    id: 4,
    name: 'USA City Explorer',
    category: 'travel',
    duration: '8 Days / 7 Nights',
    price: 1699,
    description: 'Explore the diversity and energy of America\'s most iconic cities. From New York\'s skyscrapers to the liberty and monuments of Washington, experience the American spirit and culture.',
    highlights: [
      'New York - Times Square, Statue of Liberty, Broadway shows',
      'Washington DC - National museums and monuments',
      'Philadelphia - Historic Independence Hall and Liberty Bell',
      'Niagara Falls - Natural wonder and sightseeing cruise',
      'Top-rated restaurants and authentic American cuisine',
      'Shopping on Fifth Avenue and local markets',
      'Evening entertainment and guided tours',
    ],
    images: [
      '/statue-of-liberty-nyc.png',
      '/statue-of-liberty-nyc.png',
      '/canada-niagara-falls-toronto-city.jpg',
    ],
    itinerary: `
      Days 1-3: New York City
      Arrive in New York. Day 2: Statue of Liberty and Ellis Island ferry, Brooklyn Bridge walk, Times Square evening. Day 3: Central Park tour, Empire State Building or One World Observatory, Broadway show in the evening.

      Days 4-5: Philadelphia & Niagara Falls
      Train to Philadelphia. Visit Independence Hall and Liberty Bell. Drive to Niagara Falls for a scenic boat tour. Evening at the falls with illumination show.

      Days 6-7: Washington DC
      Flight to Washington DC. Day 6: Smithsonian museums (your choice), Lincoln Memorial, White House exterior tour. Day 7: Capitol Hill tour, Martin Luther King Jr. Memorial, National monuments.

      Day 8: Departure
      Morning flight back or additional exploration time depending on flight schedules.
    `,
    included: [
      '7 nights accommodation in 4-star hotels',
      'Daily breakfast',
      'Airport transfers',
      'Train tickets (Philadelphia route)',
      'Domestic flight to DC',
      'Statue of Liberty and Niagara Falls tours',
      'Museum entrance fees',
      'Professional guided tours',
      'Travel insurance',
    ],
    notIncluded: [
      'International flights',
      'Visa (if required)',
      'Broadway show tickets (optional)',
      'Meals except breakfast',
      'Personal shopping',
    ],
  },
];

export const packagesByCategory = (category) => {
  return travelPackages.filter(pkg => pkg.category === category);
};

export const getPackageById = (id) => {
  return travelPackages.find(pkg => pkg.id === Number(id));
};
