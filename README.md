# AgriBridge Professional Prototype

This package implements the requested AgriBridge flow:
- Working Welcome → Continue → Role Selection
- Customer/Farmer/Collection Hub/Delivery Boy roles
- Phone number authentication UI
- Customer Buy Produce, Cart, Review & Place Order, payment-success demo, My Orders and tracking
- Back buttons to return to the Customer Dashboard
- Farmer products/orders
- Collection Hub farmer-wise order consolidation
- Packing and delivery tracking
- Delivery Boy accept → Out for Delivery → Delivered
- Packing charge ₹5/order
- Normal delivery charge ₹5/km (demo distance = 1 km)
- Express delivery adds ₹20 in this prototype
- Responsive mobile-friendly UI

The demo stores data in browser localStorage so it works immediately.

For real production use, replace the demo localStorage authentication/database with Firebase Authentication + Firestore and apply server-side payment verification. Do not place a Firebase service-account private key in frontend code.

Firebase Hosting:
1. Install Firebase CLI: npm install -g firebase-tools
2. firebase login
3. firebase init hosting
4. Select your Firebase project.
5. Set the public directory to this folder and use index.html as the entry.
6. firebase deploy
