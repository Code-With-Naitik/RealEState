const fs = require('fs');
fs.renameSync('src/components/Contact.jsx', 'src/components/ContactTemp.jsx');
fs.renameSync('src/components/ContactTemp.jsx', 'src/components/Contact.jsx');
console.log('Renamed Contact.jsx successfully.');
