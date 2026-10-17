const fs = require('fs');
const path = require('path');

const DONATION_FILE = path.join(__dirname, 'donation.json');

const DEFAULT_DONATION = {
  qrImage: "/images/gallery/placeholder.jpg",
  qrInstructions: "Google Pay, PhonePe, Paytm, BHIM போன்ற செயலிகளைப் பயன்படுத்தி ஸ்கேன் செய்யவும்.",
  upiId: "temple@upi",
  upiInstructions: "மேலே உள்ள UPI ID-க்கு உங்களின் காணிக்கையைச் செலுத்தலாம்.",
  bankName: "CANARA BANK PORUR II BRANCH",
  accountName: "ARULMIGU MAHA KALIAMMAN THIRUKOIL TRUST",
  accountNumber: "61093070004810",
  ifscCode: "CNRB0016109",
  bankInstructions: "ரொக்கமாகவோ, அல்லது ARULMIGU MAHA KALIAMMAN THIRUKOIL TRUST என்ற பெயரில் காசோலையாகவோ / டிமாண்ட் டிராப்டாகவோ கொடுக்கலாம் அல்லது A/c No. 61093070004810 - CANARA BANK PORUR II BRANCH IFSC : CNRB0016109 என்ற வங்கி கணக்கிலும் செலுத்தலாம்."
};

function readDonation() {
  try {
    if (!fs.existsSync(DONATION_FILE)) {
      writeDonation(DEFAULT_DONATION);
      return DEFAULT_DONATION;
    }
    const data = fs.readFileSync(DONATION_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading donation.json:', error);
    return DEFAULT_DONATION;
  }
}

function writeDonation(data) {
  try {
    fs.writeFileSync(DONATION_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing donation.json:', error);
    return false;
  }
}

module.exports = {
  readDonation,
  writeDonation,
  DEFAULT_DONATION
};
