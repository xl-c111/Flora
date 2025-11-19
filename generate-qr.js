const QRCode = require("qrcode");

const url = "https://dzmu16crq41il.cloudfront.net";
const outputPath = "deployment-qr-code.png";

QRCode.toFile(
  outputPath,
  url,
  {
    width: 300,
    margin: 2,
    color: {
      dark: "#595e4e",
      light: "#FFFFFF",
    },
  },
  (err) => {
    if (err) {
      console.error("Error generating QR code:", err);
      process.exit(1);
    }
    console.log(`✅ QR code generated successfully: ${outputPath}`);
    console.log(`URL: ${url}`);
  }
);
